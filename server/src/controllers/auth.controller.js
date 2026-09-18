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

    // 3. แฮชรหัสผ่านด้วย bcrypt (รอบหมุน 10 รอบ)
    const saltRounds = 10;
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
