// controllers/reviews.js
const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

// CREATE Review
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id; // link review to user
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "✨ Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE Review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // Ensure only author can delete
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "⛔ You don’t have permission to delete this review");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "🗑 Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};
