const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 5,
      max: 90,
    },
    thematique: { 
      type: String, 
    },
    dateDebut: { 
      type: Date, 
    },
    dateFin: { 
      type: Date, 
    },
    actif: { 
      type: Boolean, 
    },


  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
