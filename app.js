// ======================= ENV =======================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  console.log("env loaded");
}

// ======================= IMPORTS =======================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

// ======================= MODELS & UTILS =======================
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

// ======================= ROUTES =======================
const listingRouter = require("./routes/listings");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// ======================= CLOUDINARY =======================
const multer = require("multer");
const { cloudinary, storage } = require("./cloudconfig");
const upload = multer({ storage });

// ======================= APP INIT =======================
const app = express();

// ======================= DATABASE =======================
const dbUrl =
  process.env.ATLASDB_URL || "mongodb://localhost:27017/hotelBooking";

mongoose
  .connect(dbUrl)
  .then(() => console.log("database connected"))
  .catch((err) => console.error("database error:", err.message));

// ======================= VIEW ENGINE =======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======================= MIDDLEWARE =======================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================= SESSION =======================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("session store error:", err);
});

app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

// ======================= PASSPORT =======================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================= GLOBAL LOCALS =======================
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ======================= ROUTES =======================
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ======================= ERROR HANDLING =======================
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error.ejs", { err });
});

// ======================= SERVER =======================
const PORT = process.env.PORT || 8080;
const URL =
  process.env.NODE_ENV === "production"
    ? "https://your-domain.com"
    : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log("────────────────────────────────────");
  console.log("🚀 Server running at:");
  console.log(`👉 ${URL}`);
  console.log("────────────────────────────────────");
});
