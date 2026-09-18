import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // 1. ตรวจสอบว่ากรอกข้อมูลจำเป็นครบไหม
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: firstName, lastName, email, password",
      });
    }

    // 2. ตรวจสอบว่ามีคนใช้อีเมลนี้แล้วหรือยัง
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered!",
      });
    }

    // 3. แฮชรหัสผ่านด้วย bcrypt (รอบหมุน 12 รอบ)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. บันทึก User คนใหม่ลง MongoDB
    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
    });

    // 5. ส่ง Response สำเร็จกลับไป (ไม่ต้องส่งรหัสผ่านกลับไปนะ)
    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err); // โยนไปหา Error Handler
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. เช็คว่ากรอกครบไหม
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2. ค้นหา User ตามอีเมล
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. ตรวจสอบรหัสผ่านด้วย bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. ออกตั๋ว JWT Token (มีอายุ 7 วัน)
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 5. ส่ง Cookie ไปด้วย (สไตล์ Week 10)
    res.cookie("accessToken", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    });

    // 6. ส่ง Response กลับ (ส่ง token ไปใน JSON เผื่อหน้าบ้านอยากเก็บใน localStorage ด้วย)
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // 1. ตรวจสอบว่ากรอกครบไหม
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both new password and confirm password",
      });
    }

    // 2. ตรวจสอบว่ารหัสผ่านใหม่ตรงกันไหม
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // 3. แฮชรหัสผ่านใหม่ด้วย bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 4. อัปเดตลง MongoDB โดยใช้ userId ที่แกะได้จาก Token (req.user)
    await User.findByIdAndUpdate(req.user.userId, {
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// ดึงข้อมูล User ตัวเอง (สำหรับหน้าบ้านดึงข้อมูลตอนรีเฟรช)
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ออกจากระบบ (ล้าง Cookie)
export const logout = (req, res) => {
  res.clearCookie("accessToken");
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully!" });
};
