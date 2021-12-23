var async = require("async");
var Product = require("../models/product");
var Category = require("../models/category");

const { body, validationResult } = require("express-validator");

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
exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      categories_products: function (callback) {
        Product.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect("/catalog/categories");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_products: results.categories_products,
      });
    }
  );
};

// Handle category delete on POST.
exports.category_delete_post = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      categories_products: function (callback) {
        Product.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.categories_products.length > 0) {
        // category has products. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_products: results.categories_products,
        });
        return;
      } else {
        // category has no products. Delete object and redirect to the list of categories.
        Category.findByIdAndRemove(
          req.body.categoryid,
          function deletecategory(err) {
            if (err) {
              return next(err);
            }
            // Success - go to category list
            res.redirect("/store/categories");
          }
        );
      }
    }
  );
};

// Display category update form on GET.
exports.category_update_get = function (req, res, next) {
  // Get category for form.
  Category.findById(req.params.id).exec(function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.url == null) {
      // No results.
      var err = new Error("category not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("category_form", {
      title: "Update Category",
      //category: results.category,
      name: results.name,
      description: results.description,
    });
  });
};

// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitise fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped/trimmed data and old id.
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get category
      Category.findById(req.params.id).exec(function (err, results) {
        if (err) {
          return next(err);
        }
        if (results.category == null) {
          // No results.
          var err = new Error("category not found");
          err.status = 404;
          return next(err);
        }
        // Success.
        res.render("category_form", {
          title: "Update Category",
          category: results.category,
          errors: errors.array(),
        });
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        function (err, thecategory) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to product detail page.
          res.redirect(thecategory.url);
        }
      );
    }
  },
];
