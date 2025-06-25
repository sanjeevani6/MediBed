import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  },
  { collection: "Hospitals" }
);

export default mongoose.model("Hospital", hospitalSchema);
