const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Links to the User collection (if you have one)
    required: true, // Mandatory to associate the cart with a user
    ref: "User", // Reference to the User schema
  },
  item_id: {
    type: String,
    required: true, // Field is mandatory
    unique:false
  },
  item_name: {
    type: String,
    required: true, // Field is mandatory
    trim: true, // Removes extra spaces
  },
  item_type: {
    type: String,
    required: true, // Field is mandatory
    default: "Other", // Sets default type
  },
  item_price: {
    type: Number,
    required: true, // Field is mandatory
    min: 0, // Ensures the price is non-negative
  },
  image: {
    type: String,
    required: true,
  },
  item_quantity: {
    type: Number,
    required: true, // Field is mandatory
    default: 5, // Default quantity
  },
  weight:{
    type:String,
    required:true,
    default:"kg"
  },
  category: {
    type: String,
    default: "other",
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
