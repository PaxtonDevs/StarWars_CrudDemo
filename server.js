console.log("May node be with you");

// The modules required
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const MongoClient = require("mongodb").MongoClient;

// MongoDB passString
const connectionString = ""; // required string info

// MongoDb method
MongoClient.connect(connectionString, (err, client) => {
  if (err) return console.error(err);
  console.log("Connected to Database...");
  const db = client.db("star-wars-quotes");

  // variable containing the collection of quotes
  const quotesCollection = db.collection("quotes");

  // change view engine to ejs
  app.set("view engine", "ejs");

  // Using BodyParser first to turn request into object.
  app.use(bodyParser.urlencoded({ extended: true }));

  // Using a bult-in middleware express static to make public
  app.use(express.static("public"));

  // Making BP into JSON
  app.use(bodyParser.json());

  // GET method in JS. The '/' is a path set to root, or homepage.
  app.get("/", (req, res) => {
    quotesCollection
      .find()
      .toArray()
      .then((results) => {
        console.log(results);
        //HTML rendering
        res.render("index.ejs", { quotes: results });
      })
      .catch((error) => console.error(error));

    // res.sendFile(__dirname + "/index.html");
  });

  // POST method in JS..req.body returns an object. This is creating the data, posting it in MongoDB. Need to use Get to render to user..
  app.post("/quotes", (req, res) => {
    quotesCollection
      .insertOne(req.body)
      .then((result) => {
        res.redirect("/");
      })
      .catch((error) => console.error(error));
  });

  // PUT method-- This changes existing data and will insert if no document is found.
  app.put("/quotes", (req, res) => {
    quotesCollection
      .findOneAndUpdate(
        { name: "Yoda" },
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote,
          },
        },
        {
          upsert: true,
        }
      )
      .then((result) => {
        res.json("Success");
      })
      .catch((error) => console.error(error));
  });

  // Delete Method--
  app.delete("/quotes", (req, res) => {
    quotesCollection
      .deleteOne({ name: req.body.name })
      .then((result) => {
        // If there are no more Darth quotes
        if (result.deletedCount === 0) {
          return res.json("No quote to delete");
        }

        res.json(`Deleted Darth Vadar's quote`);
      })
      .catch((error) => console.error(error));
  });

  // Listening port 3000
  app.listen(3000, function () {
    console.log("listening on 3000...");
  });
});
