const express = require("express");
const app = express();
const path = require("path");
const port = 30001;

//loads in the src first
app.use(express.static(path.join(__dirname, "../src")));
//then loads in the index file
app.use(express.static(path.join(__dirname, "e2e")));
app.use("/data", express.static(path.join(__dirname, "e2e/data")));
//lastly loads the dist, but the original src files have priority
app.use(express.static(path.join(__dirname, "../dist")));
console.log("Running on localhost:" + port);

app.listen(port);
