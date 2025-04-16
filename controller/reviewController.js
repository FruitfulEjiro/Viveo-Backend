import CatchAsync from "express-async-handler";

// Local Modules
import User from "../model/User.js";
import Review from "../model/Review.js";
import Product from "../model/Product.js";
import AppError from "../utils/AppError.js";

// Create a new review
export const createReview = CatchAsync(async (req, res, next) => {
   const id = req.user._id;
   const { rating, comment, productId } = req.body;

   // Check if the user has already reviewed the product
   const existingReview = await Review.findOne({
      user: id,
      product: productId,
   });
   if (existingReview) return next(new AppError("You have already reviewed this product", 400));

   // Validate the rating
   if (rating < 1 || rating > 5) return next(new AppError("Rating must be between 1 and 5", 400));

   // Check if the product exists
   const product = await Product.findById(productId);
   if (!product) {
      return next(new AppError("Product not found", 404));
   }

   // Create a new review
   const review = await Review.create({
      user: id,
      rating,
      comment,
      product: productId,
   });

   if (!review) return next(new AppError("Review not created!! Try again!", 500));

   // Add the review to the product
   product.reviews.push(review._id);
   await product.save();

   res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
         review,
      },
   });
});

// Get all reviews for a product
export const getProductReviews = CatchAsync(async (req, res, next) => {
   const id = req.params.id;

   // Check if the product review exists
   const reviews = await Review.find({ product: id }).populate("user", "name email");
   if (!reviews) return next(new AppError("No reviews found", 404));

   res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      result: reviews.length,
      data: {
         reviews,
      },
   });
});

// Update a review
export const updateReview = CatchAsync(async (req, res, next) => {
   const { reviewId } = req.params;
   const { rating, comment } = req.body;
   const userId = req.user._id;

   // Validate the rating
   if (rating < 1 || rating > 5) return next(new AppError("Rating must be between 1 and 5", 400));

   // Check if the review exists
   const review = await Review.findById(reviewId);
   if (!review) return next(new AppError("Review not found", 404));

   // Check if the review belongs to the user
   if (review.user.toString() !== userId.toString()) {
      return next(new AppError("You cannot update this review", 403));
   }

   // Update the review
   if (rating) review.rating = rating;
   if (comment) review.comment = comment;
   const updatedReview = await review.save();
   if (!updatedReview) return next(new AppError("Review not updated!! Try again!", 500));

   res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: {
         review,
      },
   });
});

// Delete a review
export const deleteReview = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   // Check if the review exists
   const review = await Review.findByIdAndDelete(id);
   if (!review) return next(new AppError("Review not found", 404));

   res.status(200).json({
      success: true,
      message: "Review deleted successfully",
   });
});

// Get all reviews
export const getAllReviews = CatchAsync(async (req, res, next) => {
   const reviews = await Review.find().populate("user", "name email").populate("product", "name price");
   if (!reviews) return next(new AppError("No reviews found", 404));

   // Check if there are any reviews
   if (reviews.length === 0) return next(new AppError("No reviews found", 404));

   res.status(200).json({
      success: true,
      message: "All reviews retrieved successfully",
      result: reviews.length,
      data: {
         reviews,
      },
   });
});

// Get reviews by user
export const getReviewsByUser = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   // Check if the user exists
   const user = await User.findById(id);
   if (!user) return next(new AppError("User not found", 404));

   // Check if the user has any reviews
   const reviews = await Review.find({ user: id }).populate("product", "name price");
   if (!reviews) return next(new AppError("No reviews found", 404));

   res.status(200).json({
      success: true,
      message: reviews.length === 0 ? "No review found for this user" : "Reviews retrieved successfully",
      result: reviews.length,
      data: {
         reviews,
      },
   });
});

// Get reviews by rating
export const getReviewsByRating = CatchAsync(async (req, res, next) => {
   const { rating } = req.params;

   const reviews = await Review.find({ rating }).populate("user", "name email");
   if (!reviews) return next(new AppError("No reviews found", 404));

   res.status(200).json({
      success: true,
      message: reviews.length === 0 ? "No review found" : "Reviews retrieved successfully",
      data: {
         reviews,
      },
   });
});
