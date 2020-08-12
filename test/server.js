const express = require("express");
const app = express();
const path = require("path");
const port = 30001;

//then loads in the index file
app.use(express.static(path.join(__dirname, "../dist")));
app.use(express.static(path.join(__dirname, "e2e/core")));
app.use(express.static(path.join(__dirname, "e2e/layers")));
app.use("/data", express.static(path.join(__dirname, "e2e/data/tiles/cbmt")));
app.use("/data", express.static(path.join(__dirname, "e2e/data/tiles/wgs84")));
app.use(
  "/data/cbmt/0",
  express.static(path.join(__dirname, "e2e/data/tiles/cbmt/0"))
);
app.use(
  "/data/cbmt/2",
  express.static(path.join(__dirname, "e2e/data/tiles/cbmt/2"))
);
app.use(
  "/data/cbmt/3",
  express.static(path.join(__dirname, "e2e/data/tiles/cbmt/3"))
);
app.use(
  "/data/wgs84/0",
  express.static(path.join(__dirname, "e2e/data/tiles/wgs84/0"))
);
app.use(
  "/data/wgs84/1",
  express.static(path.join(__dirname, "e2e/data/tiles/wgs84/1"))
);

console.log("Running on localhost:" + port);

app.listen(port);
