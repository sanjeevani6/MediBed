import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true }, // Weight in kg
    phoneNumber: { type: String, required: true },
    bloodGroup: { 
      type: String, 
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], 
      required: true 
    }, 
    address: { type: String, required: true },
    status: { type: String, enum: ["DISCHARGED","ADMITTED"],required: true },
    severity: { type: Number, required: true }, // 1 = Low, 2 = Moderate, 3 = Critical
    bedType: { type: String, enum: ["ICU", "General", "Regular"], required: true },
    assignedBed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", default: null },
    admittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

export  const Patient = mongoose.model("Patient", patientSchema);
