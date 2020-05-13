const express = require('express');
const app = express();
const path = require('path');
const port = 30001;

//Start the listener
app.listen(port);

app.use(express.static(path.join(__dirname, 'test/public')));
app.use(express.static(path.join(__dirname, 'dist')));
console.log("Running on localhost:" + port + " using directory test/public and dist");