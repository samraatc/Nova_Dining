// seed.js
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import adminModel from "../models/adminModel.js";

dotenv.config({ path: "../.env" });

const seedAdmins = async () => {
  await connectDB();

  try {
    // --- SUPER ADMIN ---
    const superAdminEmail = "admin@novadining.com";
    let superAdmin = await adminModel.findOne({ email: superAdminEmail });

    if (!superAdmin) {
      superAdmin = new adminModel({
        name: "Super Admin",
        email: superAdminEmail,
        password: "super123", // will be hashed by pre-save hook
        role: "super_admin",
        isDemo: false,
      });
      await superAdmin.save();
      console.log("✅ Super Admin created");
    } else {
      console.log("⚡ Super Admin already exists");
    }

    // --- DEMO ADMIN ---
    const demoAdminEmail = "demo@admin.com";
    let demoAdmin = await adminModel.findOne({ email: demoAdminEmail });

    if (!demoAdmin) {
      demoAdmin = new adminModel({
        name: "Demo Admin",
        email: demoAdminEmail,
        password: "demo123", // will be hashed by pre-save hook
        role: "admin",
        isDemo: true,
      });
      await demoAdmin.save();
      console.log("✅ Demo Admin created");
    } else {
      console.log("⚡ Demo Admin already exists");
    }

    console.log("🚀 Admin seeding completed");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding admins:", err.message);
    process.exit(1);
  }
};

seedAdmins();
