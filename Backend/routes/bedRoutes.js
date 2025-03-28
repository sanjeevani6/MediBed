import express from "express";
import { countBeds, getAllBeds, getBedHistory } from "../controllers/bedController.js";

const router = express.Router();
router.get("/count",countBeds);
router.get("/", getAllBeds);  // Get all beds categorized into vacant & occupied
router.get("/:id", getBedHistory); // Get specific bed history

export default router;
