const supabase = require("../config/supabase");

/* ===============================
   SHOW FORM (PUBLIC)
================================ */
exports.getReachOutForm = (req, res) => {
  res.render("reachout/index", {
    success: req.query.success || false,
  });
};

/* ===============================
   SUBMIT FORM (PUBLIC)
================================ */
exports.submitReachOutForm = async (req, res) => {
  try {
    const { name, email, contact, purpose, message } = req.body;

    if (!name || !email || !purpose || !message) {
      return res.redirect("/reachout");
    }

    await supabase
      .from('reach_outs')
      .insert([{
        name,
        email,
        contact,
        purpose,
        message,
        isRead: false
      }]);

    res.redirect("/reachout?success=true");
  } catch (error) {
    console.error("ReachOut Submit Error:", error);
    res.redirect("/reachout");
  }
};


/* ===============================
   ADMIN: VIEW ALL
================================ */
exports.getAllReachOuts = async (req, res) => {
  try {
    const { data: reachouts } = await supabase
      .from('reach_outs')
      .select('*')
      .order('createdAt', { ascending: false });

    res.render("admin/reachout/index", { reachouts: reachouts || [] });
  } catch (error) {
    console.error("Admin ReachOut Error:", error);
    res.redirect("/");
  }
};

/* ===============================
   TOGGLE READ / UNREAD
================================ */
exports.toggleReadStatus = async (req, res) => {
  try {
    const { data: item } = await supabase
      .from('reach_outs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!item) return res.redirect("/admin/reachout");

    await supabase
      .from('reach_outs')
      .update({ isRead: !item.isRead })
      .eq('id', item.id);

    res.redirect("/admin/reachout");
  } catch (error) {
    console.error("Toggle Read Error:", error);
    res.redirect("/admin/reachout");
  }
};

/* ===============================
   DELETE (SPAM)
================================ */
exports.deleteReachOut = async (req, res) => {
  try {
    await supabase
      .from('reach_outs')
      .delete()
      .eq('id', req.params.id);

    res.redirect("/admin/reachout");
  } catch (error) {
    console.error("Delete ReachOut Error:", error);
    res.redirect("/admin/reachout");
  }
};
