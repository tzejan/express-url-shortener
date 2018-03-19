process.env.NODE_ENV = "test";
const app = require("../../app");
const request = require("supertest");

const mongoose = require("mongoose");
const MongodbMemoryServer = require("mongodb-memory-server").default;

const HashedURL = require("../../models/HashedURL");
const connectMongoDB = require("../../db/mongoDBConnection");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let mongoServer;
let db;
beforeAll(async () => {
  mongoServer = new MongodbMemoryServer();
  process.env.MONGODB_URI = await mongoServer.getConnectionString();
  db = await connectMongoDB();

  console.log("Mongo Memory server setup!");
});

beforeEach(async () => {
  await db.connection.dropDatabase();
});

afterAll(() => {
  mongoose.disconnect();
  mongoServer.stop();
});

describe("shorten URL endpoint tests", () => {
  describe("GET tests", () => {
    it("should redirect for existing hash", async () => {
      let data = new HashedURL({
        _id: 1,
        hash: "Peppa",
        url: "http://www.peppapig.com"
      });
      await data.save();
      return request(app)
        .get("/Peppa")

        .then(response => {
          expect(response.status).toEqual(302);
          expect(response.header.location).toEqual(data.url)
        });
    });

    it("should return not found for non existing hash", () => {
      return request(app)
        .get("/non-existing-hash")

        .then(response => {
          expect(response.status).toEqual(404);
        });
    });
  });
  describe("POST tests", () => {
    it("should create new data for valid URLs", () => {
      return request(app)
        .post("/shorten-url")
        .send({ url: "http://www.peppa.com" })

        .then(response => {
          //   console.log(response.body);
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty("hash");
        });
    });
    it("should not create new data for existing URLs", async () => {
      let url = "http://www.peppapig.com";
      let data = new HashedURL({
        _id: 1,
        hash: "Peppa",
        url: url
      });
      await data.save();
      return request(app)
        .post("/shorten-url")
        .send({ url: url })

        .then(response => {
          // console.log(response);
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty("hash");
          expect(response.body.hash).toEqual(data.hash);
        });
    });
    it("should return the url for existing hash", async () => {
      let url = "http://www.peppapig.com";
      let data = new HashedURL({
        _id: 1,
        hash: "Peppa",
        url: url
      });
      await data.save();
      return request(app)
        .post("/expand-url")
        .send({ hash: data.hash })

        .then(async response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty("url");
          expect(response.body.url).toEqual(data.url);
        });

      it("should return error for non existing hash", async () => {
        return request(app)
          .post("/expand-url")
          .send({ hash: "non-existing-hash" })

          .then(async response => {
            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
          });
      });
    });
  });

  describe("DELETE tests", () => {
    describe("delete stored URLs", () => {
      it("should delete if hash exist", async () => {
        let data = new HashedURL({
          _id: 1,
          hash: "Peppa",
          url: "http://www.peppapig.com"
        });
        await data.save();
        return request(app)
          .delete(`/expand-url/${data.hash}`)

          .then(response => {
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("message");
          });
      });
      it("should return not found if hash does not exist", () => {
        return request(app)
          .delete(`/expand-url/non-existing-hash`)

          .then(response => {
            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
          });
      });
    });
  });
});
