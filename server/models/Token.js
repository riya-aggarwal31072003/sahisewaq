import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    tokenNo: { type: String, required: true },
    seq: { type: Number, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    citizenName: { type: String, required: [true, "Name is required"], trim: true },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"],
    },
    email: { type: String, lowercase: true, trim: true },
    officeId: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    counterId: { type: mongoose.Schema.Types.ObjectId, ref: "Counter", default: null },
    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed", "skipped", "cancelled"],
      default: "waiting",
    },
    priority: { type: Boolean, default: false },
    calledAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// A token number can never repeat for the same service on the same day
tokenSchema.index({ serviceId: 1, date: 1, seq: 1 }, { unique: true });
tokenSchema.index({ serviceId: 1, date: 1, status: 1 });

export default mongoose.model("Token", tokenSchema);