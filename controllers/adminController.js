const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

/* =================================
   ADMIN DASHBOARD
================================= */
exports.getAdminDashboard = async (req, res) => {
  try {
    const { data: admins } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'superadmin']);

    res.render("admin/index", { admins: admins || [] });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.redirect("/");
  }
};

/* =================================
   INVITE ADMIN (MAX 10 ADMINS)
================================= */
exports.inviteAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.redirect("/admin");

    // Limit only ACTIVE admins
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('isActive', true);

    if (count >= 10) return res.redirect("/admin");

    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    // 🟢 USER ALREADY EXISTS → UPGRADE ROLE
    if (existing) {
      await supabase
        .from('users')
        .update({ role: "admin", isActive: true })
        .eq('id', existing.id);
      return res.redirect("/admin");
    }

    // 🟢 NEW ADMIN CREATION
    const hashed = await bcrypt.hash(password, 10);

    await supabase
      .from('users')
      .insert([{
        email,
        password: hashed,
        role: "admin",
        isActive: true,
      }]);

    res.redirect("/admin");
  } catch (error) {
    console.error("Invite Admin Error:", error);
    res.redirect("/admin");
  }
};


/* =================================
   ACTIVATE / DEACTIVATE ADMIN
================================= */
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { data: admin } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!admin) return res.redirect("/admin");

    // ❌ Superadmin cannot be deactivated
    if (admin.role === "superadmin") return res.redirect("/admin");

    await supabase
      .from('users')
      .update({ isActive: !admin.isActive })
      .eq('id', admin.id);

    res.redirect("/admin");
  } catch (error) {
    console.error("Toggle Admin Error:", error);
    res.redirect("/admin");
  }
};

/* =================================
   DELETE ADMIN (SUPERADMIN)
================================= */
exports.deleteAdmin = async (req, res) => {
  try {
    const { data: admin } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    // Safety — cannot delete superadmin
    if (!admin || admin.role === "superadmin") {
      return res.redirect("/admin");
    }

    await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    res.redirect("/admin");
  } catch (error) {
    console.error("Delete Admin Error:", error);
    res.redirect("/admin");
  }
};

/* =================================
   CHANGE SUPER ADMIN
================================= */
exports.makeSuperAdmin = async (req, res) => {
  try {
    const { data: newSuperAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!newSuperAdmin) return res.redirect("/admin");

    // Already superadmin
    if (newSuperAdmin.role === "superadmin") return res.redirect("/admin");

    // Demote current superadmin
    await supabase
      .from('users')
      .update({ role: "admin" })
      .eq('role', "superadmin");

    // Promote new one
    await supabase
      .from('users')
      .update({ role: "superadmin", isActive: true })
      .eq('id', newSuperAdmin.id);

    res.redirect("/admin");
  } catch (error) {
    console.error("Make Super Admin Error:", error);
    res.redirect("/admin");
  }
};
