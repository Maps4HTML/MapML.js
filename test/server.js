const express = require('express');
const app = express();
const path = require('path');
const port = 30001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../dist')));
console.log("Running on localhost:" + port + " using directory test/public and dist");

app.listen(port);