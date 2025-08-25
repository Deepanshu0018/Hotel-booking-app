const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewsSchema } = require("../schema");
const { isLoggedIn } = require("../middleware");

// Import controllers
const reviewsController = require("../controllers/reviews");

// Validation middleware for reviews
const validateReview = (req, res, next) => {
  const { error } = reviewsSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// ====== REVIEWS ======

// CREATE Review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.createReview)
);

// DELETE Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(reviewsController.deleteReview)
);

module.exports = router;
