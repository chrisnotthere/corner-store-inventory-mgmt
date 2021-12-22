var Product = require("../models/product");
var Category = require("../models/category");

var async = require("async");

exports.index = function (req, res) {
  async.parallel(
    {
      product_count: function (callback) {
        Product.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      category_count: function (callback) {
        Category.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Corner Store Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Products.
exports.product_list = function (req, res, next) {
  Product.find({}, "name category price")
    .sort({ name: 1 })
    .populate("category")
    .exec(function (err, list_products) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("product_list", {
        title: "Product List",
        product_list: list_products,
      });
    });
};

// Display product page for a specific product.
exports.product_detail = function (req, res, next) {
  Product.findById(req.params.id)
    .populate("category")
    .exec(function (err, results) {
      //console.dir(results.name, { depth: null });
      if (err) {
        return next(err);
      }
      if (results.name == null) {
        // No results.
        var err = new Error("Product not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("product_detail", { title:results.name, results });
    });
};

// Display product create form on GET.
exports.product_create_get = function (req, res) {
  res.send("NOT IMPLEMENTED: product create GET");
};

// Handle product create on POST.
exports.product_create_post = function (req, res) {
  res.send("NOT IMPLEMENTED: product create POST");
};

// Display product delete form on GET.
exports.product_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: product delete GET");
};

// Handle product delete on POST.
exports.product_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED: product delete POST");
};

// Display product update form on GET.
exports.product_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: product update GET");
};

// Handle product update on POST.
exports.product_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: product update POST");
};
