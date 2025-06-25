import express from "express";
import { addBed, countBeds, getAllBeds, getBedHistory } from "../controllers/bedController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router();
router.post("/add",authMiddleware, addBed);
router.get("/count",authMiddleware,countBeds);
router.get("/", authMiddleware,getAllBeds);  // Get all beds categorized into vacant & occupied
router.get("/:id",authMiddleware,getBedHistory); // Get specific bed history

export default router;
