import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import listingRouter from "./routes/listing.route.js";
import authRouter from "./routes/auth.route.js";
import bookingRouter from "./routes/booking.route.js";
import legalRouter from "./routes/legal.route.js";
import contactRouter from "./routes/contact.route.js";

const app = express();

app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true, limit: "6mb" }));
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS || "").split(",")
]
  .map((origin) => String(origin || "").trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/listing", listingRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/legal", legalRouter);
app.use("/api/contact", contactRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Zenstay backend is running",
    apiBase: "/api"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      message: "Listing payload is too large. Please use smaller images."
    });
  }
  if (error) {
    console.error("app middleware error", error);
    return res.status(error.status || 500).json({
      message: error?.message || "Internal server error"
    });
  }
  next();
});

export default app;
