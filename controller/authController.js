import CatchAsync from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Local Modules
import createSendToken from "../middleware/jwt.js";
import sendEmail from "../middleware/Email.js";
import User from "../model/User.js";
import Admin from "../model/Admin.js";
import AppError from "../utils/AppError.js";

// Create Admin
export const admin = CatchAsync(async (req, res, next) => {
   const { firstname, lastname, email, password } = req.body;

   // check if there is a regular user with same email
   const user = User.findOne({ email });
   if (user) return next(new AppError("User already has an account", 403));

   // Create User
   const admin = await Admin.create({
      fullname: {
         firstname,
         lastname,
      },
      email,
      password,
   });

   if (!admin) return next(new AppError("Error creating account!! Try again", 500));

   const adminObj = admin.toObject();

   delete adminObj.password;

   // Generate JWT token and send via Cookie
   createSendToken(adminObj, 201, res);
});

// Signup function
export const signup = CatchAsync(async (req, res, next) => {
   const { firstname, lastname, email, password } = req.body;

   // Create User
   const user = await User.create({
      fullname: {
         firstname,
         lastname,
      },
      email,
      password,
   });

   if (!user) return next(new AppError("Error creating account!! Try again", 500));

   // delete userObj.password;

   // await sendEmail();

   // Generate JWT token and send via Cookie
   createSendToken(user, 201, res);
});

// Login function
export const login = CatchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // Check if email and password exist
   if (!email || !password) {
      return next(new AppError("Please Provide Email and Password", 400));
   }

   // Find User by email

   const user = await User.findOne({ email }).select("+password");

   if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect Email or Password", 401));
   }

   const userObj = user.toObject();

   delete userObj.password;

   // Generate JWT token and send via Cookie
   createSendToken(userObj, 200, res);
});

// Forgot password
export const forgotPassword = CatchAsync(async (req, res, next) => {
   const { email } = req.body;

   // Get user from Database
   const user = await user.find({ email });
   if (!user) {
      return next(new AppError("No User found with this Email", 404));
   }

   // Generate random reset token
   const resetToken = user.createPasswordResetToken();
   await user.save({ validatebeforeSave: false });

   const message = `Your password reset token is: ${resetToken}. and it expires in 10 minutes Please use it to reset your password.`;

   try {
      await sendEmail({
         email: user.email,
         subject: "Your Password Reset Token (Valid for 10 mins)",
         message,
      });

      return res.status(200).json({
         status: "success",
         message: "Token sent to your mail",
      });
   } catch (Err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError("An error Occured, try sending mail again", 500));
   }
});

// Reset Password
export const resetPassword = CatchAsync(async (req, res, next) => {
   // Get user based on the reset token
   const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
   const user = await user.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   });

   if (!user) {
      return next(new AppError("Token is invalid or expired", 401));
   }

   // If user is found and token has not expires, set new password
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();

   // Update passwordChangedAt for user using a Mongoose middleware

   // Log in user
   const token = generateToken(user._id);

   res.status(200).json({
      status: "success",
      token,
   });
});

// Protect middleware
export const protect = CatchAsync(async (req, res, next) => {
   // Retrieve the token from cookie
   let token = req.cookies.jwt;

   if (!token) {
      res.status(401).json({
         status: "Failed",
         message: "You are not Logged in",
         redirect: "/login",
      });
      return next(new AppError("You are not Logged in", 401));
   }

   // Verify JWT
   const decoded = jwt.verify(token, process.env.JWT_SECRET);

   if (!decoded) {
      res.status(401).json({
         status: "Failed",
         message: "You are not Logged in",
         redirect: "/login",
      });
      return next(new AppError("You are not Logged in", 401));
   }

   // Find User by id from decoded token
   const user = await User.findById(decoded.id);
   if (!user) {
      res.status(404).json({
         status: "Failed",
         message: "The User belonging to this token no longer exists",
         redirect: "/login",
      });
      return next(new AppError("The User belonging to this token no longer exists", 401));
   }

   // Check if user changed password after token was issued
   if (user.changedPasswordAt(decoded.iat)) {
      res.status(401).json({
         status: "Failed",
         message: "User changed password, Login again",
         redirect: "/login",
      });
      return next(new AppError("User changed password, Login again", 401));
   }

   // Grant Access to the Protected Rutes
   req.user = user;
   next();
});

// Authorization middleware
export const restrict = CatchAsync(async (req, res, next) => {
   // Check if user is admin
   if (req.user.role !== "admin") {
      return next(new AppError("You do not have permission to perform this action", 403));
   }
   next();
});

// Logout
export const logout = CatchAsync(async (req, res, next) => {
   // Clear cookie
   res.status(200)
      .cookie("jwt", "loggedout", {
         expires: new Date(Date.now() + 5 * 1000),
         httpOnly: true,
      })
      .json({
         status: "success",
         message: "Logged out successfully",
      });
});
