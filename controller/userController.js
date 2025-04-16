import CatchAsync from "express-async-handler";

// Local Modules
import User from "../model/User.js";
import AppError from "../utils/AppError.js";

export const updateUser = CatchAsync(async (req, res, next) => {
   const { id } = req.params;
   const { firstname, lastname, email, phone } = req.body;
   
   // Check if user exists
   const user = await User.findByIdAndUpdate(
      id,
      {
         fullname: {
            firstname,
            lastname,
         },
         email,
      },
      {
         new: true,
         runValidators: true,
      }
   );
   if (!user) {
      return next(new AppError("User not found", 404));
   }

   res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
         user,
      },
   });
});

export const getUser = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   // Check if user exists
   const user = await User.findById(id);
   if (!user) {
      return next(new AppError("User not found", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         user,
      },
   });
});

export const getAllUsers = CatchAsync(async (req, res) => {
   const users = await User.find();

   res.status(200).json({
      status: "success",
      results: users.length,
      data: {
         users,
      },
   });
});

export const deleteUser = CatchAsync(async (req, res, next) => {
   const { id } = req.params;

   // Check if user exists
   const user = await User.findByIdAndDelete(id);
   if (!user) {
      return next(new AppError("User not found", 404));
   }

   res.status(200).json({
      status: "success",
      message: "User deleted successfully",
   });
});
