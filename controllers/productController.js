var async = require("async");
var Product = require("../models/product");
var Category = require("../models/category");

const { body, validationResult } = require("express-validator");

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
      res.render("product_detail", { title: results.name, results });
    });
};

// Display product create form on GET.
exports.product_create_get = function (req, res, next) {
  // Get all categories, which we can use for adding to our product.
  Category.find({})
    .sort({ name: 1 })
    .exec(function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("product_form", {
        title: "Create new Product",
        categories: results,
      });
    });
};

// Handle product create on POST.
exports.product_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate and sanitise fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("image", "Image must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "Stock must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Product object with escaped and trimmed data.
    var product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.body.image,
      stock: req.body.stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      Category.find({})
        .sort({ name: 1 })
        .exec(function (err, results) {
          if (err) {
            return next(err);
          }
          res.render("product_form", {
            title: "Create Product",
            name: results.name,
            price: results.price,
            description: results.description,
            image: results.image,
            stock: results.stock,
            category: results.category,
            errors: errors.array(),
          });
        });
      return;
    } else {
      // Data from form is valid. Save product.
      product.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new product record.
        res.redirect(product.url);
      });
    }
  },
];

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
