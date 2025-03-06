import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import DB connection
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

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

app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

//routes


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
