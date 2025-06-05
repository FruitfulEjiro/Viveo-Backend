import express from "express";

// Local Modules
import { signup, login, logout, admin } from "../controller/authController.js";

const router = express.Router();

router.post("/admin", admin);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;
