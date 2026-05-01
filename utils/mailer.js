import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail', // or your provider, e.g., 'hotmail', 'yahoo', etc.
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
}
