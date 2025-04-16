import express from "express";

// Local Modules
import { protect } from "../controller/authController.js";
import {
   createReview,
   getProductReviews,
   getAllReviews,
   getReviewsByUser,
   updateReview,
   deleteReview,
   getReviewsByRating,
} from "../controller/reviewController.js";

const router = express.Router();

router.use(protect);

router
   .post("/create", createReview)
   .get("/:id/reviews", getProductReviews)
   .get("/all", getAllReviews)
   .get("/:id/all", getReviewsByUser)
   .get("/rating/:rating", getReviewsByRating)
   .patch("/update/:reviewId", updateReview)
   .delete("/delete/:id", deleteReview);

export default router;
