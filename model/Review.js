import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   rating: {
      type: Number,
      required: true,
   },
   comment: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   updatedAt: {
      type: Date,
      default: Date.now,
   },
   product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
   },
});

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
