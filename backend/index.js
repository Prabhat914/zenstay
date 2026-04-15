import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import connectDb from "./config/db.js";
import app from "./app.js";
import { attachSocketServer } from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const port = process.env.PORT || 6000;
const httpServer = http.createServer(app);

const startServer = async () => {
  try {
    await connectDb();
    const io = attachSocketServer(httpServer, { corsOptions: app.get("corsOptions") });
    app.set("io", io);
    httpServer.listen(port, () => {
      console.log("server started");
    });
  } catch (error) {
    console.error("server bootstrap error", error?.message || error);
    process.exit(1);
  }
};

startServer();
