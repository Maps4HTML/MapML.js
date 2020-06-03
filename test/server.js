const express = require("express");
const app = express();
const path = require("path");
const port = 30001;

//loads in the src first
app.use(express.static(path.join(__dirname, "../src")));
//then loads in the index file
app.use(express.static(path.join(__dirname, "e2e")));
app.use("/data", express.static(path.join(__dirname, "e2e/data/tiles/cbmt")));
app.use("/data", express.static(path.join(__dirname, "e2e/data/tiles/wgs84")));
app.use(
  "/data/cbmt/2",
  express.static(path.join(__dirname, "e2e/data/tiles/cbmt/2"))
);
app.use(
  "/data/wgs84/0",
  express.static(path.join(__dirname, "e2e/data/tiles/wgs84/0"))
);

//lastly loads the dist, but the original src files have priority
app.use(express.static(path.join(__dirname, "../dist")));
console.log("Running on localhost:" + port);

app.listen(port);
