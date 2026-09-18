import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // เช็คทั้งจาก Cookie หรือ Header Bearer
  const token =
    req.cookie?.accessToken || req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied, No token provided",
    });
  }

  try {
    // ถอดรหัสตั๋ว
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ฝากข้อมูล userId และ role ไว้ที่ req.user เพื่อให้ Controller อื่นเรียกใช้ได้
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
};
