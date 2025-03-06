//database connection...
import mongoose from "mongoose";
import dotenv from "dotenv";
import "colors";

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI;

//database connection
const connectDB = async () => {
  try {
   
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file!");
    }
   
    await mongoose.connect(MONGO_URI);
    console.log(`server running on ${mongoose.connection.host}`.bgCyan.white); //connected successfully
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
