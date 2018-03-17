const connectMongoDB = require("./db/mongoDBConnection");
const app = require("./app");

connectMongoDB();

const server = app.listen(process.env.PORT || 3000, function() {
  console.log(`Listening on port ${server.address().port}...`);
});
