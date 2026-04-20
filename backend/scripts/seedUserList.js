import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import Listing from "../model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

const rawData = [
    // Pool Houses / Villas
    { title: "Palm Pool Villa", category: "poolHouse", city: "Goa", landMark: "45 Beach View Road", rent: 7500 },
    { title: "Royal Retreat Pool House", category: "poolHouse", city: "Lonavala", landMark: "Hill Road", rent: 8200 },
    { title: "Lake Side Oasis", category: "poolHouse", city: "Udaipur", landMark: "Plot 18, Lake Side Road", rent: 6800 },
    { title: "Nainital Pool Resort", category: "poolHouse", city: "Nainital", landMark: "Resort Road", rent: 5500 },
    
    // Rooms / Hotels
    { title: "Assi Ghat Heritage Stay", category: "rooms", city: "Varanasi", landMark: "Assi Ghat", rent: 1800 },
    { title: "Shanti Lodge", category: "rooms", city: "Varanasi", landMark: "Room No. 12, Sigra Road", rent: 1200 },
    { title: "City Centre Executive Stay", category: "rooms", city: "Noida", landMark: "Sector 18, Near Metro", rent: 2500 },
    { title: "Electronic City Budget Stay", category: "rooms", city: "Noida", landMark: "Sector 62, Near Metro", rent: 2100 },
    { title: "Mukherjee Nagar Student Rooms", category: "rooms", city: "Delhi", landMark: "Om Mandir Marg", rent: 1500 },
    { title: "Navrangpura Premium Rooms", category: "rooms", city: "Ahmedabad", landMark: "CG Road", rent: 2800 },
    
    // Flats
    { title: "Ganga Residency Flat", category: "flat", city: "Prayagraj", landMark: "Civil Lines Road", rent: 3500 },
    { title: "Sea View Apartment", category: "flat", city: "Mumbai", landMark: "Andheri West Link Road", rent: 9500 },
    { title: "Green Park Apartment", category: "flat", city: "Noida", landMark: "Sector 76", rent: 4200 },
    { title: "Royal Residency Flat", category: "flat", city: "Lucknow", landMark: "Gomti Nagar Extension", rent: 3800 },
    
    // PGs
    { title: "Capital Stay PG", category: "pg", city: "Delhi", landMark: "Batra Cinema, Mukherjee Nagar", rent: 950 },
    { title: "Gomti Residency PG", category: "pg", city: "Lucknow", landMark: "Patrakarpuram Market", rent: 850 },
    { title: "Electronic City PG", category: "pg", city: "Noida", landMark: "Sector 62, Near Metro", rent: 1100 },
    { title: "Metro Stay PG", category: "pg", city: "Mumbai", landMark: "Marol Metro Station", rent: 1400 },
    { title: "Student Comfort PG", category: "pg", city: "Prayagraj", landMark: "Allahabad University", rent: 750 },
    
    // Cabins
    { title: "Pine Wood Cabin", category: "cabin", city: "Manali", landMark: "Hill View Road", rent: 4500 },
    { title: "Nature Retreat Cabin", category: "cabin", city: "Delhi", landMark: "Chattarpur Farm Road", rent: 5200 },
    { title: "Royal Garden Cabin", category: "cabin", city: "Lucknow", landMark: "Sultanpur Road", rent: 4100 },
    { title: "Green Garden Cabin", category: "cabin", city: "Noida", landMark: "Sector 135", rent: 3900 },
    { title: "Old Manali Log Cabin", category: "cabin", city: "Manali", landMark: "Log Huts Area", rent: 4800 },
    
    // Shops
    { title: "Godowlia Market Shop", category: "shops", city: "Varanasi", landMark: "Shop No. 18, Godowlia Market", rent: 5500 }
];

function generateImages(category, title, city) {
    const tagsMap = {
        villa: "villa,luxury,exterior",
        farmHouse: "farmhouse,nature,exterior",
        poolHouse: "pool,villa,luxury",
        rooms: "hotel,room,interior",
        flat: "apartment,interior,modern",
        pg: "hostel,room,sharing",
        cabin: "cabin,wooden,forest",
        shops: "shop,retail,storefront"
    };
    const tag = tagsMap[category] || "property,interior";
    const seed = encodeURIComponent(`${title}-${city}`.toLowerCase());
    return [
        `https://loremflickr.com/1200/800/${tag}?lock=${seed}-1`,
        `https://loremflickr.com/1200/800/${tag}?lock=${seed}-2`,
        `https://loremflickr.com/1200/800/${tag}?lock=${seed}-3`
    ];
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
        console.error("❌ MONGODB_URL is missing in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB");

        const host = await getOrCreateDemoHost();
        const listingsToInsert = [];

        for (const item of rawData) {
            const [img1, img2, img3] = generateImages(item.category, item.title, item.city);
            
            listingsToInsert.push({
                title: item.title,
                description: `${item.title} is a premium ${item.category} located in the heart of ${item.city} near ${item.landMark}. It offers a peaceful environment and modern amenities for a comfortable stay.`,
                category: item.category,
                city: item.city,
                landMark: item.landMark,
                country: "India",
                rent: item.rent,
                averageRating: Number((4 + Math.random()).toFixed(1)),
                numberOfRatings: Math.floor(Math.random() * 20) + 1,
                image1: img1,
                image2: img2,
                image3: img3,
                host: host._id,
                isBooked: false
            });
        }

        const inserted = await Listing.insertMany(listingsToInsert);
        const insertedIds = inserted.map(doc => doc._id);

        await User.findByIdAndUpdate(host._id, {
            $addToSet: { listing: { $each: insertedIds } }
        });

        console.log(`✅ Successfully imported ${inserted.length} listings!`);
        
        // Print Summary
        const summary = await Listing.aggregate([
            { $match: { host: host._id } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        console.log("📊 Listing Summary per Category:", summary);

        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Import failed:", error);
        process.exit(1);
    }
}

run().catch(err => {
    console.error("💥 Global Script Error:", err);
    process.exit(1);
});