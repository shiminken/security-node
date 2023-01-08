const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

require("dotenv").config();

const PORT = 3000;

const config = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.clientID,
  clientSecret: config.clientSecret,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
// Save the session to the cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Read the session from the cookie
passport.deserializeUser((id, done) => {
  // User.findById(id, (err, user) => {
  //   done(null, user);
  // });

  done(null, id);
});

const app = express();

app.use(helmet());

app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

app.use(passport.initialize());
app.use(passport.session()); // -> deserializeUser is called

function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;

  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must log in!",
    });
  }
  next();
}

app.get("/auth/google", passport.authenticate("google", { scope: ["email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/failure",
    session: true,
  }),
  (req, res) => {
    console.log("Google called us back!");
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout();

  return res.redirect("/");
});

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("Secure route");
});

app.get("/failure", (req, res) => {
  return res.send("Failed to login!");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "/index.html"));
});

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
