import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Office from "./models/Office.js";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let office = await Office.findOne({ name: "Demo Tehsil Office" });
  if (!office) {
    office = await Office.create({
      name: "Demo Tehsil Office",
      address: "Main Road",
      city: "Bareilly",
    });
    console.log("Office created");
  }

  const email = "admin@sahisewaq.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
  } else {
    await User.create({
      name: "System Admin",
      email,
      password: "Admin@123",
      role: "admin",
      officeId: office._id,
    });
    console.log("Admin created: admin@sahisewaq.com / Admin@123");
  }

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});