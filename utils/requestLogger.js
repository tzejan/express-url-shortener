function requestLogger(req, res, next) {
  console.log("Request URL:", req.originalUrl);
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  next();
}

module.exports = requestLogger;
