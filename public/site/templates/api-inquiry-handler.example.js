// Example Node/Express handler for the Cappuccino Bag B2B inquiry form.
// Install dependencies in your backend project: npm install express nodemailer
// Configure the frontend form with: data-endpoint="/api/inquiry"

import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "INQUIRY_TO_EMAIL"
];

function validateInquiry(body) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+?[0-9\s().-]{7,20}$/;
  const errors = {};

  if (!body.name?.trim()) errors.name = "Name is required.";
  if (!emailPattern.test(body.email || "")) errors.email = "Valid email is required.";
  if (!phonePattern.test(body.phone || "")) errors.phone = "Valid international phone is required.";
  if (body.website) errors.spam = "Spam protection triggered.";

  return errors;
}

router.post("/api/inquiry", express.json(), async (req, res) => {
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  if (missingEnv.length) {
    return res.status(500).json({ error: `Missing server config: ${missingEnv.join(", ")}` });
  }

  const errors = validateInquiry(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const lines = [
    `Name: ${req.body.name}`,
    `Email: ${req.body.email}`,
    `Phone: ${req.body.phone}`,
    `Company: ${req.body.company || "-"}`,
    `Country / Region: ${req.body.country || "-"}`,
    `Product Requirement: ${req.body.product_requirement || req.body.productRequirement || "-"}`,
    "",
    "Message:",
    req.body.message || "-"
  ];

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.INQUIRY_TO_EMAIL,
    replyTo: req.body.email,
    subject: `New B2B Bag Inquiry - ${req.body.name}`,
    text: lines.join("\n")
  });

  // Optional database storage can be added here, for example:
  // await db.inquiries.insert({ ...req.body, createdAt: new Date() });

  return res.json({ ok: true });
});

export default router;
