import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

const rawCatalog = [
  { title: "Trending Marine Drive Skyline Villa", category: "villa", city: "Mumbai", landMark: "28 Marine Drive, Churchgate", rent: 11800 },
  { title: "Royal Garden Villa", category: "villa", city: "Jaipur", landMark: "52 Civil Lines Road, Near Raj Bhawan", rent: 9200 },
  { title: "Lake Palace Villa", category: "villa", city: "Udaipur", landMark: "14 Fateh Sagar Link Road, Malla Talai", rent: 10800 },
  { title: "Palm Coast Villa", category: "villa", city: "Goa", landMark: "9 Candolim Beach Road, Bardez", rent: 11200 },
  { title: "Emerald Hills Villa", category: "villa", city: "Bengaluru", landMark: "31 Nandi Hills Approach Road, Chikkaballapur", rent: 9800 },

  { title: "Trending Vineyard Farm House", category: "farmHouse", city: "Nashik", landMark: "18 Sula Vineyard Road, Govardhan", rent: 7600 },
  { title: "Baag Retreat Farm House", category: "farmHouse", city: "Mohali", landMark: "22 Kharar Landran Road, Kharar", rent: 6900 },
  { title: "Monsoon Meadow Farm House", category: "farmHouse", city: "Karjat", landMark: "7 Kashele Road, Karjat Hills", rent: 7200 },
  { title: "Chhattarpur Orchard Farm House", category: "farmHouse", city: "Delhi", landMark: "44 Farm Estate Lane, Chhattarpur", rent: 8100 },
  { title: "Riverside Mango Farm House", category: "farmHouse", city: "Lucknow", landMark: "12 Sultanpur Road, Ahimamau", rent: 6700 },

  { title: "Trending Blue Tide Pool House", category: "poolHouse", city: "Goa", landMark: "16 Calangute Baga Road, Calangute", rent: 8800 },
  { title: "Courtyard Pool House", category: "poolHouse", city: "Chennai", landMark: "77 East Coast Road, Neelankarai", rent: 7900 },
  { title: "Aravalli Pool House", category: "poolHouse", city: "Jaipur", landMark: "34 Kukas Amer Road, Kukas", rent: 7600 },
  { title: "Palm Lagoon Pool House", category: "poolHouse", city: "Hyderabad", landMark: "11 Gandipet Lake Road, Osman Sagar", rent: 8200 },
  { title: "Lakeside Splash Pool House", category: "poolHouse", city: "Udaipur", landMark: "25 Rani Road, Fateh Sagar", rent: 8400 },

  { title: "Trending Gateway Hotel Rooms", category: "rooms", city: "Mumbai", landMark: "4 Colaba Causeway, Apollo Bunder", rent: 3400 },
  { title: "Cyber City Executive Rooms", category: "rooms", city: "Gurugram", landMark: "18 Cyber Hub Lane, DLF Phase 2", rent: 2800 },
  { title: "Heritage Ghat Rooms", category: "rooms", city: "Varanasi", landMark: "63 Assi Ghat Road, Bhelupur", rent: 2300 },
  { title: "Tech Park Business Rooms", category: "rooms", city: "Bengaluru", landMark: "12 Electronics City Phase 1 Main Road", rent: 2600 },
  { title: "Beachside Comfort Rooms", category: "rooms", city: "Puducherry", landMark: "29 Beach Road, White Town", rent: 2500 },

  { title: "Trending Skyline Service Flat", category: "flat", city: "Bengaluru", landMark: "45 5th Block Main Road, Koramangala", rent: 4300 },
  { title: "Metro View Flat", category: "flat", city: "Noida", landMark: "A-72 Sector 76 Central Avenue", rent: 3600 },
  { title: "Sea Breeze Flat", category: "flat", city: "Mumbai", landMark: "21 Versova Link Road, Andheri West", rent: 5200 },
  { title: "Capital Residency Flat", category: "flat", city: "Delhi", landMark: "17 Green Park Main, South Delhi", rent: 4700 },
  { title: "Riverside Balcony Flat", category: "flat", city: "Ahmedabad", landMark: "39 Riverfront West Road, Paldi", rent: 3400 },

  { title: "Trending Student Hub PG", category: "pg", city: "Pune", landMark: "88 Hinjewadi Phase 1 Road, Hinjewadi", rent: 1400 },
  { title: "Metro Stay PG", category: "pg", city: "Delhi", landMark: "12 Batra Cinema Lane, Mukherjee Nagar", rent: 1350 },
  { title: "Campus Comfort PG", category: "pg", city: "Noida", landMark: "C-19 Sector 62 Institutional Area", rent: 1500 },
  { title: "Lake City PG", category: "pg", city: "Udaipur", landMark: "6 University Road, Ashok Nagar", rent: 1200 },
  { title: "Techie Nest PG", category: "pg", city: "Hyderabad", landMark: "27 Hitech City Main Street, Madhapur", rent: 1600 },

  { title: "Trending Pine Crest Cabin", category: "cabin", city: "Manali", landMark: "14 Log Huts Area Road, Old Manali", rent: 5600 },
  { title: "Snowline Cabin", category: "cabin", city: "Shimla", landMark: "23 Kufri Bypass Road, Kufri", rent: 5100 },
  { title: "Valley View Cabin", category: "cabin", city: "Nainital", landMark: "8 Pangot Forest Road, Pangot", rent: 4800 },
  { title: "Tea Garden Cabin", category: "cabin", city: "Munnar", landMark: "19 Tea Estate Road, Pallivasal", rent: 5400 },
  { title: "Riverstone Cabin", category: "cabin", city: "Rishikesh", landMark: "5 Neelkanth Temple Road, Tapovan", rent: 4600 },

  { title: "Trending High Street Shop", category: "shops", city: "Mumbai", landMark: "44 Linking Road, Bandra West", rent: 7400 },
  { title: "Market Square Shop", category: "shops", city: "Indore", landMark: "18 MG Road, South Tukoganj", rent: 5200 },
  { title: "Bazaar Front Shop", category: "shops", city: "Jaipur", landMark: "9 MI Road, Panch Batti", rent: 5800 },
  { title: "Metro Retail Shop", category: "shops", city: "Noida", landMark: "22 Sector 18 Atta Market", rent: 6100 },
  { title: "Temple Street Shop", category: "shops", city: "Varanasi", landMark: "31 Godowlia Chowk, Dashashwamedh", rent: 5000 }
];

