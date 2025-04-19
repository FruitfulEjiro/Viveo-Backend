import nodemailer from "nodemailer";

// Create Transporter
const transporter = nodemailer.createTransport({
   service: "", // Use your email provider
   auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password
   },
});

// Send Email Function
const sendEmail = async (to, subject, text) => {
   try {
      const info = await transporter.sendMail({
         from: process.env.EMAIL_USER,
         to,
         subject,
         text,
      });
      return info;
   } catch (error) {
      console.log(error);
   }
};

export default sendEmail;