import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { createRequire } from "module";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

function inferCategory(title = "") {
  const t = title.toLowerCase();
  if (t.includes("villa")) return "villa";
  if (t.includes("farm")) return "farmHouse";
  if (t.includes("pool")) return "poolHouse";
  if (t.includes("flat") || t.includes("apartment") || t.includes("loft") || t.includes("penthouse")) return "flat";
  if (t.includes("pg")) return "pg";
  if (t.includes("cabin") || t.includes("chalet") || t.includes("treehouse")) return "cabin";
  if (t.includes("shop")) return "shops";
  return "rooms";
}

async function getOrCreateDemoHost() {
  let host = await User.findOne({ email: "demo.host@zenstay.com" });
  if (host) return host;

  const hash = await bcrypt.hash("DemoHost@123", 10);
  return User.create({
    name: "Zenstay Demo Host",
    email: "demo.host@zenstay.com",
    password: hash,
    listing: [],
    booking: []
  });
}

async function run() {
  if (!mongoUrl) {
    throw new Error("Missing MONGODB_URL/MONGO_URI in .env");
  }

  const userProvidedPath = process.argv[2];
  const defaultPath = "C:/Users/moto g/Downloads/data (2).js";
  const dataFilePath = path.resolve(userProvidedPath || defaultPath);

  const require = createRequire(import.meta.url);
  const dataset = require(dataFilePath);
  const records = Array.isArray(dataset?.data) ? dataset.data : [];

  if (records.length === 0) {
    throw new Error(`No data found in: ${dataFilePath}`);
  }

  await mongoose.connect(mongoUrl);
  const host = await getOrCreateDemoHost();
  const addedIds = [];

  for (const item of records) {
    const title = String(item?.title || "").trim();
    const description = String(item?.description || "").trim();
    const url = String(item?.image?.url || "").trim();
    const city = String(item?.location || "Unknown").trim();
    const country = String(item?.country || "Unknown").trim();
    const landMark = city;
    const rent = Number(item?.price || 0);
    const category = inferCategory(title);

    if (!title || !description || !url || !rent) {
      continue;
    }

    const update = {
      title,
      description,
      host: host._id,
      image1: url,
      image2: url,
      image3: url,
      rent,
      city,
      country,
      landMark,
      category,
      isBooked: false
    };

    const listing = await Listing.findOneAndUpdate(
      { title, host: host._id },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    addedIds.push(listing._id);
  }

  if (addedIds.length > 0) {
    await User.findByIdAndUpdate(host._id, { $addToSet: { listing: { $each: addedIds } } });
  }

  console.log(`Imported ${addedIds.length} listings from ${dataFilePath}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Import failed:", err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
