const express = require("express");
const bodyParser = require("body-parser");

// load our own helper functions
const encode = require("./demo/encode");
const decode = require("./demo/decode");

function getNextId() {
  return "" + (existingURLs.length + 1);
}

let existingURLs = [];

const app = express();
app.use(bodyParser.json());

// TODO: Implement functionalities specified in README
app.get("/", function(req, res) {
  res.send("Hello world!");
});

app.post("/shorten-url", (req, res) => {
  let receivedURL = req.body.url;
  let urlHash = encode(receivedURL, existingURLs);
  let existingEntry = existingURLs.filter(data => data.hash === urlHash);
  if (existingEntry.length === 0) {
    existingURLs.push({ id: getNextId(), url: receivedURL, hash: urlHash });
  }
  let returnObj = { hash: urlHash };
  res.send(returnObj);
});

app.post("/expand-url", (req, res) => {
  let receivedHash = req.body.hash;
  try {
    let storedURL = decode(receivedHash, existingURLs);
    let result = { url: storedURL };
    res.send(result);
  } catch (error) {
    let errorMsg = {
      message: `There is no long URL registered for hash value 'MTAwMDA='`
    };
    res.status(404).send(errorMsg);
  }
});

app.delete("/expand-url/:hash", (req, res) => {
  let hashToDelete = req.params.hash;
  try {
    let storedURL = decode(hashToDelete, existingURLs);
    existingURLs = existingURLs.filter(
      element => element.hash !== hashToDelete
    );
    let message = {
      message: `URL with hash value '${hashToDelete}' deleted successfully`
    };
    res.send(message);
  } catch (error) {
    let errorMsg = {
      message: `URL with hash value '${hashToDelete}' does not exist`
    };
    res.status(404).send(errorMsg);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

// TODO:
// POST /shorten-url
// GET /expand-url
// DELETE /urls/:hash
