import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    officeId: { type: mongoose.Schema.Types.ObjectId, ref: "Office", default: null },
    counterId: { type: mongoose.Schema.Types.ObjectId, ref: "Counter", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);