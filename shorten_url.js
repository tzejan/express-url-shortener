var express = require("express");
var router = express.Router();
const Counter = require("./models/Counter");
const HashedURL = require("./models/HashedURL");

const fetchUrl = require("fetch").fetchUrl;

// load our own helper functions
const requestLogger = require("./utils/requestLogger");
const btoa = require("btoa");

let existingURLs = [];

router.use(requestLogger);

function redirectHash(req, res) {
  let requestedHash = req.params.hash;
  retrieveURLfromDB(requestedHash)
    .then(storedURL => res.redirect(storedURL))
    .catch(error => {
      console.log(error);
      let errorMsg = {
        message: `There is no long URL registered for hash value '${requestedHash}'`
      };
      res.status(404).send(errorMsg);
    });
}

async function addURLtoDB(url) {
  let urlHash = "";
  let existingEntry = await HashedURL.find({ url: url });
  if (existingEntry.length === 0) {
    console.log(`${url} not found, adding new entry`);
    let index = await Counter.getNextIndex();
    urlHash = btoa(index);
    let newHashedURL = new HashedURL({ _id: index, hash: urlHash, url: url });
    await newHashedURL.save();
  } else {
    urlHash = existingEntry[0].hash;
  }
  return urlHash;
}

function shortenURL(req, res, next) {
  let receivedURL = req.body.url;
  const fetchOptions = { method: "GET" };

  try {
    fetchUrl(receivedURL, fetchOptions, function(error, meta, body) {
      if (error) throw error;
      addURLtoDB(receivedURL)
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

async function retrieveURLfromDB(hash) {
  let hashedEntry = await HashedURL.findOne({ hash: hash });
  if (hashedEntry) {
    return hashedEntry.url;
  }
  throw new Error("Hash does not exist");
}

function expandUrl(req, res, next) {
  let receivedHash = req.body.hash;
  retrieveURLfromDB(receivedHash)
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

async function deleteHashFromDB(hashToDelete) {
  let result = await HashedURL.deleteOne({ hash: hashToDelete });
  console.log(result);
  if (result.n === 0){
    throw new Error("No such hash exist")
  }
  return result.n;
}

function deleteUrl(req, res) {
  let hashToDelete = req.params.hash;
  deleteHashFromDB(hashToDelete)
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
