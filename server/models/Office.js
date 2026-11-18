import mongoose from "mongoose";

const officeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Office name is required"], trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Office", officeSchema);