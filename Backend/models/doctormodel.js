import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
});

export default mongoose.model("Doctor", doctorSchema);
