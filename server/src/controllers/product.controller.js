import { Product } from "../models/Product.model.js";

// read all product and filter by searc name
export const getProducts = async (req, res, next) => {
  try {
    const { search, ...filters } = req.query;
    const query = {};

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

    const products = await Product.find(query);

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
    if (!product) res.status(400).json({ error: "Can't create product" });
    const newProduct = await Product.create(product);
    return res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

// update product
export const updateProduct = async (req, res, next) => {
  try {
    const product = req.body;

    if (!product) res.status(400).json({ error: "Can't update product" });
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      product,
      { new: true, runValidators: true },
    );
    if (!updateProduct) res.status(400).json({ error: "Product not found" });

    return res.status(200).json(updateProduct);
  } catch (err) {
    next(err);
  }
};

// export const deleteProduct = async (req, res, next) => {
//   try {
//     const
//   } catch (err) {
//     next(err)
//   }
// }
