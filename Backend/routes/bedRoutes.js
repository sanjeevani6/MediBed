import express from "express";
import { getAllBeds, getBedHistory } from "../controllers/bedController.js";

const router = express.Router();

router.get("/", getAllBeds);  // Get all beds categorized into vacant & occupied
router.get("/:id", getBedHistory); // Get specific bed history

export default router;
