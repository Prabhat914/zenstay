import nodemailer from "nodemailer";

const normalizeEnvValue = (value) => String(value || "")
  .replace(/^['"]|['"]$/g, "")
  .replace(/\\r/g, "")
  .replace(/\\n/g, "")
  .trim();

const smtpHost = normalizeEnvValue(process.env.SMTP_HOST);
const smtpPort = Number(normalizeEnvValue(process.env.SMTP_PORT) || 587);
const smtpUser = normalizeEnvValue(process.env.SMTP_USER);
const smtpPass = normalizeEnvValue(process.env.SMTP_PASS);
const fromEmail = normalizeEnvValue(process.env.FROM_EMAIL || smtpUser);

export const hasMailConfig = Boolean(smtpHost && smtpPort && smtpUser && smtpPass && fromEmail);

let transporter = null;

const getTransporter = () => {
  if (!hasMailConfig) {
    throw new Error("SMTP configuration is incomplete");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }
  return transporter;
};

export const sendOtpEmail = async ({ toEmail, otp }) => {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: fromEmail,
    to: toEmail,
    subject: "Zenstay password reset OTP",
    text: `Your Zenstay OTP is ${otp}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2 style="color:#2bb8bf">Zenstay Password Reset</h2>
      <p>Your OTP is:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#239aa0">${otp}</div>
      <p>This OTP expires in 10 minutes.</p>
    </div>`
  });
};
