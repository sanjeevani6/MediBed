import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import addDoctor from "../controllers/adddoctorController.js";
import { countDoctors, deleteDoctor, getDoctors } from "../controllers/doctorController.js";

const router = express.Router();

// Middleware to check if user is superadmin
const checkSuperadmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Only superadmins can add staff members." });
  }
  next();
};

router.post("/add-dr", authMiddleware, checkSuperadmin,addDoctor);
router.get("/", getDoctors);
router.delete("/:id", authMiddleware, deleteDoctor);
router.get("/count",authMiddleware,countDoctors);


export default router