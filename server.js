// Error Handling for synchronous functions outside Express
process.on("uncaughtException", (err) => {
   console.log("An uncaught error occured:", err);
   process.exit(1);
});

import dotenv from "dotenv";

// Local Modules
import app from "./app.js";
import connectDB from "./model/DB.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

// Error Handling for asynchronous functions outside Express
process.on("unhandledRejection", (error) => {
   console.log(error);
   console.log("Unhandled Rejection: Shutting Down");

   server.close(() => {
      process.exit(1);
   });
});
