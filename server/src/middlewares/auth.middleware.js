import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // เช็คจาก Cookie
  const token = req.cookies?.accessToken;

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

// ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }
  next();
};

