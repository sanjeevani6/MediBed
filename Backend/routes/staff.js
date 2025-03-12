import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import addstaff from "../controllers/addstaffController.js";

const router = express.Router();

// Middleware to check if user is superadmin
const checkSuperadmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Only superadmins can add staff members." });
  }
  next();
};

router.post("/add", authMiddleware, checkSuperadmin,addstaff);

export default router;
