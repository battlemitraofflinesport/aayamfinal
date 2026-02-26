const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

/* ===============================
   AUTH PAGE
=================================*/
exports.authPage = (req, res) => {
  res.render("auth/index", { error: null });
};


/* ===============================
   EMAIL LOGIN + REGISTER
=================================*/
exports.emailAuth = async (req, res) => {
  try {
    const { name, email, password, mode } = req.body;

    /* ================= REGISTER ================= */
    if (mode === "register") {
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        return res.render("auth/index", { error: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 10);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          name,
          email,
          password: hashed,
          role: "user", // 🔥 only public users can register
          isActive: true
        }])
        .select()
        .single();

      if (error || !newUser) {
        throw error || new Error("Failed to create user");
      }

      req.session.user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: "user",
        isActive: true,
      };

      return res.redirect("/");
    }

    /* ================= LOGIN ================= */
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      return res.render("auth/index", { error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.render("auth/index", { error: "Account disabled" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("auth/index", { error: "Invalid credentials" });
    }

    // 🔥 KEEP ORIGINAL ROLE (admin, superadmin, user)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    req.session.save(() => res.redirect("/"));
  } catch (error) {
    console.error(error);
    res.redirect("/auth");
  }
};


/* ===============================
   LOGOUT
=================================*/
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/auth"));
};
