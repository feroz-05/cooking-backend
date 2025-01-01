const mongoose = require("mongoose");

// Define the Category schema
const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    required: true,
    unique: true, // Ensures uniqueness
  },
  category_name: {
    type: String,
    required: true,
    trim: true, // Removes extra spaces
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create the model
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
