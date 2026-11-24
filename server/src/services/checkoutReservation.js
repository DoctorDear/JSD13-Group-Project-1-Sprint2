import { Product } from "../models/Product.model.js";
import { resolvePersonalizationTemplate } from "../lib/personalizationTemplate.js";
import { pricePersonalization } from "../lib/personalization.js";

const normalizedNumber = (value) =>
  value === undefined || value === null ? null : String(value);

function failure(status, message) {
  return { ok: false, status, message };
}

/**
 * Restore product stock for any items held during an aborted checkout attempt
 * and clear the reservation list in place.
 */
export async function rollbackReservedStock(reserved, ProductModel = Product) {
  for (const held of reserved) {
    await ProductModel.findByIdAndUpdate(held.productId, {
      $inc: { quantity: held.quantity },
    });
  }
  reserved.length = 0;
}

function validateBaseItem({ product, quantity, baseUnitPrice, mode }) {
  if (mode === "stripe") {
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isSafeInteger(Math.round(baseUnitPrice * 100)) ||
      baseUnitPrice <= 0 ||
      product.quantity < quantity
    ) {
      return failure(400, "An item is unavailable or invalid");
    }
    return null;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return failure(400, "Invalid product quantity");
  }
  if (product.quantity < quantity) {
    return failure(400, `Insufficient stock for product: ${product.name}`);
  }
  return null;
}

/**
 * Validate cart or retry items, compute authoritative personalization pricing
 * in a single Product lookup per item, and atomically reserve stock.
 */
export async function reserveAndPriceItems(sourceItems, options = {}) {
  const {
    mode = "cod",
    preservePricing = false,
    includeCartItemId = false,
    deps = {},
  } = options;
  const {
    ProductModel = Product,
    resolveTemplate = resolvePersonalizationTemplate,
    priceItem = pricePersonalization,
  } = deps;

  const items = [];

  // Pass 1: Load each product once, validate availability, and resolve pricing.
  for (const sourceItem of sourceItems) {
    const prodId =
      sourceItem.productId && sourceItem.productId._id
        ? sourceItem.productId._id
        : sourceItem.productId;

    if (!prodId) {
      return failure(
        400,
        mode === "stripe"
          ? "An item is unavailable or invalid"
          : "Invalid product reference in cart",
      );
    }

    const product = await ProductModel.findById(prodId);
    if (!product || product.isActive === false) {
      return mode === "stripe"
        ? failure(400, "An item is unavailable or invalid")
        : failure(404, "Product not found");
    }

    const quantity = Number(sourceItem.quantity);
    const baseUnitPrice = preservePricing
      ? Number(sourceItem.price)
      : Number(product.price);

    const validationError = validateBaseItem({
      product,
      quantity,
      baseUnitPrice,
      mode,
    });
    if (validationError) return validationError;

    const item = {
      productId: product._id,
      ...(includeCartItemId ? { cartItemId: sourceItem._id } : {}),
      sku: product.sku,
      name: product.name,
      price: baseUnitPrice,
      size: sourceItem.size || product.size,
      quantity,
      customName: sourceItem.customName || "",
      customNumber: normalizedNumber(sourceItem.customNumber),
      sleeveBadge: sourceItem.sleeveBadge || "none",
      namePrice: sourceItem.namePrice ?? 0,
      numberPrice: sourceItem.numberPrice ?? 0,
      badgePrice: sourceItem.badgePrice ?? 0,
    };

    if (!preservePricing) {
      const template = await resolveTemplate(product);
      const hasPrintChoices = Boolean(item.customName || item.customNumber !== null);
      if (!template && (hasPrintChoices || item.sleeveBadge !== "none")) {
        return failure(400, "Personalization is not available for this product");
      }

      const priced = template
        ? priceItem({
            product,
            template,
            printEnabled: hasPrintChoices,
            customName: item.customName,
            customNumber: item.customNumber,
            sleeveBadge: item.sleeveBadge,
          })
        : {
            customName: "",
            customNumber: null,
            namePrice: 0,
            numberPrice: 0,
            sleeveBadge: "none",
            badgePrice: 0,
            unitPrice: product.price,
          };

      if (!priced) {
        return failure(
          400,
          mode === "stripe"
            ? "An item has invalid personalization choices"
            : "Invalid personalization choices",
        );
      }

      Object.assign(item, {
        price: priced.unitPrice,
        customName: priced.customName,
        customNumber: priced.customNumber,
        sleeveBadge: priced.sleeveBadge,
        namePrice: priced.namePrice,
        numberPrice: priced.numberPrice,
        badgePrice: priced.badgePrice,
      });
    }

    items.push(item);
  }

  // Pass 2: Atomically decrement stock and roll back prior holds on failure.
  const reserved = [];
  let totalAmount = 0;

  for (const item of items) {
    const updated = await ProductModel.findOneAndUpdate(
      { _id: item.productId, quantity: { $gte: item.quantity } },
      { $inc: { quantity: -item.quantity } },
    );
    if (!updated) {
      await rollbackReservedStock(reserved, ProductModel);
      return mode === "stripe"
        ? failure(409, `Insufficient stock for ${item.name}`)
        : failure(400, `Insufficient stock for product: ${item.name}`);
    }
    reserved.push(item);
    totalAmount += item.price * item.quantity;
  }

  return { ok: true, items, totalAmount, reserved };
}
