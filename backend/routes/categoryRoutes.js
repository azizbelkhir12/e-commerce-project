const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Category = require("../models/category");
const cron = require('node-cron');

// GET ALL COUPONS
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
});

// ADD COUPON
router.post('/categories', async (req, res) => {
    try {
        const { Catname } = req.body;
    
        if (!Catname) {
          return res.status(400).json({ message: 'Category name is required' });
        }
    
        const exists = await Category.findOne({ Catname });
        if (exists) return res.status(409).json({ message: 'Category already exists' });
    
        const newCat = new Category({ Catname });
        await newCat.save();
        res.status(201).json({ message: 'Category created', category: newCat });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    
});

// DELETE CATEGORY
router.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ message: 'Category deleted' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
});
//UPDATE CATEGORY
router.put('/categories/:id', async (req, res) => {
    try {
        const { Catname } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, { Catname }, { new: true });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ message: 'Category updated', category });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
});


module.exports = router;
