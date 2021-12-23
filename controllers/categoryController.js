var async = require("async");
var Product = require("../models/product");
var Category = require("../models/category");

const { body,validationResult } = require('express-validator');

// Display list of all Categories.
exports.category_list = function (req, res, next) {
  Category.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("category_list", {
        title: "Category List",
        category_list: list_categories,
      });
    });
};

// Display detail page for a category.
exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_products: function (callback) {
        Product.find({ category: req.params.id }, "name price").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.category == null) {
        // No results.
        var err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("category_detail", {
        title: "Category Detail",
        results,
      });
    }
  );
};

// Display Category create form on GET.
exports.category_create_get = function (req, res, next) {
  res.render("category_form", { title: "Create Category" });
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name must be specified."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description must be specified."),
  body("image")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Image must be specified."),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        category: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Create a Category object with escaped and trimmed data.
      var category = new Category({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
      });
      category.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new category record.
        res.redirect(category.url);
      });
    }
  },
];

// Display category delete form on GET.
exports.category_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: category delete GET");
};

// Handle category delete on POST.
exports.category_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED: category delete POST");
};

// Display category update form on GET.
exports.category_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: category update GET");
};

// Handle category update on POST.
exports.category_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: category update POST");
};
