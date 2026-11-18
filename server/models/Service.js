import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    officeId: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
    department: { type: String, required: [true, "Department is required"], trim: true },
    name: { type: String, required: [true, "Service name is required"], trim: true },
    prefix: { type: String, required: true, uppercase: true, maxlength: 3, default: "A" },
    avgDurationMin: { type: Number, default: 10, min: 1 },
    dailyTokenLimit: { type: Number, default: 100, min: 1 },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "17:00" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);