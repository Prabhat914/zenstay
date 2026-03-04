import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
const TARGET_PER_CATEGORY = 10;

const catalog = [
  {
    category: "villa",
    city: "Udaipur",
    landMark: "Fateh Sagar Lake",
    baseTitle: "Zenstay Lake Villa",
    description: "Private rental villa stay with bedrooms, kitchen and peaceful lake-side vibe.",
    rent: 5200
  },
  {
    category: "farmHouse",
    city: "Nashik",
    landMark: "Sula Vineyards",
    baseTitle: "Zenstay Green Farm House",
    description: "Spacious rental farm house with open lawn, family seating and quiet surroundings.",
    rent: 3800
  },
  {
    category: "poolHouse",
    city: "Goa",
    landMark: "Candolim Beach",
    baseTitle: "Zenstay Blue Pool House",
    description: "Pool-facing rental stay with private rooms, lounge deck and vacation comfort.",
    rent: 6900
  },
  {
    category: "rooms",
    city: "Delhi",
    landMark: "Karol Bagh",
    baseTitle: "Zenstay Budget Room",
    description: "Affordable rental room near transit, food points and daily essentials.",
    rent: 1700
  },
  {
    category: "flat",
    city: "Bengaluru",
    landMark: "Koramangala",
    baseTitle: "Zenstay Service Flat",
    description: "Fully furnished rental flat with kitchen, wifi and long-stay comfort.",
    rent: 3200
  },
  {
    category: "pg",
    city: "Pune",
    landMark: "Hinjewadi",
    baseTitle: "Zenstay Student PG",
    description: "Comfortable PG rental with shared amenities, meals and flexible plans.",
    rent: 950
  },
  {
    category: "cabin",
    city: "Manali",
    landMark: "Old Manali",
    baseTitle: "Zenstay Forest Cabin",
    description: "Cozy rental cabin stay with mountain views and warm wooden interiors.",
    rent: 4100
  },
  {
    category: "shops",
    city: "Noida",
    landMark: "Sector 62",
    baseTitle: "Zenstay Private Room",
    description: "Comfortable private rental room for short and long stay booking.",
    rent: 2100
  }
];

function uniqueImage(category, index, slot) {
  const tagsByCategory = {
    villa: "villa,house,interior,bedroom",
    farmHouse: "farmhouse,home,interior,bedroom",
    poolHouse: "poolhouse,villa,interior,property",
    rooms: "bedroom,hotel,room,interior",
    flat: "apartment,flat,interior,home",
    pg: "room,shared,hostel,interior",
    cabin: "cabin,wooden,interior,house",
    shops: "rental,room,interior,apartment"
  };
  const tag = tagsByCategory[category] || "room,house,interior,property";
  const lock = ((index - 1) * 3) + slot; // 1..30 for 10 listings x 3 images
  return `https://loremflickr.com/1200/800/${tag}?lock=${lock}`;
}

async function getOrCreateDemoHost() {
  let host = await User.findOne({ email: "demo.host@zenstay.com" });
  if (host) return host;

  const hash = await bcrypt.hash("DemoHost@123", 10);
  host = await User.create({
    name: "Zenstay Demo Host",
    email: "demo.host@zenstay.com",
    password: hash,
    listing: [],
    booking: []
  });
  return host;
}

async function run() {
  if (!mongoUrl) throw new Error("Missing MONGODB_URL/MONGO_URI in .env");
  await mongoose.connect(mongoUrl);

  const host = await getOrCreateDemoHost();
  const allIds = [];

  for (const item of catalog) {
    const existing = await Listing.countDocuments({
      host: host._id,
      category: item.category
    });
    const needed = Math.max(TARGET_PER_CATEGORY - existing, 0);

    for (let i = 1; i <= needed; i += 1) {
      const sequence = existing + i;
      const doc = await Listing.create({
        title: `${item.baseTitle} ${sequence}`,
        description: item.description,
        category: item.category,
        city: item.city,
        landMark: item.landMark,
        rent: item.rent + sequence * 40,
        ratings: 4 + (sequence % 10) / 10,
        image1: uniqueImage(item.category, sequence, 1),
        image2: uniqueImage(item.category, sequence, 2),
        image3: uniqueImage(item.category, sequence, 3),
        host: host._id,
        isBooked: false
      });
      allIds.push(doc._id);
    }

    // Normalize all existing listings so each one has unique media and rental-focused text.
    const currentCategoryListings = await Listing.find({
      host: host._id,
      category: item.category
    })
      .sort({ createdAt: 1, _id: 1 })
      .limit(TARGET_PER_CATEGORY);

    for (let i = 0; i < currentCategoryListings.length; i += 1) {
      const sequence = i + 1;
      const listing = currentCategoryListings[i];
      listing.title = `${item.baseTitle} ${sequence}`;
      listing.description = item.description;
      listing.city = item.city;
      listing.landMark = item.landMark;
      listing.rent = item.rent + sequence * 40;
      listing.ratings = 4 + (sequence % 10) / 10;
      listing.image1 = uniqueImage(item.category, sequence, 1);
      listing.image2 = uniqueImage(item.category, sequence, 2);
      listing.image3 = uniqueImage(item.category, sequence, 3);
      await listing.save();
    }
  }

  if (allIds.length > 0) {
    await User.findByIdAndUpdate(host._id, { $addToSet: { listing: { $each: allIds } } });
  }

  const summary = await Listing.aggregate([
    { $match: { host: host._id } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  console.log(JSON.stringify(summary));

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Topup failed:", err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
