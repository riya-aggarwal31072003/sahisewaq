import mongoose from "mongoose";

const tokenSequenceSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  date: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

tokenSequenceSchema.index({ serviceId: 1, date: 1 }, { unique: true });

export default mongoose.model("TokenSequence", tokenSequenceSchema);