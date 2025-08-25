// controllers/listings.js
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// ====== INDEX - All listings ======
module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index.ejs", { listings });
};

// ====== SEARCH - Filter listings ======
module.exports.searchListings = async (req, res) => {
  const { q } = req.query; // query string from search box

  if (!q || q.trim() === "") {
    req.flash("error", "❌ Please enter a valid request");
    return res.redirect("/listings");
  }

  // Search case-insensitively in title, description, and location
  const listings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } }
    ]
  });

  if (listings.length === 0) {
    req.flash("info", `No listings found for "${q}"`);
    return res.redirect("/listings");
  }

  res.render("listings/index.ejs", { listings });
};

// ====== NEW - Form ======
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ====== CREATE - Add new listing ======
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

// ====== SHOW - Single listing ======
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

// ====== EDIT - Form ======
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/edit.ejs", { listing });
};

// ====== UPDATE - Save changes ======
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

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

// ====== DELETE - Remove ======
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "🗑️ Listing deleted successfully!");
  res.redirect("/listings");
};
