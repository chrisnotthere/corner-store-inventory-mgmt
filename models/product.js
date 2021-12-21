var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  name: { type: String, required: true, maxLength: 25 },
  price: { type: Number, required: true },
  description: { type: String, required: true, maxLength: 200 },
  image: { type: String, required: true },
  stock: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

// Virtual for Product's URL
ProductSchema.virtual("url").get(function () {
  return "/store/product/" + this._id;
});

//Export model
module.exports = mongoose.model("Product", ProductSchema);
