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
  await ensureDbConnection();
  return app(req, res);
}
