// ======================= IMPORTS =======================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  console.log("✅ Loaded .env variables");
}

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
const kleur = require("kleur");

// ======================= MODELS & UTILS =======================
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

// Routers
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ======================= CLOUDINARY =======================
const multer = require("multer");
const { cloudinary, storage } = require("./cloudconfig"); // <-- Cloudinary setup
const upload = multer({ storage });

// ======================= APP INIT =======================
const app = express();

// ======================= DATABASE CONNECTION =======================
const dbUrl =
  process.env.ATLASDB_URL || "mongodb://localhost:27017/hotelBooking";
async function connectDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log(
      kleur.green().bold("🗄️  Database Connected") +
        kleur.white(" | ") +
        kleur.magenta("MongoDB Online") +
        kleur.white(" | ") +
        kleur.blue(new Date().toLocaleTimeString())
    );
    console.log(
      kleur.cyan().bold("════════════════════════════════════════════════════")
    );
  } catch (err) {
    console.error(kleur.red().bold(`❌💥 DB Connection Error: ${err.message}`));
  }
}
connectDB();

// ======================= VIEW ENGINE =======================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======================= MIDDLEWARE =======================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================= SESSION & FLASH =======================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("❌ Error in MONGO SESSION store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ======================= PASSPORT CONFIG =======================
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
// Pass `upload` to routes that need image uploads
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// ======================= ERROR HANDLING =======================
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// ======================= SERVER =======================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    kleur.cyan().bold("════════════════════════════════════════════════════")
  );
  console.log(
    kleur.green().bold("⚡ Server Online") +
      kleur.white(" | ") +
      kleur.magenta("Listening on Port ") +
      kleur.yellow().bold(PORT) +
      kleur.white(" | ") +
      kleur.blue(new Date().toLocaleTimeString())
  );
});
