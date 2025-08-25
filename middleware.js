const Listing = require("./models/listing.js");

// ✅ Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    // store the original URL user wanted
    req.session.returnTo = req.originalUrl;

    console.log("DEBUG: storing returnTo =", req.session.returnTo); // debug log

    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  next();
};

// ✅ Middleware to check if the logged-in user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "⛔ You don’t have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
