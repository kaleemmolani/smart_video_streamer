const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const app = express();
const fs = require("fs");
app.use(expressEjsLayouts);
const session = require("express-session");
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(express.static('bootstrap'));
app.set('view engine', 'ejs');
app.use(
    session({
      secret: Math.random().toString(36).substring(2),
      resave: false,
      saveUninitialized: true,
    }),
    express.json()
  );
app.get("/", function (req, res) {
  res.render('index');
});

app.get("/video", function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }
  
    // get video stats (about 61MB)
    const videoPath = "videoDB/example.mp4";
    const videoSize = fs.statSync("videoDB/example.mp4").size;
  
    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 5; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
  
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });
  
    // Stream the video chunk to the client
    videoStream.pipe(res);
  });
app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

