const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.Mixed,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    billingDetails: {
      name: String,
      address: String,
      city: String,
      country: String,
      postcode: String,
      phone: String,
      email: String,
      notes: String,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "cash_on_delivery"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "expired", "delivered", "canceled"],
      default: "pending",
    },
    confirmationToken: {
      type: String,
      default: null,
    },
    confirmationExpires: {
       type: Date 
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
