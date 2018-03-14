function requestLogger(req, res, next) {
  console.log("Request URL:", req.originalUrl);
  console.log("Request params:", req.params);
  next();
}

module.exports = requestLogger;
