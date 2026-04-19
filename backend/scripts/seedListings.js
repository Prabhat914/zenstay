
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

// 🔥 Seed Data
const seedListings = [
  {
    title: "Trending Lake View Villa",
    description: "Scenic villa with modern rooms and concierge service.",
    category: "villa",
    city: "Udaipur",
    landMark: "Fateh Sagar Lake",
    rent: 5200,
    ratings: 4.8,
    image1: "https://images.unsplash.com/photo-1613977257363-707ba9348227",
    image2: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    image3: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
  },
  {
    title: "Green Valley Farm House",
    description: "Farm house with lawn and barbecue.",
    category: "farmHouse",
    city: "Nashik",
    landMark: "Sula Vineyards",
    rent: 3800,
    ratings: 4.5,
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    image2: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    image3: "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
  },
  {
    title: "Forest Edge Cabin",
    description: "Wooden cabin with mountain views.",
    category: "cabin",
    city: "Manali",
    landMark: "Old Manali",
    rent: 4100,
    ratings: 4.7,
    image1: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    image2: "https://images.unsplash.com/photo-1472224371017-08207f84aaae",
    image3: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
  },

  // 🔥 60 Mixed Listings
  ...Array.from({ length: 60 }, (_, i) => ({
    title: `Comfort Stay ${i + 1}`,
    description: "Clean rooms, WiFi, great service.",
    category: i % 2 === 0 ? "hotel" : "pg",
    city: [
      "Jaipur","Goa","Chennai","Kolkata","Pune",
      "Lucknow","Ahmedabad","Indore","Chandigarh","Shimla"
    ][i % 10],
    landMark: [
      "City Center","Beach Road","Railway Station",
      "Mall Road","IT Park","Airport Area"
    ][i % 6],
    rent: 800 + i * 100,
    ratings: Number((3.5 + (i % 15) * 0.1).toFixed(1)),
    image1: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    image2: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
    image3: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
  })),

  // 🔥 60 Extra Hotels
  ...Array.from({ length: 60 }, (_, i) => ({
    title: `Luxury Hotel ${i + 1}`,
    description: "Premium hotel with breakfast and AC rooms.",
    category: "hotel",
    city: [
      "Mumbai","Delhi","Bangalore","Hyderabad","Kolkata",
      "Chennai","Goa","Jaipur","Udaipur","Varanasi"
    ][i % 10],
    landMark: [
      "Near Airport","City Center","Railway Station",
      "Mall Road","Beach Area","Business Hub"
    ][i % 6],
    rent: 2000 + i * 150,
    ratings: Number((4.0 + (i % 10) * 0.1).toFixed(1)),
    image1: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    image2: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
    image3: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
  }))
];

async function run() {
  if (!mongoUrl) throw new Error("Missing Mongo URI");

  await mongoose.connect(mongoUrl);
  console.log("✅ Mongo Connected");

  // 🔥 Optional: clear old data
  await Listing.deleteMany({});

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

    console.log("✅ Host Created");
  }

  const addedIds = [];

  for (const item of seedListings) {
    const listing = await Listing.create({
      ...item,
      host: host._id,
      isBooked: false
    });
    addedIds.push(listing._id);
  }

  await User.findByIdAndUpdate(host._id, {
    $addToSet: { listing: { $each: addedIds } }
  });

  const total = await Listing.countDocuments();
  console.log(`✅ Seed Done: ${total} Listings`);

  await mongoose.disconnect();
  console.log("✅ Mongo Disconnected");
}

run().catch(async (err) => {
  console.error("❌ Error:", err.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
