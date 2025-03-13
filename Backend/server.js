import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import DB connection
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import addstaffroute from "./routes/staff.js"
import doctorRoute from "./routes/doctor.js"
import patientRoute from "./routes/patientRoutes.js"
import bedRoutes from"./routes/bedRoutes.js"

//config 

// env file configuration 
dotenv.config();


const app = express();

//middlewares
app.use(
    cors({
      origin: "http://localhost:5173", // Allow only your frontend
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    })
  );
app.use(express.json());
app.use(cookieParser());

//Routes 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/staff",addstaffroute);
app.use("/api/v1/doctor",doctorRoute);
app.use("/api/v1/patients",patientRoute);
app.use("/api/v1/beds",bedRoutes);


const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

//listening the server
app.listen(PORT, () =>
   console.log(`Server running on port ${PORT}`));
