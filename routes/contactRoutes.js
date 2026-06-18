import express from "express";
import Contact from "../models/Contact.js";
import { Resend } from "resend";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("=================================");
    console.log("NEW CONTACT REQUEST RECEIVED");
    console.log(req.body);
    console.log("=================================");

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Save to MongoDB
    const newContact = await Contact.create({
      name,
      email,
      message,
    });

    console.log("✅ Saved to MongoDB");

    // Email Notification
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);

        const resend = new Resend(process.env.RESEND_API_KEY);

        console.log("📧 Sending email...");

        const emailResponse = await resend.emails.send({
          from: process.env.FROM_EMAIL,
          to: process.env.TO_EMAIL,
          subject: `New Portfolio Message from ${name}`,
          html: `
            <h2>New Portfolio Contact</h2>

            <p><strong>Name:</strong> ${name}</p>

            <p><strong>Email:</strong> ${email}</p>

            <p><strong>Message:</strong></p>

            <p>${message}</p>
          `,
        });

        console.log("✅ Email sent");
        console.log(emailResponse);
      } catch (emailError) {
        console.error("❌ RESEND ERROR");
        console.error(emailError);
      }
    } else {
      console.log("❌ RESEND_API_KEY missing");
    }

    return res.status(200).json({
      success: true,
      data: newContact,
    });
  } catch (error) {
    console.error("❌ ROUTE ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;