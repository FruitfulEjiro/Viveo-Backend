import express from "express";
import cookieParser from "cookie-parser";

// Local Modules
import ErrorHandler from "./utils/ErrorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/review", reviewRoutes);

// Error Handling
app.use(ErrorHandler);

export default app;
