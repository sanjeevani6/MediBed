import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { loginStaff, logoutStaff, checkAuth } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/login", loginStaff);
router.post("/logout", logoutStaff);
// Route to check if user is authenticated
router.get("/check-auth", authMiddleware, checkAuth);

export default router;
