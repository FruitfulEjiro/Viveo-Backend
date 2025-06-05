import mongoose from "mongoose";

// Local Module
import { uploadImageCloudinary, deleteImageCloudinary } from "../middleware/cloudinary.js";
import AppError from "../utils/AppError.js";

const ProductSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true,
   },
   price: {
      type: Number,
      required: true,
      min: 0,
   },
   description: {
      type: String,
      required: true,
   },
   category: {
      type: String,
      required: true,
   },
   quantity: {
      type: Number,
      min: 0,
   },
   inStock: {
      type: Boolean,
      default: true,
   },
   image: {
      imageUrl: {
         type: String,
         required: true,
      },
      publicId: {
         type: String,
         required: true,
      },
   },
   imageArray: [
      {
         imageUrl: {
            type: String,
            required: true,
         },
         publicId: {
            type: String,
            required: true,
         },
      },
   ],
   createdAt: {
      type: Date,
      default: Date.now,
   },
   updatedAt: {
      type: Date,
      default: Date.now,
   },
   rating: {
      type: Number,
      default: 0,
   },
   reviews: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Review",
      },
   ],
   totalReviews: {
      type: Number,
      default: 0,
   },
   tags: [
      {
         type: String,
      },
   ],
   specifications: {
      type: String,
   },
   warranty: {
      type: String,
   },
   additionalInfo: {
      type: String,
   },
   productVideos: [
      {
         type: String,
      },
   ],
   productFAQs: [
      {
         question: {
            type: String,
         },
         answer: {
            type: String,
         },
      },
   ],
});

// Mongoose Middleware
ProductSchema.pre("save", function (next) {
   this.updatedAt = Date.now();
   next();
});
ProductSchema.pre("save", function (next) {
   if (!this.isNew) this.set({ updatedAt: Date.now });
   next();
});
ProductSchema.pre("updateOne", function (next) {
   this.set({ updatedAt: Date.now() });
   next();
});
ProductSchema.pre("save", function (next) {
   this.quantity >= 1 ? (this.inStock = true) : (this.inStock = false);
   next();
});
// Remove all reviews associated with this product
ProductSchema.pre("remove", async function (next) {
   await this.model("Review").deleteMany({ product: this._id });
   next();
});
// delete image from cloudinary
ProductSchema.pre("remove", async function (next) {
   // delete image from cloudinary
   const { public_id } = this.image;
   if (public_id) {
      const deleteImage = await deleteImageCloudinary(public_id);
      if (!deleteImage) return next(new AppError("Couldnt delete Image. Try again!!!", 500));
   }
});

// Instance Methods
// calculate average rating
ProductSchema.methods.calculateAverageRating = function () {
   if (this.reviews.length === 0) return 0;
   const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
   return totalRating / this.reviews.length;
};
// calculate total reviews
ProductSchema.methods.calculateTotalReviews = function () {
   return this.reviews.length;
};
// update quantity and inStock when new stock are added
ProductSchema.methods.updateStock = function (quantity) {
   this.quantity += Number(quantity);
   this.inStock = this.quantity > 0;
};
// add review id to product and claculate total reviews and rating
ProductSchema.methods.addReview = function (reviewId) {
   this.reviews.push(reviewId);
   this.totalReviews = this.calculateTotalReviews();
   this.rating = this.calculateAverageRating();
};

const Product = mongoose.model("Product", ProductSchema);

export default Product;
