const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// ==============================
// INDEX (CATEGORY + PRICE FILTER)
// ==============================
module.exports.index = async (req, res) => {
  const { category, minPrice, maxPrice } = req.query;

  let filter = {};

  // CATEGORY FILTER
  if (category) {
    filter.category = category;
  }

  // PRICE RANGE FILTER
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const listings = await Listing.find(filter);

  res.render("listings/index.ejs", {
    listings,
    category,
    minPrice,
    maxPrice,
  });
};

// ==============================
// NEW FORM
// ==============================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ==============================
// CREATE
// ==============================
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  newListing.owner = req.user._id;
  await newListing.save();

  req.flash("success", "🎉 New listing created!");
  res.redirect("/listings");
};

// ==============================
// SHOW
// ==============================
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author", select: "username" },
    })
    .populate("owner", "username");

  if (!listing) {
    req.flash("error", "❌ Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ==============================
// EDIT FORM
// ==============================
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) throw new ExpressError(404, "Listing not found");

  res.render("listings/edit.ejs", { listing });
};

// ==============================
// UPDATE
// ==============================
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "✅ Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

// ==============================
// DELETE
// ==============================
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "🗑️ Listing deleted successfully!");
  res.redirect("/listings");
};
