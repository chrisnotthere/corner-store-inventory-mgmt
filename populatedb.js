#! /usr/bin/env node

console.log(
  "This script populates some test products and categories to the database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require("async");
var Product = require("./models/product");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var categories = [];
var products = [];

function categoryCreate(name, description, image, cb) {
  categorydetail = { name, description, image };

  var category = new Category(categorydetail);

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function productCreate(name, price, description, image, stock, category, cb) {
  productdetail = { name, price, description, image, stock, category };

  var product = new Product(productdetail);
  product.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New product: " + product);
    products.push(product);
    cb(null, product);
  });
}

///
function createcategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "Fruit",
          "We get all of our fruit from PepperRidge Farms.",
          "image1",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Baked Goods",
          "Freshly baked every day, please order ahead to guarantee a specific item. Everything is 50% off after 4pm.",
          "image2",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Vegetables",
          "this is the default description for Vegetables.",
          "image3",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Coffee",
          "We have the best coffee in town!",
          "image4",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Dairy",
          "Our dairy products are all locally sourced.",
          "image5",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Junk",
          "Who doesn't like to pig out from time to time?",
          "image6",
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

// name, price, description, image, stock, category
function createproducts(cb) {
  async.parallel(
    [
      function (callback) {
        productCreate(
          "Eggs (1 dozen)",
          4.11,
          "Eggs have a hard shell of calcium carbonate enclosing a liquid white, a single yolk (or an occasional double yolk)and an air cell.",
          "eggs.png",
          15,
          categories[4],
          callback
        );
      },
      function (callback) {
        productCreate(
          "Gala Apples",
          0.99,
          "Super juicy and delicious.",
          "apples.png",
          122,
          categories[0],
          callback
        );
      },
      function (callback) {
        productCreate(
          "Bananas",
          1.79,
          "The banana is a lengthy yellow fruit, found in the market in groups of three to twenty fruits, similar to a triangular cucumber, oblong and normally yellow.",
          "bananas.png",
          87,
          categories[0],
          callback
        );
      },
      function (callback) {
        productCreate(
          "Apple Fritter",
          0.89,
          "Made with Gala Apples",
          "fritter.png",
          12,
          categories[1],
          callback
        );
      },
      function (callback) {
        productCreate(
          "Mango",
          14.99,
          "Pricey but totally worth it!",
          "mango.png",
          6,
          categories[0],
          callback
        );
      },
      function (callback) {
        productCreate(
          "Latte",
          8.11,
          "A latte or caffè latte is a milk coffee that boasts a silky layer of foam as a real highlight to the drink.",
          "eggs.png",
          15,
          categories[3],
          callback
        );
      },
      function (callback) {
        productCreate(
          "Kale",
          9.69,
          "Perfect for salads and smoothies.",
          "kale02.png",
          22,
          categories[2],
          callback
        );
      },
      function (callback) {
        productCreate(
          "Bok Choy",
          7.52,
          "Bok Choy, also called white Chinese cabbage, belongs to the leafy vegetable pak choi family of Chinese brassicas. Bok Choy has white or green, thick, crunchy stems with light to dark green wide leaves.",
          "bokchoy.png",
          7,
          categories[2],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createcategories, createproducts],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("products: " + products);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
