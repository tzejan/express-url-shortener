const mongoose = require("mongoose");
const Counter = require("../models/Counter");

async function connectMongoDB() {
  try {
    console.log("Trying to connect to "+process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    console.log("Mongoose connected!");
  } catch (error) {
    console.log(error);
    console.log("Mongoose connection problem!");
  }
}

module.exports = connectMongoDB;