var express = require("express");

const fetchUrl = require("fetch").fetchUrl;

// load our own helper functions
const encode = require("./demo/encode");
const decode = require("./demo/decode");
var router = express.Router();


let existingURLs = [];

function getNextId() {
  return "" + (existingURLs.length + 1);
}

// TODO: Implement functionalities specified in README
router.get("/", function(req, res) {
  res.send("Hello world!");
});

router.get("/:hash", (req, res) => {
  let requestedHash = req.params.hash;
  try {
    let storedURL = decode(requestedHash, existingURLs);
    res.redirect(storedURL);
  } catch (error) {
    let errorMsg = {
      message: `There is no long URL registered for hash value '${requestedHash}'`
    };
    res.status(404).send(errorMsg);
  }
});

router.post("/shorten-url", (req, res, next) => {
  let receivedURL = req.body.url;

  const fetchOptions = { method: "GET" };

  fetchUrl(receivedURL, fetchOptions, function(error, meta, body) {
    if (error) {
      let errorMsg = {
        message: `'${receivedURL}' is not a valid URL`
      };
      res.status(400).send(errorMsg);
      return;
    }

    let urlHash = encode(receivedURL, existingURLs);
    let existingEntry = existingURLs.filter(data => data.hash === urlHash);
    if (existingEntry.length === 0) {
      existingURLs.push({ id: getNextId(), url: receivedURL, hash: urlHash });
    }
    let returnObj = { hash: urlHash };
    res.send(returnObj);
  });
});

router.post("/expand-url", (req, res) => {
  let receivedHash = req.body.hash;
  try {
    let storedURL = decode(receivedHash, existingURLs);
    let result = { url: storedURL };
    res.send(result);
  } catch (error) {
    let errorMsg = {
      message: `There is no long URL registered for hash value '${receivedHash}'`
    };
    res.status(404).send(errorMsg);
  }
});

router.delete("/expand-url/:hash", (req, res) => {
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

module.exports = router;
