import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, ".env") })
import cors from "cors"
import userRouter from "./routes/user.route.js"
import listingRouter from "./routes/listing.route.js"
import bookingRouter from "./routes/booking.route.js"
import legalRouter from "./routes/legal.route.js"
import contactRouter from "./routes/contact.route.js"
let port = process.env.PORT || 6000

let app = express()
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    process.env.CLIENT_URL,
    ...(process.env.CORS_ORIGINS || "").split(",")
].map((origin) => String(origin || "").trim()).filter(Boolean)
app.use(cors({
    origin: (origin, callback) => {
        // Server-side requests may have no origin.
        if (!origin) {
            return callback(null, true);
        }
        // Allow local Vite dev and configured production frontends.
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
}))

app.use("/api/auth", authRouter )
app.use("/api/user", userRouter )
app.use("/api/listing",listingRouter )
app.use("/api/booking",bookingRouter )
app.use("/api/legal", legalRouter )
app.use("/api/contact", contactRouter )

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


app.listen(port,()=>{
    connectDb()
    console.log("server started")
})
