const mongoose = require("mongoose");
const Counter = require("./Counter");
const btoa = require("btoa");``

const hashedURLSchemaObject = {
  _id: { type: Number, required: true },
  hash: { type: String, required: true, index: true },
  url: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
};

const hashedURLSchema = mongoose.Schema(hashedURLSchemaObject);

hashedURLSchema.statics.addURLtoDB = async function(url) {
  let urlHash = "";
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

hashedURLSchema.statics.retrieveURLfromDB = async function(hash) {
  let hashedEntry = await HashedURL.findOne({ hash: hash });
  if (hashedEntry) {
    return hashedEntry.url;
  }
  throw new Error("Hash does not exist");
};

hashedURLSchema.statics.deleteHashFromDB = async function(hashToDelete) {
  let result = await HashedURL.deleteOne({ hash: hashToDelete });
  console.log(result);
  if (result.n === 0) {
    throw new Error("No such hash exist");
  }
  return result.n;
};

const HashedURL = mongoose.model("HashedURL", hashedURLSchema);

module.exports = HashedURL;
