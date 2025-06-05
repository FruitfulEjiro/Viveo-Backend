import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({
   fullname: {
      firstname: {
         type: String,
         required: true,
         trim: true,
         validate: {
            validator: (value) => {
               return validator.isAlpha(value);
            },
            message: "First name must contain only Letters",
         },
      },
      lastname: {
         type: String,
         required: true,
         trim: true,
         validate: {
            validator: (value) => {
               return validator.isAlpha(value);
            },
            message: "Last name must contain only Letters",
         },
      },
   },
   email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
         validator: (value) => {
            return validator.isEmail(value);
         },
         message: "Invalid email address",
      },
   },
   password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 20,
      select: false,
      validate: {
         validator: (value) => {
            // Check if password is at least 8 characters long and contains at least one letter and one number
            return value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value);
         },
         message: "Password must be at least 8 characters long and contain at least one letter and one number",
      },
   },
   phone: {
      type: String,
      trim: true,
      validate: {
         validator: (value) => {
            return validator.isMobilePhone(value, "any", { strictMode: false });
         },
         message: "Invalid phone number",
      },
   },
   role: {
      type: String,
      enum: ["user"],
      default: "user",
      select: false,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
   },
   passwordResetToken: {
      type: String,
      default: null,
      select: false,
   },
   passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
   },
});

// MONGOOSE MIDDLEWARE
// Hash password before saving to database
UserSchema.pre("save", async function (next) {
   if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

// Document middleware to set passwordChangedAt date whwnever password is updated by user
UserSchema.pre("save", function (next) {
   if (!this.isModified("password") || this.isNew) return next();
   this.passwordChangedAt = Date.now() - 1000;
});

// INSTANCE METHODS

// Method to compare password
UserSchema.methods.comparePassword = async function (password) {
   return await bcrypt.compare(password, this.password);
};

// Method to create a password reset token
UserSchema.methods.createPasswordResetToken = async function () {
   const resetToken = crypto.randomBytes(32).toString("hex");

   this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

   return resetToken;
};

UserSchema.methods.changedPasswordAt = function(JWTTimeStamp) {
   if (this.passwordChangedAt) {
     return JWTTimeStamp < this.passwordChangedAt;
   }
 };

const User = mongoose.model("User", UserSchema);

export default User;
