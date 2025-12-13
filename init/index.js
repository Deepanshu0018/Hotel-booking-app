require("dotenv").config({ path: "../.env" }); // points to root .env from init folder

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// ✅ Use Atlas URL from .env
const MONGO_URL = process.env.ATLASDB_URL;
console.log("Mongo URL:", MONGO_URL); // should print the full Atlas URL

// Connect to MongoDB Atlas
async function main() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");

    // Seed database after connection
    await initDB();

    // Close connection
    mongoose.connection.close();
    console.log("🔒 Connection closed");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
}

// Seed the database
const initDB = async () => {
  try {
    // Remove existing listings
    await Listing.deleteMany({});
    console.log("🗑️ Old listings cleared");

    // Add fixed owner ID to each listing
    const listingsWithOwner = initData.data.map((listing) => ({
      ...listing,
      owner: "693d2788cc639b879bcfddac", // ✅ Replace with your actual user ObjectId
    }));

    // Insert seed data
    await Listing.insertMany(listingsWithOwner);
    console.log("🌱 Database seeded successfully with owner field");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  }
};

// Run main
main();
