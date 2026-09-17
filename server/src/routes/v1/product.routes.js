import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} from "../../controllers/product.controller.js";
export const router = Router();

// Read all product
router.get("/", getProducts);

// Read product by id
router.get("/:id", getProductById);

// Create new product
router.post("/", createProduct);

// update new product
router.patch("/:id", updateProduct);
