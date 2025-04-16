import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema({
   fullname: {
      firstname: {
         type: String,
         required: true,
         trim: true,
         validate: {
            validator: (value) => {
               return validator.isAlpha(value);
            },
            message: "First name must contain only letters",
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
            message: "Last name must contain only letters",
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
      validate: {
         validator: (value) => {
            // Check if password is 8 characters long and contains at least one letter and one number
            return value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value);
         },
         message: "Password must be at least 8 characters long and contain at least one letter and one number",
      },
   },
   role: {
      type: String,
      default: "admin",
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   passwordChangedAt: {
      type: Date,
      default: null,
   },
   passwordResetToken: {
      type: String,
      default: null,
   },
   passwordResetTokenExpiry: {
      type: Date,
      default: null,
   },
});

// MONGOOSE MIDDLEWARE
// Hash password before saving to database
AdminSchema.pre("save", async function (next) {
   if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

// Document middleware to set passwordChangedAt date whwnever password is updated by user
AdminSchema.pre("save", function (next) {
   if (!this.isModified("password") || this.isNew) return next();
   this.passwordChangedAt = Date.now() - 1000;
});


// INSTANCE METHODS

// Method to compare password
AdminSchema.methods.comparePassword = async function (password) {
   return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
