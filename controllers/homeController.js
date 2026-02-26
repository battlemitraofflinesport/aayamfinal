const supabase = require("../config/supabase");

exports.getHome = async (req, res) => {
  const { data: whatWeDoImages } = await supabase
    .from('home_gallery')
    .select('*')
    .eq('section', 'what_we_do')
    .limit(4);

  const { data: eventImages } = await supabase
    .from('home_gallery')
    .select('*')
    .eq('section', 'events')
    .limit(4);

  res.render("home", {
    whatWeDoImages: whatWeDoImages || [],
    eventImages: eventImages || [],
  });
};

exports.addImage = async (req, res) => {
  const { section } = req.body;

  if (!req.file || !section) return res.redirect("/");

  const { count } = await supabase
    .from('home_gallery')
    .select('*', { count: 'exact', head: true })
    .eq('section', section);

  if (count >= 4) return res.redirect("/");

  await supabase
    .from('home_gallery')
    .insert([{
      image: `/uploads/home/${req.file.filename}`,
      section,
    }]);

  res.redirect("/");
};

exports.deleteImage = async (req, res) => {
  await supabase
    .from('home_gallery')
    .delete()
    .eq('id', req.params.id);

  res.redirect("/");
};
