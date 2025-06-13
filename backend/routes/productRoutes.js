const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const Order = require("../models/orders");

const { auth } = require("../middleware/auth");
router.get("/best-sellers", async (req, res) => {
  try {
    const topSelling = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      {
        $project: {
          productId: { $toObjectId: "$_id" },
          totalSold: 1,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          product: "$productDetails",
          totalSold: 1,
        },
      },
      { $limit: 4 },
    ]);

    res.json(topSelling);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch top selling products." });
  }
});

router.get("/new-arrivals", async (req, res) => {
  try {
    const newArrivals = await Product.find()
      .sort({ createdAt: -1 }) // Most recent first
      .limit(4);

    res.status(200).json(newArrivals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// Route to get all related products
router.get("/related/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(5);
    !relatedProducts.length &&
      res.status(404).json({ message: "No related products found" });
    res.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get 6 related products by category
router.get("/related/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    }).limit(6);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
