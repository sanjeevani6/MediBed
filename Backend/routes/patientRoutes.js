import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Correct import
import { addPatient, getPatients,getpatientdetail,dischargepatient,updateSeverity, countPatients } from "../controllers/patientController.js";

const router = express.Router();


// Use authMiddleware instead of authenticateUser
router.post("/add-patients", authMiddleware, addPatient);
router.get("/count",authMiddleware,countPatients);
router.get("/", authMiddleware, getPatients);
router.get("/:id",getpatientdetail);
router.put("/:id/discharge",dischargepatient);
router.put("/:id/severity", updateSeverity);
export default router;

