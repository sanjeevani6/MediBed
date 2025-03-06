import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ["ICU", "General", "Regular"], required: true },
  isOccupied: { type: Boolean, default: false },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
});

export default mongoose.model("Bed", bedSchema);
