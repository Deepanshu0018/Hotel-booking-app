const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/wrapAsync");

// Import controller
const usersController = require("../controllers/users");

// ======================= HELPERS =======================

// Middleware: if user already logged in, redirect away from signup/login
function redirectIfLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash("success", "You are already logged in!");
    return res.redirect("/listings");
  }
  next();
}

// ======================= ROUTES =======================

// SIGNUP (form + post)
router
  .route("/signup")
  .get(redirectIfLoggedIn, usersController.renderSignupForm)
  .post(catchAsync(usersController.signup));

// LOGIN (form + post)
router
  .route("/login")
  .get(redirectIfLoggedIn, usersController.renderLoginForm)
  .post(
    (req, res, next) => {
      res.locals.returnTo = req.session.returnTo; // save before passport wipes
      next();
    },
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    usersController.login
  );

// LOGOUT
router.get("/logout", usersController.logout);

// ======================= EXPORT =======================
module.exports = router;
