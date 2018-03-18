[![Build Status](https://travis-ci.org/tzejan/express-url-shortener.svg?branch=master)](https://travis-ci.org/tzejan/express-url-shortener)

# Build a URL shortener web service using Express.js 

Build a URL-shortener service like [bit.ly](https://bitly.com/) or [goo.gl](https://goo.gl/) using Express.js.

## Getting started
- Fork and clone the repo
- Install dependencies: `yarn install`
- Start the application: `node server.js`
  - You can also use `nodemon` to automatically restart your application with every code change: `nodemon server.js`

## Your Task

At a very high level, the URL shortener works by taking an entered URL and creating a relatively shortened version simplified into an easy to share format.

In this assignment, you need to implement the following API endpoints:

### POST /shorten-url

The body of the HTTP request should be an JSON object containing one field `url`, e.g.

```json
{
   "url": "https://facebook.github.io/jest/docs/en/asynchronous.html"
}
```

The response body is an JSON object containing one field `hash`, e.g.

```json
{
   "hash": "MTAwMDA="
}
```

Requirements:

- The `hash` in the response is a unique value for each given `url` (i.e. two different URLs should maps to different `hash` values)
- Calling the API multiple times with the same `url` value should get back the same `hash` value. Each time this API is called, the HTTP status code in the response should be `200`, even if the url has been shortened before
- You should store the url and the hash as an object (keys: `id`, `url`, `hash`) and this object should be added to an array. This array will act as our "database" for this assignment.
```javascript
const existingURLs = [
  { id: "1", url: "www.google.com", hash: "MQ==" },
  { id: "2", url: "www.facebook.com", hash: "Mg==" }
];
```

Note:
- In this project, there's a helper function (in `./demo/encoder.js`) to help you with the encoding.
- This is how `encode()` works:
  - check if URL exists in the data store (right now it's just an array because we haven't touched databases yet)
  - If it doesn't exist, add it to the array and use its id value to generate a hash
  - it it exists, simply retrieve the object's `hash` property

You can read more about [base64 encoding](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding) here

### GET /expand-url/:hash

Note:
- In this project, there's a helper function (in `./demo/decoder.js`) to help you with the decoding.
- This is how `decode()` works:
  - check if URL exists in the data store
  - If it doesn't exist, return HTTP status code `404` and the response body should look like

```json
{
  "message": "There is no long URL registered for hash value 'MTAwMDA='";
}
```
  - it it exists, return HTTP status code `200` with a JSON string in body containing the object's `url` property:

```json
{
   "url": "https://facebook.github.io/jest/docs/en/asynchronous.html"
}
```

### DELETE /expand-url/:hash

Suppose someone wants to delete the record of the shortened URL (people do that when they don't want their bitly link to be accessible anymore). The API should delete the record if it exists and return a HTTP status code `200` and a JSON string in body.

```json
{
   "message": "URL with hash value 'MTAwMDA=' deleted successfully";
}
```

If the record doesn't exist, it should return a HTTP status code `404` and a JSON string in body.

```json
{
   "message": "URL with hash value 'MTAwMDA=' does not exist";
}
```

You can try make a HTTP request (GET /expand-url?hash=someHash) to verify that the record was deleted successfully.

### Bonus task 1: GET /:someHash should redirect user to the actual URL (e.g. www.google.com)

Add a route handler for the 'localhost:3000/:someHash' endpoint. When a user requests for this URL, your app should redirect them to the actual URL if it exists. If it doesn't, you should return a 404 with a JSON string in body

```json
{
   "message": "URL with hash value 'MTAwMDA=' does not exist";
}
```

Note: In your implementation, you must specify the 'https://' prefix before your URL (e.g. "https://www.google.com"). Otherwise, if you just use 'www.google.com' express will think that you're trying to redirect you to 'localhost:3000/www.google.com'


### Bonus task 2: Validate URL before encoding it

In your route handler for 'POST /shorten-url', add validation to ensure that the url in the request body is valid.
A valid URL is any URL that works when you paste it in your browser. Examples: 
Examples of valid URLs:
- http://www.google.com
- https://www.google.com
- https://www.google.com.sg/?gfe_rd=cr&dcr=0&ei=ChGnWvbiHtO1rAH1_ZDgBQ
- www.google.com
- google.com
- yahoo.net
- google.com
- engineers.sg
- element.ai

Examples of invalid URLs
- google
- 123
- engineers.g

Note:
- You can use `fetch` (https://www.npmjs.com/package/fetch) to make a request to the url provided by the user.  
- If and when you encounter a cross-origin resource sharing (CORS) error, use the `cors` npm package to overcome it: https://www.npmjs.com/package/cors
