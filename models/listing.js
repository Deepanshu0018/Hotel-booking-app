const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

// Listing schema
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  // ✅ Image (Cloudinary upload OR fallback default)
  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    filename: {
      type: String,
    },
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  country: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  // ✅ Owner (User who created listing)
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Optional convenience field for storing owner’s name
  ownerName: String,

  // ✅ Reviews (references to Review model)
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// ✅ Middleware: cascade delete reviews when listing is deleted
listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
