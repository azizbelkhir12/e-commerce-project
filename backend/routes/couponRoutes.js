const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Coupon = require("../models/coupon");
const cron = require('node-cron');

// GET ALL COUPONS
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD COUPON
router.post('/coupons', async (req, res) => {
  const { couponCode, discount, thematique, dureeValidite } = req.body;

  const dateDebut = new Date();
  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateFin.getDate() + dureeValidite);

  const newCoupon = new Coupon({
    couponCode,
    discount,
    thematique,
    dateDebut,
    dateFin,
    actif: true,
  });

  try {
    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE COUPON
router.delete('/coupons/:id', async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET COUPON BY CODE
router.get('/coupons/:couponCode', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ couponCode: req.params.couponCode });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Vérifier s'il est encore actif
    const maintenant = new Date();
    if (coupon.dateFin < maintenant || !coupon.actif) {
      return res.status(400).json({ message: 'This coupon has expired or is inactive' });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cron job pour désactiver les coupons expirés chaque jour à minuit
cron.schedule('0 0 * * *', async () => {
  const maintenant = new Date();
  try {
    await Coupon.updateMany(
      { dateFin: { $lt: maintenant }, actif: true },
      { $set: { actif: false } }
    );
    console.log('Expired coupons successfully deactivated');
  } catch (err) {
    console.error('Error while desactivating expired coupons:', err);
  }
});

module.exports = router;
