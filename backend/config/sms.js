import twilio from "twilio";

const accountSid = String(process.env.TWILIO_ACCOUNT_SID || "").trim();
const authToken = String(process.env.TWILIO_AUTH_TOKEN || "").trim();
const fromPhone = String(process.env.TWILIO_PHONE_NUMBER || "").trim();

export const hasSmsConfig = Boolean(accountSid && authToken && fromPhone);

let client = null;

const getClient = () => {
  if (!hasSmsConfig) {
    throw new Error("Twilio SMS configuration is incomplete");
  }
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
};

export const sendOtpSms = async ({ toPhone, otp }) => {
  const smsClient = getClient();
  await smsClient.messages.create({
    body: `Your Zenstay OTP is ${otp}. It expires in 10 minutes.`,
    from: fromPhone,
    to: toPhone
  });
};