function safeSeed(...parts) {
  return encodeURIComponent(parts.filter(Boolean).join("-").toLowerCase());
}

function buildImages(category, city, title, landMark) {
  const tagsByCategory = {
    villa: "india,villa,luxury,exterior",
    farmHouse: "india,farmhouse,nature,home",
    poolHouse: "india,pool,villa,luxury",
    rooms: "india,hotel,room,interior",
    flat: "india,apartment,interior,modern",
    pg: "india,hostel,room,interior",
    cabin: "india,cabin,mountain,wooden",
    shops: "india,shop,retail,storefront"
  };
  const tag = tagsByCategory[category] || "india,property,stay";
  const lock = safeSeed(category, city, title, landMark);
  return [
    `https://loremflickr.com/1200/800/${tag}?lock=${lock}-1`,
    `https://loremflickr.com/1200/800/${tag}?lock=${lock}-2`,
    `https://loremflickr.com/1200/800/${tag}?lock=${lock}-3`
  ];
}

function buildDescription(item) {
  const categoryLabels = {
    villa: "villa stay",
    farmHouse: "farm house stay",
    poolHouse: "pool house stay",
    rooms: "hotel room stay",
    flat: "service flat stay",
    pg: "PG stay",
    cabin: "cabin stay",
    shops: "shop rental"
  };
  return `${item.title} is a premium ${categoryLabels[item.category] || "property"} in ${item.city}, India near ${item.landMark}. It comes with verified locality details, comfortable interiors, and image-backed listing media for Zenstay guests and hosts.`;
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

  await mongoose.connect(mongoUrl);
  const host = await getOrCreateDemoHost();
  const syncedIds = [];

  for (const item of rawCatalog) {
    const [image1, image2, image3] = buildImages(item.category, item.city, item.title, item.landMark);
    const listing = await Listing.findOneAndUpdate(
      { host: host._id, title: item.title },
      {
        title: item.title,
        description: buildDescription(item),
        host: host._id,
        image1,
        image2,
        image3,
        rent: item.rent,
        city: item.city,
        country: "India",
        landMark: item.landMark,
        category: item.category,
        isBooked: false
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    syncedIds.push(listing._id);
  }

  await User.findByIdAndUpdate(host._id, {
    $addToSet: { listing: { $each: syncedIds } }
  });

  const summary = await Listing.aggregate([
    { $match: { host: host._id, country: "India" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  console.log(`Synced ${syncedIds.length} India listings.`);
  console.log(JSON.stringify(summary));
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("seedIndiaCatalog failed:", error?.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
