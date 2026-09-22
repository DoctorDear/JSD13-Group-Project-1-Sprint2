import { Router } from "express";
import { userRouter } from "./user.routes.js";
import { orderRouter } from "./order.routes.js";

const router = Router();

// นำเข้า Router ของแต่ละส่วน
router.use("/users", userRouter);
router.use("/orders", orderRouter);

export const userRouter = router;