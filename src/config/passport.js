import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as DiscordStrategy } from "passport-discord";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../services/emailService.js";

/**
 * Base URL
 */
const BASE_URL = process.env.BACKEND_URL;

/**
 * Shared OAuth handler
 */
const handleAuth = async (_accessToken, _refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || profile.email || null;

    if (!email) {
      return done(new Error("No email found from provider"), null);
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: profile.displayName || profile.username || "User",
        email,
        avatar: profile.photos?.[0]?.value || "",
        provider: profile.provider,
        providerId: profile.id,
      });

      // Fire-and-forget welcome email
      sendWelcomeEmail(user.email, user.username).catch(() => {});
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

/**
 * ================================
 * GOOGLE STRATEGY (REQUIRED)
 * ================================
 */
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env"
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/google/callback`,
    },
    handleAuth
  )
);

/**
 * ================================
 * GITHUB STRATEGY (OPTIONAL)
 * ================================
 */
if (
  process.env.GITHUB_CLIENT_ID &&
  process.env.GITHUB_CLIENT_SECRET &&
  process.env.GITHUB_CLIENT_ID !== "dummy"
) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/auth/github/callback`,
        scope: ["user:email"],
      },
      handleAuth
    )
  );
}

/**
 * ================================
 * DISCORD STRATEGY (OPTIONAL)
 * ================================
 */
if (
  process.env.DISCORD_CLIENT_ID &&
  process.env.DISCORD_CLIENT_SECRET &&
  process.env.DISCORD_CLIENT_ID !== "dummy"
) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/auth/discord/callback`,
        scope: ["identify", "email"],
      },
      handleAuth
    )
  );
}
