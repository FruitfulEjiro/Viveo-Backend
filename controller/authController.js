import CatchAsync from "express-async-handler";
import jwt from "jsonwebtoken";

// Local Modules
import createSendToken from "../middleware/jwt.js";
import User from "../model/User.js";
import AppError from "../utils/AppError.js";

// Signup function
export const signup = CatchAsync(async (req, res, next) => {
   const { firstname, lastname, email, password } = req.body;

   console.log(firstname, lastname, email, password);
   // Create User
   const newUser = await User.create({
      fullname: {
         firstname,
         lastname,
      },
      email,
      password,
   });

   // Generate JWT token and send via Cookie
   createSendToken(newUser, 201, res);
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

   // Generate JWT token and send via Cookie
   createSendToken(user, 200, res);
});

export const protect = (req, rex, next) => {
   // Get token from Cookie
   const token = req.cookies.jwt;
   // Check if token exists
   if (!token) {
      return next(new AppError("You are not logged in!!", 401));
   }
   // Verify token
   jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
         return next(new AppError("Invalid Token", 401));
      }
      // Find user by id
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
         return next(new AppError("The user belonging to this token does no longer exist", 401));
      }
      // Grant access to protected route
      req.user = currentUser;
      next();
   });
};

export const restrict = (req, res, next) => {
   // Check if user is admin
   if (req.user.role !== "admin") {
      return next(new AppError("You do not have permission to perform this action", 403));
   }
   next();
};

export const logout = (req, res, next) => {
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
};
