const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: "brand is required",
    },
    name: {
      type: String,
      required: "Name is required",
    },
    description: {
      type: String,
      required: "Description is required",
    },
    price: {
      type: Number,
      required: "Price is required",
    },
    stock: {
      type: Number,
      required: "Count in stock is required",
    },
    images: [
      {
        type: String,
        required: "Image URL is required",
      },
    ],

    category: {
      type: String,
      required: "Sizes are required",
    },

    discount: {
      type: Number,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    subCategory: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
