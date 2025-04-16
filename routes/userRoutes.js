import express from "express";

// Local Modules
import { getAllUsers, getUser, updateUser, deleteUser } from "../controller/userController.js";
import { protect, restrict } from "../controller/authController.js";

const router = express.Router();

router.use(protect);

router
   .patch("/update/:id", updateUser)
   .get("/all", restrict, getAllUsers)
   .get("/:id", restrict, getUser)
   .delete("/delete/:id", restrict, deleteUser);

export default router;
