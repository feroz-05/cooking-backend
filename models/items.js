const { type } = require("express/lib/response");
const mongoose = require("mongoose");

// Define the schema
const itemSchema = new mongoose.Schema({
  item_id: {
    type: String,
    required: true, // Field is mandatory
    unique: true,   // Ensures uniqueness (acts as a primary key)
  },
  item_name: {
    type: String,
    required: true, // Field is mandatory
    trim: true // Removes extra spaces
  },
  item_type: { 
    type: String,
    required: true, // Field is mandatory
    default: "Other" // Sets default type
  },
  item_price: {
    type: Number,
    required: true,  // Field is mandatory
    min: 0,          // Ensures the price is non-negative
  },
  image:{
    type:String,
    required:true
  },
  item_quantity:{
    type:Number,
    required:true,
    default:5
  },

  category: {
    type:String,
    default:"other"
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create the model
const Item = mongoose.model("Item", itemSchema);

module.exports = Item;