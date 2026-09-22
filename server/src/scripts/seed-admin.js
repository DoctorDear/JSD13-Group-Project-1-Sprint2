import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.model.js";

async function seedAdmin() {
  try {
    await connectDB();

    const adminEmail = "admin@zetastore.com";
    const adminPassword = "Password123!";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.password = await bcrypt.hash(adminPassword, 12);
      await existingAdmin.save();
      console.log(`✅ Updated existing user to Admin: ${adminEmail}`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await User.create({
        firstName: "Admin",
        lastName: "Zeta",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`✅ Created Admin user successfully: ${adminEmail}`);
    }

    console.log("-----------------------------------");
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🛡️ Role:     admin`);
    console.log("-----------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err.message);
    process.exit(1);
  }
}

seedAdmin();
