import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staffID: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ["staff", "superadmin"], default: "staff" }, // Superadmin can add staff
},{ collection: "Staff" });

export default mongoose.model("Staff", staffSchema);
