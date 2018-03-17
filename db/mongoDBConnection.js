const mongoose = require("mongoose");
const Counter = require("../models/Counter");

async function connectMongoDB() {
  try {
    await mongoose.connect("mongodb://localhost/express-url-shortener");
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    console.log("Mongoose connected!");
    // let index = await Counter.getNextIndex();
    // console.log(index);
  } catch (error) {
    console.log(error);
    console.log("Mongoose connection problem!");
  }
}

module.exports = connectMongoDB;