import User from "../models/User.model.js";
import { Product } from "../models/Product.model.js";

// 1. GET /api/v1/users/cart - ดึงข้อมูลตะกร้าสินค้าพร้อม populate รายละเอียดสินค้า
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // ได้จาก verifyToken middleware
    const user = await User.findById(userId).populate("cart.productId");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. POST /api/v1/users/cart - เพิ่มสินค้าลงตะกร้า (ถ้าซ้ำไซส์เดิมให้บวกทบจำนวน)
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, size, customName, customNumber, quantity } =
      req.body;
    const count = Number(quantity);
    if (!productId || !size || !Number.isInteger(count) || count < 1) {
      return res.status(400).json({ success: false, message: "Valid product, size, and quantity are required" });
    }
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: "Product not found" });

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ตรวจสอบว่ามีสินค้า (productId) และไซส์ (size) เดียวกันอยู่ในตะกร้าแล้วหรือยัง
    // ตรวจสอบว่ามีสินค้าและไซส์เดียวกันอยู่ในตะกร้าแล้วหรือยัง (ป้องกัน item.productId เป็น null ด้วย)
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.productId &&
        item.productId.toString() === productId &&
        item.size === size,
    );

    if (existingItemIndex > -1) {
      // หากพบสินค้าและไซส์ซ้ำกัน ให้บวกทบจำนวนเข้าไป
      user.cart[existingItemIndex].quantity += count;
    } else {
      // หากไม่ซ้ำ ให้ push เพิ่มรายการใหม่เข้าไปใน array
      user.cart.push({
        productId: productId,
        size,
        customName,
        customNumber,
        quantity: count,
        price: product.price,
      });
    }

    await user.save();
    await user.populate("cart.productId");

    res.status(200).json({
      success: true,
      message: "Added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. PATCH /api/v1/users/cart/:itemId - อัปเดตจำนวนสินค้าตาม subdocument ID (ต้องไม่ต่ำกว่า 1)
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ค้นหา item ใน subdocument array ด้วย id
    const cartItem = user.cart.id(itemId);
    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    cartItem.quantity = Number(quantity);
    await user.save();
    await user.populate("cart.productId");

    res.status(200).json({
      success: true,
      message: "Cart item quantity updated",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE /api/v1/users/cart/:itemId - ลบสินค้าเฉพาะชิ้นนั้นออกจากตะกร้า
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ใช้ pull เพื่อลบ subdocument ออกจาก array
    user.cart.pull({ _id: itemId });
    await user.save();
    await user.populate("cart.productId");

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. DELETE /api/v1/users/cart - ล้างตะกร้าสินค้าทั้งหมดให้เป็น Array ว่าง
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const validateProfileUpdate = (payload = {}) => {
  const errors = [];
  const { firstName, lastName, phone } = payload;
  const updates = {};

  if (firstName !== undefined) {
    const value = typeof firstName === "string" ? firstName.trim() : "";
    if (!value) {
      errors.push("firstName cannot be empty");
    } else if (value.length < 2) {
      errors.push("firstName must be at least 2 characters");
    } else {
      updates.firstName = value;
    }
  }

  if (lastName !== undefined) {
    const value = typeof lastName === "string" ? lastName.trim() : "";
    if (!value) {
      errors.push("lastName cannot be empty");
    } else if (value.length < 2) {
      errors.push("lastName must be at least 2 characters");
    } else {
      updates.lastName = value;
    }
  }

  if (phone !== undefined) {
    const value = typeof phone === "string" ? phone.trim() : "";
    if (!value) {
      errors.push("phone cannot be empty");
    } else {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 9 || digitsOnly.length > 15) {
        errors.push("phone must be a valid phone number");
      } else {
        updates.phone = value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    errors.unshift("Please provide at least one valid field to update");
  }

  return { errors, updates };
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { address, ...profilePayload } = req.body;
    const { errors, updates } = validateProfileUpdate(profilePayload);

    if (
      address !== undefined &&
      errors.length === 1 &&
      errors[0] === "Please provide at least one valid field to update"
    ) {
      errors.length = 0;
    }

    if (address !== undefined) {
      if (!address || typeof address !== "object" || Array.isArray(address)) {
        errors.push("address must be an object");
      } else {
        const addressFields = [
          "recipientName",
          "phone",
          "addressLine",
          "province",
          "district",
          "subdistrict",
          "postalCode",
        ];
        for (const field of addressFields) {
          if (address[field] !== undefined) {
            const value = String(address[field]).trim();
            if (!value) errors.push(`${field} cannot be empty`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    Object.assign(user, updates);

    if (address !== undefined) {
      const addressUpdates = {};
      for (const field of [
        "recipientName",
        "phone",
        "addressLine",
        "province",
        "district",
        "subdistrict",
        "postalCode",
      ]) {
        if (address[field] !== undefined) {
          addressUpdates[field] = String(address[field]).trim();
        }
      }

      const defaultAddress = user.addresses.find((item) => item.isDefault);
      if (defaultAddress) {
        Object.assign(defaultAddress, addressUpdates);
      } else {
        const requiredAddressFields = [
          "recipientName",
          "phone",
          "addressLine",
          "province",
          "postalCode",
        ];
        const hasAllAddressFields = requiredAddressFields.every(
          (field) => addressUpdates[field],
        );

        if (!hasAllAddressFields) {
          return res.status(400).json({
            success: false,
            message:
              "A complete address is required when the user has no default address",
          });
        }

        user.addresses.push({ ...addressUpdates, isDefault: true });
      }
    }

    await user.save();
    const responseUser = user.toObject();
    delete responseUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: responseUser,
    });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const {
      recipientName,
      phone,
      addressLine,
      province,
      district,
      subdistrict,
      postalCode,
      isDefault,
    } = req.body;

    if (!recipientName || !phone || !addressLine || !province || !postalCode) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide recipientName, phone, addressLine, province, and postalCode",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newAddress = {
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      province: province.trim(),
      ...(district ? { district: district.trim() } : {}),
      ...(subdistrict ? { subdistrict: subdistrict.trim() } : {}),
      postalCode: postalCode.trim(),
      isDefault: Boolean(isDefault),
    };

    // ถ้ามี isDefault = true ให้ตั้ง default ให้เฉพาะอันนี้
    if (newAddress.isDefault) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.addresses.push(newAddress);

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const originalLength = user.addresses.length;

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId,
    );

    if (user.addresses.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const allowedFields = [
      "recipientName",
      "phone",
      "addressLine",
      "province",
      "district",
      "subdistrict",
      "postalCode",
      "isDefault",
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    const requiredFields = [
      "recipientName",
      "phone",
      "addressLine",
      "province",
      "postalCode",
    ];
    const hasEmptyField = requiredFields.some(
      (field) => updates[field] !== undefined && !updates[field],
    );

    if (hasEmptyField || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid address fields to update",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (updates.isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = item._id.equals(address._id);
      });
    }

    Object.assign(address, updates);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};
