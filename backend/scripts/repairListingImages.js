import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

function safeSeed(...parts) {
  return encodeURIComponent(parts.filter(Boolean).join("-").toLowerCase());
}

function picsum(seed) {
  return `https://picsum.photos/seed/${seed}/1200/800`;
}

async function run() {
  if (!mongoUrl) {
    throw new Error("Missing MONGODB_URL/MONGO_URI in .env");
  }

  await mongoose.connect(mongoUrl);

  const demoHost = await User.findOne({ email: "demo.host@zenstay.com" }).select("_id");
  if (!demoHost) {
    console.log("Demo host not found. Nothing to repair.");
    await mongoose.disconnect();
    return;
  }

  const listings = await Listing.find({ host: demoHost._id }).select(
    "_id title category city landMark image1 image2 image3"
  );

  let repaired = 0;

  for (const listing of listings) {
    const base = safeSeed(listing.category, listing.city, listing.landMark, String(listing._id));
    const nextImage1 = picsum(`${base}-1`);
    const nextImage2 = picsum(`${base}-2`);
    const nextImage3 = picsum(`${base}-3`);

    const changed =
      listing.image1 !== nextImage1 ||
      listing.image2 !== nextImage2 ||
      listing.image3 !== nextImage3;

    if (!changed) continue;

    listing.image1 = nextImage1;
    listing.image2 = nextImage2;
    listing.image3 = nextImage3;
    await listing.save();
    repaired += 1;
  }

  console.log(`Repaired images for ${repaired} listings.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Repair failed:", err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
