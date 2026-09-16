import { Router } from "express";
import { Product } from "../../models/Product.model.js";

export const router = Router();

// Read product
router.get("/", async (req, res, next) => {
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
});
