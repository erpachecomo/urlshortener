require("dotenv").config();
const express = require("express");
const dns = require("dns");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const URL = require("url").URL;
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
const urls = [];
const reversedUrls = {};
// Your first API endpoint
app.get("/api/shorturl/:url", function (req, res) {
  
  const index = +req.params.url;
  if (isNaN(index) || index >= urls.length) return res.json({ error: "invalid url" });
  const url = new URL(urls[index]);
  res.redirect(url.href)

});
app.post("/api/shorturl", function (req, res) {
  try {
    const url = new URL(req.body.url);
    dns.lookup(url.host, (err, address) => {
      if (err) return res.json({ error: "invalid url", err });
      let index = urls.length;
      if (reversedUrls[address]) {
        index = reversedUrls[address];
      } else {
        reversedUrls[address] = index;
        urls.push(req.body.url);
      }

      res.json({
        original_url: req.body.url,
        short_url: `${req.protocol}://${req.get("host")}${
          req.originalUrl
        }/${index}`,
      });
    });
    //   urls.push(req.body.url);
    //   res.json({
    //     original_url: req.body.url,
    //     short_url: `${req.protocol}://${req.get("host")}/${req.originalUrl}${
    //       urls.length - 1
    //     }`,
    //   });
  } catch (err) {
    return res.json({ error: "invalid url" });
  }
});
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
