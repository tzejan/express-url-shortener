var express = require("express");
var router = express.Router();
const Counter = require("./models/Counter");
const HashedURL = require("./models/HashedURL");

const fetchUrl = require("fetch").fetchUrl;

// load our own helper functions
const requestLogger = require("./utils/requestLogger");

let existingURLs = [];

router.use(requestLogger);

function redirectHash(req, res) {
  let requestedHash = req.params.hash;
  HashedURL.retrieveURLfromDB(requestedHash)
    .then(storedURL => res.redirect(storedURL))
    .catch(error => {
      console.log(error);
      let errorMsg = {
        message: `There is no long URL registered for hash value '${requestedHash}'`
      };
      res.status(404).send(errorMsg);
    });
}

function shortenURL(req, res, next) {
  let receivedURL = req.body.url;
  const fetchOptions = { method: "GET" };

  try {
    fetchUrl(receivedURL, fetchOptions, function(error, meta, body) {
      if (error) throw error;
      HashedURL.addURLtoDB(receivedURL)
        .then(urlHash => {
          let returnObj = { hash: urlHash };
          res.json(returnObj);
        })
        .catch(error => {
          next(error);
        });
    });
  } catch (error) {
    console.log(`ERROR in request. Received url = ${receivedURL}`);
    let errorMsg = {
      message: `'${receivedURL}' is not a valid URL`
    };
    res.status(400).send(errorMsg);
  }
}

function expandUrl(req, res, next) {
  let receivedHash = req.body.hash;
  HashedURL.retrieveURLfromDB(receivedHash)
    .then(storedURL => {
      let result = { url: storedURL };
      res.json(result);
    })
    .catch(error => {
      console.log(error);
      let errorMsg = {
        message: `There is no long URL registered for hash value '${receivedHash}'`
      };
      res.status(404).send(errorMsg);
    });
}

function deleteUrl(req, res) {
  let hashToDelete = req.params.hash;
  HashedURL.deleteHashFromDB(hashToDelete)
    .then(result => {
      let message = {
        message: `URL with hash value '${hashToDelete}' deleted successfully`
      };
      res.send(message);
    })
    .catch(error => {
      let errorMsg = {
        message: `URL with hash value '${hashToDelete}' does not exist`
      };
      res.status(404).send(errorMsg);
    });
}

router.get("/:hash", redirectHash);
router.post("/shorten-url", shortenURL);
router.post("/expand-url", expandUrl);
router.delete("/expand-url/:hash", deleteUrl);

module.exports = router;
