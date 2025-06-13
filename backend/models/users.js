const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: "Username is required",
    },
    email: {
      type: String,
      required: "Email is required",
      unique: true,
    },
    password: {
      type: String,
      required: "Password is required",
    },
    address: {
      zipCode: { type: String },
      street: { type: String },
      city: { type: String },
      country: { type: String },
    },
    phone: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["admin", "client"],
      default: "client",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
