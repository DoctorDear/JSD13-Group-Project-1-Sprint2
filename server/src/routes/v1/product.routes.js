import { Router } from "express";
import { getProducts } from "../../controllers/product.controller.js";
import { getProductById } from "../../controllers/product.controller.js";
export const router = Router();

// Read all product
router.get("/", getProducts);

// Read product by id
router.get("/:id", getProductById);
