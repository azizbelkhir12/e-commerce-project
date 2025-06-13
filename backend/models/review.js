const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.String,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.String,
      ref: "Product",
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent overwriting the model if it already exists
module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
