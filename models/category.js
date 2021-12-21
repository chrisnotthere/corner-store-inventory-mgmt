var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 25 },
  description: { type: String, required: true, maxLength: 200 },
  image: { type: String, required: true, maxLength: 200 },
});

// Virtual for Category URL
CategorySchema.virtual("url").get(function () {
  return "/store/category/" + this._id;
});

//Export model
module.exports = mongoose.model("Category", CategorySchema);
