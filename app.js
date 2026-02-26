/* ===============================
   ENV & CORE IMPORTS
================================ */
require("dotenv").config();
const express = require("express");
const path = require("path");
const passport = require("passport");
require("./config/passport");


/* ===============================
   DATABASE (Supabase is initialized where needed via client)
================================ */

/* ===============================
   VIEW & SESSION PACKAGES
================================ */
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

/* ===============================
   APP INIT
================================ */
const app = express();

/* ===============================
   DATABASE CONNECTION
================================ */
// Supabase client connects automatically on query

/* ===============================
   MIDDLEWARES
================================ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ✅ STATIC FILES */
app.use(express.static(path.join(__dirname, "public")));

/* ✅ VERY IMPORTANT — UPLOADS MUST BE EXPOSED LIKE THIS */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   SESSION CONFIG
================================ */
app.use(
   session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
         maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
   })
);

/* ===============================
   GLOBAL USER (NAVBAR ACCESS)
================================ */
app.use((req, res, next) => {
   res.locals.user = req.session.user;
   next();
});

/* ===============================
   EJS + LAYOUT SETUP
================================ */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

/* ===============================
   PASSPORT INIT (MUST BE BEFORE ROUTES)
================================ */
app.use(passport.initialize());
app.use(passport.session());

/* ===============================
   ROUTES
================================ */
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const teamRoutes = require("./routes/teamRoutes");
const homeController = require("./controllers/homeController");
const eventRoutes = require("./routes/eventRoutes");
const reachOutRoutes = require("./routes/reachOutRoutes");
const adminRoutes = require("./routes/adminRoutes");


app.use(authRoutes);
app.use(homeRoutes);
app.use(teamRoutes);
app.use(eventRoutes);
app.use(reachOutRoutes);
app.use(adminRoutes);


/* HOME */
app.get("/", homeController.getHome);

/* ===============================
   SERVER / VERCEL EXPORT
================================ */
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
   app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
   });
}

// Export for Vercel serverless functions
module.exports = app;

