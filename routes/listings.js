// ================= IMPORTS =================
const express = require("express");
const router = express.Router();
const multer = require("multer");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware");
const listingController = require("../controllers/listings");

// ================= MULTER + CLOUDINARY =================
const { storage } = require("../cloudconfig.js"); // Cloudinary storage
const upload = multer({ storage });

// ================= VALIDATION MIDDLEWARE =================
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// ================= ROUTES =================

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index)) // INDEX: show all listings
  .post(
    isLoggedIn,
    upload.single("image"),   // ✅ Use flat field name "image"
    validateListing,
    wrapAsync(listingController.createListing) // CREATE
  );

// NEW (form route)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ====== SEARCH ROUTE ======
// MUST be BEFORE /:id route to avoid conflict
router.get("/search", wrapAsync(listingController.searchListings));

// SHOW + UPDATE + DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // SHOW: single listing
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),   // ✅ Use flat field name "image"
    validateListing,
    wrapAsync(listingController.updateListing) // UPDATE
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); // DELETE

// EDIT (form route)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
