const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  image1: { type: String, required: true },
  image2: { type: String, required: false },
  image3: { type: String, required: false },
  image4: { type: String, required: false },
  image5: { type: String, required: false },
  category: { type: String, required: true },
  createdTime: { type: String, required: true },
});

// Export model
module.exports = mongoose.model("Product", ProductSchema);
