import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ["ICU", "General", "Regular"], required: true },
  status: { type: String, enum: ["Vacant", "Occupied"], default: "Vacant" },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
  
  history: [
    {
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
      admittedAt: { type: Date },
      dischargedAt: { type: Date },
    },
  ],
});

export default mongoose.model("Bed",bedSchema,"Bed");
