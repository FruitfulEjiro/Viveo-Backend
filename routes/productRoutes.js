import express from "express";

// Local Modules
import { protect } from "../controller/authController.js ";
import {
   createProduct,
   getAllProducts,
   getSingleProduct,
   updateProduct,
   deleteProduct,
} from "../controller/productController.js";

const router = express.Router();

router
   .post("/create", createProduct)
   .get("/all", getAllProducts)
   .get("/:id", getSingleProduct)
   .patch("/update/:id", updateProduct)
   .delete("/delete/:id", deleteProduct);

export default router;
