import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/product.controller.js";
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
export const router = Router();

// Admin inventory can include products hidden from the public catalog.
router.get("/admin", verifyToken, requireAdmin, (req, res, next) => {
  req.includeInactiveProducts = true;
  return getProducts(req, res, next);
});

// Public catalog only returns products enabled for the storefront.
router.get("/", getProducts);

// Read product by id
router.get("/:id", validateObjectId("id", "product ID"), getProductById);

// Create new product
router.post("/", verifyToken, requireAdmin, createProduct);

// update new product
router.patch("/:id", verifyToken, requireAdmin, validateObjectId("id", "product ID"), updateProduct);

// Delete product
router.delete("/:id", verifyToken, requireAdmin, validateObjectId("id", "product ID"), deleteProduct);
