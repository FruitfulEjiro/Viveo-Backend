import mongoose from "mongoose";

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
         type: String,
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

// Instance Methods
ProductSchema.methods.calculateAverageRating = function () {
   if (this.reviews.length === 0) return 0;
   const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
   return totalRating / this.reviews.length;
};
ProductSchema.methods.calculateTotalReviews = function () {
   return this.reviews.length;
};
ProductSchema.methods.updateStock = function (quantity) {
   this.quantity += Number(quantity);
   this.inStock = this.quantity > 0;
};
ProductSchema.methods.addReview = function (reviewId) {
   this.reviews.push(reviewId);
   this.totalReviews = this.calculateTotalReviews();
   this.rating = this.calculateAverageRating();
};

const Product = mongoose.model("Product", ProductSchema);

export default Product;
