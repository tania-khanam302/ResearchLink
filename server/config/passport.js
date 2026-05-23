
/*
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// ⚠️ তোমার .env file এ এগুলো থাকতে হবে
// GOOGLE_CLIENT_ID=xxxxx
// GOOGLE_CLIENT_SECRET=xxxxx

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // এখানে তুমি database user check/create করবে

        const user = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
          role: "Student", // default role (change later if needed)
        };

        // এখন user return করবে
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

*/