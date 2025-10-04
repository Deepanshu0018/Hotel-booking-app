// controllers/users.js
const User = require("../models/user");

// Render Register Form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Handle Register
module.exports.signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email });

  try {
    const registeredUser = await User.register(user, password);

    // auto-login after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome to Airbnb by DeepanshuGupta!");
      const redirectUrl = req.session.returnTo || "/listings";
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// Handle Login
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/listings");
  });
};
