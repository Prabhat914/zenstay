import app from "../app.js";
import connectDb from "../config/db.js";

let connected = false;

async function ensureDbConnection() {
  if (!connected) {
    await connectDb();
    connected = true;
  }
}

export default async function handler(req, res) {
  try {
    await ensureDbConnection();
  } catch (error) {
    return res.status(503).json({
      status: "error",
      message: "Database connection unavailable",
      detail: error?.message || "Unknown database error"
    });
  }
  return app(req, res);
}
