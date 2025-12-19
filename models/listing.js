const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    filename: String,
  },

  price: { type: Number, required: true, min: 0 },
  country: { type: String, required: true },
  location: { type: String, required: true },

  // ✅ SAFE ADDITION (does NOT break old data)
  category: {
    type: String,
    enum: [
      "trending",
      "beds",
      "mountains",
      "castle",
      "swimming",
      "tractor",
      "camping",
      "hiking",
      "beach",
    ],
    default: "trending",
  },

  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

// ✅ KEEPING YOUR DELETE HOOK EXACTLY AS IS
listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
