const supabase = require("../config/supabase");

/* ===============================
   VIEW TEAM PAGE
================================ */
const getTeamPage = async (req, res) => {
  try {
    const { data: sections } = await supabase
      .from('team_sections')
      .select('*');

    const sectionsData = sections || [];

    for (let section of sectionsData) {
      const { data: members } = await supabase
        .from('team_members')
        .select('*')
        .eq('section', section.id);

      section.members = members || [];
    }

    res.render("team", { sections: sectionsData });
  } catch (err) {
    console.error("Get Team Page Error:", err);
    res.redirect("/");
  }
};

/* ===============================
   ADD TEAM SECTION (ADMIN)
================================ */
const addTeamSection = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.redirect("/team");
    }

    await supabase
      .from('team_sections')
      .insert([{ title: title.trim() }]);

    res.redirect("/team");
  } catch (err) {
    console.error("Add Team Section Error:", err);
    res.redirect("/team");
  }
};

/* ===============================
   EDIT TEAM SECTION (VIEW)
================================ */
const getEditSection = async (req, res) => {
  try {
    const { data: section } = await supabase
      .from('team_sections')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!section) return res.redirect("/team");

    res.render("editSection", { section });
  } catch (err) {
    console.error("Edit Section View Error:", err);
    res.redirect("/team");
  }
};

/* ===============================
   UPDATE TEAM SECTION
================================ */
const updateSection = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.redirect("/team");
    }

    await supabase
      .from('team_sections')
      .update({ title: title.trim() })
      .eq('id', req.params.id);

    res.redirect("/team");
  } catch (err) {
    console.error("Update Section Error:", err);
    res.redirect("/team");
  }
};

/* ===============================
   ADD TEAM MEMBER (ADMIN)
================================ */
const addTeamMember = async (req, res) => {
  try {
    const { name, sectionId, position } = req.body;

    if (!name || !sectionId || !req.file || !position) {
      console.error("Missing required fields for addTeamMember");
      return res.redirect("/team");
    }

    const imagePath = `/uploads/team/${req.file.filename}`;

    const { data, error: insertError } = await supabase
      .from('team_members')
      .insert([{
        name: name.trim(),
        position: position.trim(),
        image: imagePath,
        section: sectionId,
      }]);

    if (insertError) {
      console.error("Supabase Insert Error: ", insertError);
    }

    res.redirect("/team");
  } catch (error) {
    console.error("Add Team Member Error:", error);
    res.redirect("/team");
  }
};

/* ===============================
   GET EDIT MEMBER PAGE
================================ */
const getEditMember = async (req, res) => {
  try {
    const { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!member) return res.redirect("/team");

    res.render("editMember", { member });
  } catch (error) {
    console.error("Get Edit Member Error:", error);
    res.redirect("/team");
  }
};

/* ===============================
   UPDATE TEAM MEMBER
================================ */
const updateMember = async (req, res) => {
  try {
    const { name, position } = req.body;
    const { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!member) return res.redirect("/team");

    const updateData = { name: name.trim() };
    if (position) {
      updateData.position = position.trim();
    }

    if (req.file) {
      updateData.image = `/uploads/team/${req.file.filename}`;
    }

    await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', member.id);

    res.redirect("/team");
  } catch (err) {
    console.error("Update Member Error:", err);
    res.redirect("/team");
  }
};


/* ===============================
   DELETE TEAM MEMBER (ADMIN)
================================ */
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    res.redirect("/team");
  } catch (error) {
    console.error("Delete Team Member Error:", error);
    res.redirect("/team");
  }
};

/* ===============================
   DELETE TEAM SECTION (ADMIN)
================================ */
const deleteTeamSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete all members under this section
    await supabase
      .from('team_members')
      .delete()
      .eq('section', id);

    // Delete section
    await supabase
      .from('team_sections')
      .delete()
      .eq('id', id);

    res.redirect("/team");
  } catch (error) {
    console.error("Delete Team Section Error:", error);
    res.redirect("/team");
  }
};

module.exports = {
  getTeamPage,
  addTeamSection,
  addTeamMember,
  getEditSection,
  updateSection,
  getEditMember,
  updateMember,
  deleteTeamMember,
  deleteTeamSection,
};
