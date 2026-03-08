import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDb from "./config/db.js";
import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const port = process.env.PORT || 6000;

const startServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log("server started");
    });
  } catch (error) {
    console.error("server bootstrap error", error?.message || error);
    process.exit(1);
  }
};

startServer();
