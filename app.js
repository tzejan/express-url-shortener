const express = require("express");
const shorten_url = require("./shorten_url");
const bodyParser = require("body-parser");

const Counter = require("./models/Counter");

const app = express();
app.use(bodyParser.json());

app.use("/", shorten_url);

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
  res.send("server dieded processing your request");
});

module.exports = app;
