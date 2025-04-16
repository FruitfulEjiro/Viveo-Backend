import CatchAsync from "express-async-handler";

// Local Modules
import Product from "../model/Product.js";
import AppError from "../utils/AppError.js";

// Create Product
export const createProduct = CatchAsync(async (req, res, next) => {
   const { name, price, description, category, quantity, image, imageArray, tags } = req.body;

   // Validate input
   if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
   }

   // Create Product
   const product = await Product.create({
      name,
      price,
      description,
      category,
      quantity,
      image,
      imageArray,
      tags,
   });

   if (!product) return next(new AppError("Product not created", 500));

   res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: {
         product,
      },
   });
});

// Get All Products
export const getAllProducts = CatchAsync(async (req, res, next) => {
   const products = await Product.find();

   if (!products) return next(new AppError("No products found", 404));

   res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      results: products.length,
      data: {
         products,
      },
   });
});

// Get Single Product
export const getSingleProduct = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   const product = await Product.findById(id).populate("reviews", "user rating comment");

   if (!product) return next(new AppError("Product not found", 404));

   res.status(200).json({
      status: "success",
      message: "Product retrieved successfully",
      data: {
         product,
      },
   });
});

// Update Product
export const updateProduct = CatchAsync(async (req, res, next) => {
   const { id } = req.params;
   const { name, price, description, category, quantity, image, imageArray, tags } = req.body;

   const product = await Product.findByIdAndUpdate(
      id,
      {
         name,
         price,
         description,
         category,
         quantity,
         image,
         imageArray,
         tags,
      },
      { new: true }
   );

   if (!product) return next(new AppError("Product not found", 404));

   res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: {
         product,
      },
   });
});

// Delete Product
export const deleteProduct = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   const product = await Product.findByIdAndDelete(id);

   if (!product) return next(new AppError("Product not found", 404));

   res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
   });
});
