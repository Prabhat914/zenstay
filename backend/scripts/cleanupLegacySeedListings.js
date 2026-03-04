import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

async function run() {
  if (!mongoUrl) {
    throw new Error("Missing MONGODB_URL/MONGO_URI in .env");
  }

  await mongoose.connect(mongoUrl);

  const host = await User.findOne({ email: "demo.host@zenstay.com" });
  if (!host) {
    console.log("No demo host found. Nothing to clean.");
    await mongoose.disconnect();
    return;
  }

  const legacyListings = await Listing.find({
    host: host._id,
    $or: [
      { title: /^Zenstay\s/i },
      { image1: /loremflickr\.com/i },
      { image2: /loremflickr\.com/i },
      { image3: /loremflickr\.com/i }
    ]
  }).select("_id");

  const ids = legacyListings.map((item) => item._id);
  if (ids.length === 0) {
    console.log("No legacy seeded listings found.");
    await mongoose.disconnect();
    return;
  }

  await Listing.deleteMany({ _id: { $in: ids } });
  await User.findByIdAndUpdate(host._id, { $pull: { listing: { $in: ids } } });

  console.log(`Deleted ${ids.length} legacy listings.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Cleanup failed:", err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
