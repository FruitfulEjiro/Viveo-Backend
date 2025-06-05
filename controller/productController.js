import CatchAsync from "express-async-handler";

// Local Modules
import { uploadImageCloudinary, deleteImageCloudinary } from "../middleware/cloudinary.js";
import Product from "../model/Product.js";
import AppError from "../utils/AppError.js";

// Create Product
export const createProduct = CatchAsync(async (req, res, next) => {
   const { name, price, description, category, quantity, image, imageArray, tags } = req.body;

   // Validate input
   if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Name, Description, price and Category are required" });
   }

   // images should be converted to base64 before sent in the request obj
   // Upload images to Cloudinary
   let imageObj = {};
   let imageObjArray = [];
   if (image) {
      const result = await uploadImageCloudinary(image);
      if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
      imageObj.imageUrl = result.secure_url;
      imageObj.publicId = result.public_id;
   }
   if (imageArray) {
      imageArray.forEach(async (image) => {
         const result = await uploadImageCloudinary(image);
         if (!result) return next(new AppError("Couldnt upload Image!! Try again", 500));
         imageObjArray.push({
            imageUrl: result.secure_url,
            publicId: result.public_id,
         });
      });
   }

   // Create Product
   const product = await Product.create({
      name,
      price,
      description,
      category,
      image: imageObj,
      imageArray: imageObjArray,
      quantity,
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

// Get Product By Category
export const getProductsByCategory = CatchAsync(async (req, res, next) => {
   const { category } = req.params;

   // check if products with category exists
   const products = await Product.find({ category });
   if (!products || products.length === 0) return next(new AppError("No Products Found", 404));

   res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      results: products.length,
      data: {
         products,
      },
   });
});

// Get Products by Tags
export const getProductsByTag = CatchAsync(async (req, res, next) => {
   const { tag } = req.params;

   // check if products with tag exist
   const products = await Product.find({ tags: tag });
   if (!products || products.length) return next(new AppError("No Products Found", 404));

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

   const product = await Product.findById(id);
   if (!product) return next(new AppError("Product not found", 404));
   // Update Product
   if (name) product.name = name;
   if (price) product.price = price;
   if (description) product.description = description;
   if (category) product.category = category;
   if (image) product.image = image;
   if (imageArray) product.imageArray = imageArray;
   if (tags) product.tags = tags;
   if (quantity) product.updateStock(quantity);

   // save product
   await product.save({ validateBeforeSave: false });

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

   // delete image from cloudinary
   const deleteImage = await deleteImageCloudinary(product.image.publicId);
   if (!deleteImage) return next(new AppError("Couldnt delete Image. Try again!!!", 500));

   // delete product
   const deleteProduct = await product.remove();
   if (!product) return next(new AppError("Product not found", 404));

   res.status(204).json({
      status: "success",
      message: "Product deleted successfully",
   });
});
