var express = require("express");
var router = express.Router();

const fetchUrl = require("fetch").fetchUrl;

// load our own helper functions
const encode = require("./demo/encode");
const decode = require("./demo/decode");
const requestLogger = require("./utils/requestLogger");

let existingURLs = [];

router.use(requestLogger);

function redirectHash(req, res) {
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
}

function getNextId() {
  return "" + (existingURLs.length + 1);
}

function addURLtoDB(url) {
  let urlHash = encode(url, existingURLs);
  let existingEntry = existingURLs.filter(data => data.hash === urlHash);
  if (existingEntry.length === 0) {
    existingURLs.push({ id: getNextId(), url: url, hash: urlHash });
  }
  return urlHash;
}

function shortenURL(req, res) {
  let receivedURL = req.body.url;

  const fetchOptions = { method: "GET" };

  fetchUrl(receivedURL, fetchOptions, function(error, meta, body) {
    if (error) {
      let errorMsg = {
        message: `'${receivedURL}' is not a valid URL`
      };
      res.status(400).send(errorMsg);
    }

    let urlHash = addURLtoDB(receivedURL);
    let returnObj = { hash: urlHash };
    res.send(returnObj);
  });
}

function expandUrl(req, res) {
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
}

function deleteUrl(req, res) {
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
}

router.get("/:hash", redirectHash);
router.post("/shorten-url", shortenURL);
router.post("/expand-url", expandUrl);
router.delete("/expand-url/:hash", deleteUrl);

module.exports = router;
