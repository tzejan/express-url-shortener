const mongoose = require("mongoose");

const hashedURLSchemaObject = {
  _id: { type: Number, required: true},
  hash: { type: String, required: true, index: true},
  url: { type: String, required: true},
  created_at: { type: Date, default: Date.now }
};

const hashedURLSchema = mongoose.Schema(hashedURLSchemaObject);

const HashedURL = mongoose.model("HashedURL", hashedURLSchema);

module.exports = HashedURL;
