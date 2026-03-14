import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

// console.log(process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user:process.env.SMTP_USER,
    pass:process.env.SMTP_PASS,
    }
  })

export default transporter;