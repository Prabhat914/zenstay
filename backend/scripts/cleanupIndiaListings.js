import dotenv from "dotenv";
import mongoose from "mongoose";
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

function isIndianListing(listing) {
  const normalizedCountry = normalizeText(listing?.country).toLowerCase();
  if (normalizedCountry === "india") {
    return true;
  }
  const haystack = `${normalizeText(listing?.city)} ${normalizeText(listing?.landMark)} ${normalizeText(listing?.title)}`.toLowerCase();
  return INDIA_CITY_HINTS.some((hint) => haystack.includes(hint));
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

async function run() {
  if (!mongoUrl) {
    throw new Error("Missing MONGODB_URL/MONGO_URI in .env");
  }

  await mongoose.connect(mongoUrl);

  const demoHost = await User.findOne({ email: "demo.host@zenstay.com" }).select("_id listing");
  if (!demoHost) {
    console.log("Demo host not found. Nothing to clean.");
    await mongoose.disconnect();
    return;
  }

  const listings = await Listing.find({ host: demoHost._id });
  const deletedIds = [];
  let updated = 0;

  for (const listing of listings) {
    if (!isIndianListing(listing)) {
      deletedIds.push(listing._id);
      await listing.deleteOne();
      continue;
    }

    const [image1, image2, image3] = buildLocationImages(
      listing.category,
      listing.city,
      listing.landMark,
      listing.title
    );

    const changed =
      normalizeText(listing.country) !== "India" ||
      listing.image1 !== image1 ||
      listing.image2 !== image2 ||
      listing.image3 !== image3;

    if (!changed) {
      continue;
    }

    listing.country = "India";
    listing.image1 = image1;
    listing.image2 = image2;
    listing.image3 = image3;
    await listing.save();
    updated += 1;
  }

  if (deletedIds.length > 0) {
    await User.findByIdAndUpdate(demoHost._id, {
      $pull: { listing: { $in: deletedIds } }
    });
  }

  console.log(`Deleted ${deletedIds.length} non-India listings.`);
  console.log(`Updated ${updated} India listings with location-aware images.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("India cleanup failed:", error?.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
