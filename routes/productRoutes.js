import express from "express";

// Local Modules
import { protect, restrict } from "../controller/authController.js ";
import { deleteImageCloudinary } from "../middleware/cloudinary.js";
import {
   createProduct,
   getAllProducts,
   getProductsByCategory,
   getProductsByTag,
   getSingleProduct,
   updateProduct,
   deleteProduct,
} from "../controller/productController.js";

const router = express.Router();

router.use(protect);
router.use(restrict);

router
   .post("/create", createProduct)
   .get("/all", getAllProducts)
   .get("/category/:id", getProductsByCategory)
   .get("/tag/:id", getProductsByTag)
   .get("/:id", getSingleProduct)
   .patch("/update/:id", updateProduct)
   .delete("/delete/:id", deleteProduct)
   .delete("/delete/image/:id", deleteImageCloudinary);

export default router;
