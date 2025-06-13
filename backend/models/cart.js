const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schéma for the cart item
const CartItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  images: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "La quantité minimale est de 1"],
  },
});

// Schéma for the cart
const CartSchema = new Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    items: [CartItemSchema], //Liste of CartItemSchema
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null, 
    },
    shipping: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
  
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
