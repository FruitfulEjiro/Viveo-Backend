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
      type: String,
      required: true,
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
   ratings: {
      type: Number,
      default: 0,
   },
   averageRating: {
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
ProductSchema.pre("updateOne", function (next) {
   this.set({ updatedAt: Date.now() });
   next();
});
ProductSchema.pre("save", function (next) {
   this.quantity >= 1 ? (this.inStock = true) : (this.inStock = false);
   next();
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
