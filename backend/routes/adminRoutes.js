const express = require("express");
const { adminAuth } = require("../middleware/auth");
const router = express.Router();
const User = require("../models/Users");
const Product = require("../models/products");
const Category = require("../models/category");
const Review = require("../models/review");
const Order = require("../models/orders");
const axios = require('axios');
const FormData = require('form-data');

const multer = require('multer');
const path = require('path');

router.get("/dashboard", adminAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json({ message: "Admin dashboard", admin: req.user });
});
/* USERS CRUD */
router.get("/dashboard/users", async (req, res) => {
  try {
    const users = await User.find({ role: "client" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/* DELETE USER */

router.delete("/dashboard/delete-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

/* GET REVIEWS */

router.get("/dashboard/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "username")
      .populate("productId", "name");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE REVIEW */

router.delete("/dashboard/delete-review/:id", async (req, res) => {
  try {
    const reviewId = req.params.id;
    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

router.get("/dashboard/products/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*GET PRODUCTS ADMIN*/
router.get("/dashboard/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//update product

router.put("/update/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//delete product
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    const reviews = await Review.deleteMany({ productId: req.params.id });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/dashboard/edit-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { newUsername, newEmail, newPhone } = req.body;
    console.log(req.body);
    await User.findByIdAndUpdate(userId, req.body, { new: true });
    res.json({ message: "User Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

/* PRODUCT CRUD */

  // Configure storage
  const storage = multer.memoryStorage(); // Use memory storage


  const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  const IMGUR_CLIENT_ID = '8a8346a254eb671';

  router.post('/dashboard/products/add',
    upload.fields([{ name: 'images', maxCount: 10 }]),
    async (req, res) => {
      try {
        const { brand, name, description, price, stock, category, discount } = req.body;
        const uploadedImages = [];
  
        const imageFiles = req.files['images'] || [];
  
        // Upload each image to Imgur
        for (const file of imageFiles) {
          const form = new FormData();
          form.append('image', file.buffer.toString('base64'));
  
          const response = await axios.post('https://api.imgur.com/3/image', form, {
            headers: {
              Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
              ...form.getHeaders()
            }
          });
  
          if (response.data.success) {
            uploadedImages.push(response.data.data.link); // Imgur image URL
          } else {
            console.error('Failed to upload image to Imgur:', response.data);
          }
        }
  
        // Create product with Imgur URLs
        const product = new Product({
          brand,
          name,
          description,
          price,
          stock,
          images: uploadedImages,
          category,
          discount
        });
  
        await product.save();
        res.status(200).json({ message: "Product Added Successfully!" });
  
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    }
  );

router.post('/dashboard/products/category/add', async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({
      Catname: name,
    });
    await category.save();
    res.status(200).json({ message: "Category Added Successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/dashboard/products/category", async (req, res) => {
  try {
    const {name} = req.body;
    const category = new Category({
      Catname: name,
    });
    await category.save();
    res.status(200).json({ message: "Category Added Successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/dashboard/products/category", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/dashboard/products/top-selling', async (req, res) => {
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
      { $limit: 4 }
    ]);
    
    

    res.json(topSelling);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch top selling products." });
  }
});


router.get('/dashboard/products/new-arrivals', async (req, res) => {
  try {
    const newArrivals = await Product.find()
      .sort({ createdAt: -1 }) // Most recent first
      .limit(4);

    res.status(200).json(newArrivals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/dashboard/orders', async (req, res) => {
  try {
    const orders = await Order.find()
    res.status(200).json(orders)
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});


module.exports = router;
