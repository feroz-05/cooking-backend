const mongoose = require("mongoose");

// Define the schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Makes the field mandatory
    trim: true // Removes extra spaces
  },
  email: {
    type: String,
    required: true,
    lowercase: true, // Converts email to lowercase
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"] // Email validation
  },
  password: {
    type: String,
    required: true,
    // minlength: 6 // Ensures password is at least 6 characters
  },
  address: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Create the model
const User = mongoose.model("User", userSchema);
module.exports = User;
