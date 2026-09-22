import { Router } from "express";
import { userRouter } from "./user.routes.js";
import { orderRouter } from "./order.routes.js";
import { router as authRouter } from "./auth.routes.js";
import { router as productRouter } from "./product.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use("/orders", orderRouter);
router.use("/auth", authRouter);
router.use("/products", productRouter); // <--- 2. เพิ่มบรรทัดนี้เพื่อให้พาร์ท /api/v1/products เปิดใช้งาน

export default router;