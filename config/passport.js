const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const supabase = require("./supabase");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (!user) {
          const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
              name: profile.displayName,
              email,
              password: "google-auth", // dummy
              role: "user",
              isActive: true,
            }])
            .select()
            .single();

          if (error) throw error;
          user = newUser;
        }

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  done(error, user);
});
