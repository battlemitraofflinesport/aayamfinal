/* ===============================
   LOGIN CHECK
================================ */
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

/* ===============================
   ADMIN ACCESS (ADMIN + SUPERADMIN)
================================ */
const isAdmin = (req, res, next) => {
  const user = req.session.user;

  if (!user) return res.redirect("/login");
  if (!user.isActive) return res.redirect("/login");

  // 🔥 KEY LINE
  if (user.role !== "admin" && user.role !== "superadmin") {
    return res.redirect("/");
  }

  next();
};


/* ===============================
   SUPER ADMIN ONLY
================================ */
const isSuperAdmin = (req, res, next) => {
  const user = req.session.user;

  if (!user) return res.redirect("/login");
  if (!user.isActive) return res.redirect("/login");

  if (user.role !== "superadmin") {
    return res.redirect("/admin");
  }

  next();
};

module.exports = {
  isLoggedIn,
  isAdmin,
  isSuperAdmin,
};
