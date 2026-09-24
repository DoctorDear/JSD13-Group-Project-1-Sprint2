import { Product } from "../models/Product.model.js";
import Order from "../models/Order.model.js";

// read all product and filter by searc name
export const getProducts = async (req, res, next) => {
  try {
    const { search, sort = "newest", limit: rawLimit, ...filters } = req.query;
    const query = {};

    const parsedLimit = Number.parseInt(rawLimit, 10);
    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : null;

    // 1. ถ้ามีคำค้นหา (Search คลุมทั้ง name, description, tag)
    if (search) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tag: searchRegex },
      ];
    }

    // 2. ถ้ามี Filter อื่นๆ (วนลูปจัดการอัตโนมัติ)
    const allowedFilters = ["category", "edition", "tag"];
    allowedFilters.forEach((field) => {
      if (filters[field]) {
        const cleanVal = filters[field].replace(/-/g, " ").trim();
        query[field] = { $regex: `^${cleanVal}$`, $options: "i" };
      }
    });

    if (sort === "best-selling") {
      const bestSellerRows = await Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        ...(limit ? [{ $limit: limit }] : []),
      ]);

      if (bestSellerRows.length > 0) {
        const rankByProductId = new Map(
          bestSellerRows.map((row, index) => [row._id.toString(), index]),
        );
        const products = await Product.find({
          ...query,
          _id: { $in: bestSellerRows.map((row) => row._id) },
        });

        products.sort(
          (first, second) =>
            rankByProductId.get(first._id.toString()) -
            rankByProductId.get(second._id.toString()),
        );

        return res.status(200).json(products);
      }
    }

    const productQuery = Product.find(query).sort({
      createdAt: -1,
      date: -1,
      _id: -1,
    });

    if (limit) productQuery.limit(limit);

    const products = await productQuery;

    return res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// read specific product by id
export const getProductById = async (req, res, next) => {
  try {
    const productById = await Product.findById(req.params.id);

    if (!productById) {
      return res.status(404).json({ error: "Product not found" });
    }
    let variants = [];
    if (productById.groupId) {
      variants = await Product.find({ groupId: productById.groupId });
    }
    res.status(200).json({ product: productById, variants });
  } catch (err) {
    next(err);
  }
};

// create new product
export const createProduct = async (req, res, next) => {
  try {
    const product = req.body;
    if (!product) {
      res.status(400).json({ error: "Can't create product" });
    }
    const newProduct = await Product.create(product);
    return res
      .status(201)
      .json({ message: "create new product completed ", data: newProduct });
  } catch (err) {
    next(err);
  }
};

// update product
export const updateProduct = async (req, res, next) => {
  try {
    const product = req.body;

    if (!product) {
      return res.status(400).json({ error: "Can't update product" });
    }

    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      product,
      { returnDocument: "after", runValidators: true },
    );

    if (!updateProduct) {
      return res.status(400).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "update product completed " });
  } catch (err) {
    next(err);
  }
};

// deleted product
export const deleteProduct = async (req, res, next) => {
  try {
    const deleteProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deleteProduct) {
      return res.status(404).json({ error: "Product not found!" });
    }

    res.status(200).json({
      message: "Product successfully deleted",
    });
  } catch (err) {
    next(err);
  }
};
