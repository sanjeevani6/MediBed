import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true }, // Weight in kg
    phoneNumber: { type: String, 
                   required: true,
                   match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
                  },
    email: {
      type: String,
      required: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },    
    bloodGroup: { 
      type: String, 
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], 
      required: true 
    }, 
    address: { type: String, required: true },
    status: { type: String, enum: ["DISCHARGED","ADMITTED"],required: true },
    severity: { type: Number, required: true }, // 1 = Low, 2 = Moderate, 3 = Critical
    severityHistory: [
      {
        severity: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String } // Optional doctor's note
      }
    ],
    bedType: { type: String, enum: ["ICU", "General", "Regular"], required: true },
    assignedBed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", default: null },
    admittedAt: { type: Date, default: Date.now },
    totalCost: { type: Number, default: 0 }, // Stores total cost for patient stay
    bedHistory: [
      {
        bedType: { type: String, required: true },
        admittedAt: { type: Date, required: true },
        dischargedAt: { type: Date, required: false },
      }
    ],
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
  },
  { collection: "patients", timestamps: true }, // Ensure correct collection name
);

export  const Patient = mongoose.model("Patient", patientSchema);
