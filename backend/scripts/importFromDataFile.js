import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { createRequire } from "module";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

const INDIA_CITY_HINTS = [
  "agra",
  "ahmedabad",
  "alibaug",
  "amritsar",
  "bengaluru",
  "bangalore",
  "bhopal",
  "chandigarh",
  "chennai",
  "coorg",
  "delhi",
  "dehradun",
  "goa",
  "gurugram",
  "hyderabad",
  "indore",
  "jaipur",
  "jodhpur",
  "kochi",
  "kolkata",
  "lonavala",
  "lucknow",
  "manali",
  "mumbai",
  "mussoorie",
  "mysuru",
  "nainital",
  "nashik",
  "noida",
  "pune",
  "rishikesh",
  "shimla",
  "udaipur",
  "varanasi"
];

function normalizeText(value = "") {
  return String(value || "").trim();
}

function safeSeed(...parts) {
  return encodeURIComponent(parts.filter(Boolean).join("-").toLowerCase());
}

function buildLocationImages(category, city, landMark, title) {
  const tagsByCategory = {
    villa: "villa,house,india",
    farmHouse: "farmhouse,india,home",
    poolHouse: "pool,villa,india",
    rooms: "hotel,room,india",
    flat: "apartment,india,interior",
    pg: "hostel,room,india",
    cabin: "cabin,mountain,india",
    shops: "shop,storefront,india"
  };
  const categoryTags = tagsByCategory[category] || "stay,india,property";
  const locationTags = [city, landMark, title, "india"]
    .map((item) => normalizeText(item).toLowerCase().replace(/\s+/g, ","))
    .filter(Boolean)
    .join(",");
  const tags = [categoryTags, locationTags].filter(Boolean).join(",");
  const base = safeSeed(category, city, landMark, title);
  return [
    `https://loremflickr.com/1200/800/${tags}?lock=${base}-1`,
    `https://loremflickr.com/1200/800/${tags}?lock=${base}-2`,
    `https://loremflickr.com/1200/800/${tags}?lock=${base}-3`
  ];
}

function isIndianRecord({ city = "", country = "", location = "" }) {
  const normalizedCountry = normalizeText(country).toLowerCase();
  if (normalizedCountry === "india") {
    return true;
  }
  const haystack = `${normalizeText(city)} ${normalizeText(location)}`.toLowerCase();
  return INDIA_CITY_HINTS.some((hint) => haystack.includes(hint));
}

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
    const title = normalizeText(item?.title);
    const description = normalizeText(item?.description);
    const url = normalizeText(item?.image?.url);
    const city = normalizeText(item?.location || "Unknown");
    const country = normalizeText(item?.country || "Unknown");
    const landMark = city;
    const rent = Number(item?.price || 0);
    const category = inferCategory(title);

    if (!title || !description || !rent) {
      continue;
    }
    if (!isIndianRecord({ city, country, location: item?.location })) {
      continue;
    }

    const [image1, image2, image3] = buildLocationImages(category, city, landMark, title);

    const update = {
      title,
      description,
      host: host._id,
      image1: image1 || url,
      image2: image2 || url,
      image3: image3 || url,
      rent,
      city,
      country: "India",
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
