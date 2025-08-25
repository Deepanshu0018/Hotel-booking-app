const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("✅ Connected to DB");
  })
  .catch((err) => {
    console.log("❌ DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // 👇 Add your fixed owner ID to each listing
  const listingsWithOwner = initData.data.map((listing) => ({
    ...listing,
    owner: "68a6cefa435850412097c4e7" // ✅ Your user ObjectId
  }));

  await Listing.insertMany(listingsWithOwner);
  console.log("🌱 Database seeded successfully with owner field");
};

initDB();
