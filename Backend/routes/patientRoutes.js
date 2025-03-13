import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Correct import
import { addPatient, getPatients } from "../controllers/patientController.js";

const router = express.Router();

// Use authMiddleware instead of authenticateUser
router.post("/add-patients", authMiddleware, addPatient);
router.get("/", authMiddleware, getPatients);

export default router;

