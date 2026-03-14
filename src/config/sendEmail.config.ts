import transporter from "./email.config.js";

const htmlBoilerPlate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Verification Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 520px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .header {
      background: #4f46e5;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }

    .content {
      padding: 28px;
      text-align: center;
    }

    .content p {
      font-size: 15px;
      color: #333333;
      line-height: 1.6;
      margin: 10px 0;
    }

    .otp {
      margin: 22px 0;
      font-size: 32px;
      letter-spacing: 6px;
      font-weight: bold;
      color: #4f46e5;
    }

    .note {
      font-size: 13px;
      color: #6b7280;
      margin-top: 20px;
    }

    .footer {
      background-color: #f9fafb;
      padding: 14px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      Email Verification
    </div>

    <div class="content">
      <p>Hello 👋</p>

      <p>
        Use the verification code below to complete your process.
      </p>

      <div class="otp">
        {{OTP_CODE}}
      </div>

      <p>
        This code is valid for <strong>10 minutes</strong>.
      </p>

      <p class="note">
        If you did not request this, please ignore this email.
      </p>
    </div>

    <div class="footer">
      © 2025 MindVault
    </div>
  </div>
</body>
</html>
`

const sendEmail = async (email: string, verificationCode: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"MindVault" <scienceduniya0@gmail.com>`,
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${verificationCode}`,
      html: htmlBoilerPlate.replace("{{OTP_CODE}}", verificationCode),
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error; // Re-throw so the controller can handle/return it
  }
};


export default sendEmail;