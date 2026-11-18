import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    officeId: { type: mongoose.Schema.Types.ObjectId, ref: "Office", required: true },
    name: { type: String, required: [true, "Counter name is required"], trim: true },
    serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    status: { type: String, enum: ["open", "paused", "closed"], default: "closed" },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Counter", counterSchema);