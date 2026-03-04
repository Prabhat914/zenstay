import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

const seedListings = [
  {
    title: "Trending Lake View Villa",
    description: "Scenic villa with modern rooms and full-day concierge service.",
    category: "villa",
    city: "Udaipur",
    landMark: "Fateh Sagar Lake",
    rent: 5200,
    ratings: 4.8,
    image1: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Green Valley Farm House",
    description: "Quiet farm house with open lawn and family barbecue setup.",
    category: "farmHouse",
    city: "Nashik",
    landMark: "Sula Vineyards",
    rent: 3800,
    ratings: 4.5,
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Blue Deck Pool House",
    description: "Private pool house perfect for weekend parties and staycations.",
    category: "poolHouse",
    city: "Goa",
    landMark: "Candolim Beach",
    rent: 6900,
    ratings: 4.9,
    image1: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "City Budget Rooms",
    description: "Clean and affordable private rooms near transit and markets.",
    category: "rooms",
    city: "Delhi",
    landMark: "Karol Bagh",
    rent: 1700,
    ratings: 4.2,
    image1: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1616594039964-3f2b9dd2f7ab?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Skyline Service Flat",
    description: "Fully furnished flat with kitchen, wifi, and daily housekeeping.",
    category: "flat",
    city: "Bengaluru",
    landMark: "Koramangala",
    rent: 3200,
    ratings: 4.4,
    image1: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Student Friendly PG",
    description: "Shared PG with meals, laundry, and flexible monthly plans.",
    category: "pg",
    city: "Pune",
    landMark: "Hinjewadi",
    rent: 950,
    ratings: 4.1,
    image1: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Forest Edge Cabin",
    description: "Wooden cabin with mountain views and bonfire evenings.",
    category: "cabin",
    city: "Manali",
    landMark: "Old Manali",
    rent: 4100,
    ratings: 4.7,
    image1: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Zenstay Private Room",
    description: "Comfortable private room stay with essentials for daily living.",
    category: "shops",
    city: "Noida",
    landMark: "Sector 62",
    rent: 2100,
    ratings: 4.3,
    image1: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1616594039964-3f2b9dd2f7ab?auto=format&fit=crop&w=1200&q=80",
    image3: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
  }
];

async function run() {
  if (!mongoUrl) {
    throw new Error("Missing MONGODB_URL/MONGO_URI in .env");
  }

  await mongoose.connect(mongoUrl);

  let host = await User.findOne({ email: "demo.host@zenstay.com" });
  if (!host) {
    const hash = await bcrypt.hash("DemoHost@123", 10);
    host = await User.create({
      name: "Zenstay Demo Host",
      email: "demo.host@zenstay.com",
      password: hash,
      listing: [],
      booking: []
    });
  }

  const addedIds = [];
  for (const item of seedListings) {
    let listing = await Listing.findOne({ title: item.title, host: host._id });
    if (!listing) {
      listing = await Listing.create({ ...item, host: host._id, isBooked: false });
    }
    addedIds.push(listing._id);
  }

  await User.findByIdAndUpdate(host._id, { $addToSet: { listing: { $each: addedIds } } });

  const total = await Listing.countDocuments({ host: host._id });
  console.log(`Seed complete. Demo host listings: ${total}`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err.message || err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
