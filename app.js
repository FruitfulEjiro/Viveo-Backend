import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Local Modules
import ErrorHandler from "./utils/ErrorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import { uploadImageCloudinary } from "./middleware/cloudinary.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/review", reviewRoutes);

app.post("/upload-image", (req, res) => {
   console.log(req.body.file);
   const file = req.body.file;
   uploadImageCloudinary(file)
      .then((result) => {
         res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: result,
         });
      })
      .catch((error) => {
         res.status(500).json({
            success: false,
            message: "Image upload failed",
            error: error.message,
         });
      });
});

// Error Handling
app.use(ErrorHandler);

export default app;
