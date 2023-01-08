const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");

const PORT = 3000;

const app = express();

app.use(helmet());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must log in!",
    });
  }
  next();
}

app.get("/auth/google", (req, res) => {});

app.get("/auth/google/callback", (req, res) => {});

app.get("/auth/logout", (req, res) => {});

app.get("/secure", checkLoggedIn, (req, res) => {
  return res.send("Secure route");
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "/index.html"));
});

var http = require("http");
https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
