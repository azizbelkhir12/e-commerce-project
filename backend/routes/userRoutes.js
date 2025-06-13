const express = require("express");
const { auth } = require("../middleware/auth");
const { adminAuth  } = require("../middleware/auth");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const router = express.Router();
const bcrypt = require("bcrypt");
const Product = require("../models/Products");
const Category = require("../models/categories");



dotenv.config();

// GET user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      username: user.username || "",
      email: user.email || "",
      profileImage: user.profileImage || "",
      address: user.address || "",
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH (Update) user profile
router.patch("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Received body:", req.body);

    // Update user fields dynamically
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    });

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* CHANGE PASSWORD */

router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, repeatPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (newPassword !== repeatPassword)
      return res.status(400).json({ message: "New password does not match" });

    console.log("User ID: ", req.user.id);

    console.log("Current Password: ", currentPassword);
    console.log("user Password: ", user.password);

    const match = await bcrypt.compare(currentPassword.trim(), user.password);
    if (!match)
      return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/*GET PRODUCTS USER*/ 
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 13;
    const skip = (page - 1) * limit;

    console.log(`Fetching products: page=${page}, limit=${limit}, skip=${skip}`);


    const products = await Product.find().skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments();

    console.log(`Total products: ${totalProducts}, Products fetched: ${products.length}`);

    const hasMore = skip + limit < totalProducts;
    console.log(`Has more: ${hasMore}`);


    res.json({ products, hasMore });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/* GET CATEGORIES */
router.get('/categories', async (req, res) => {
  try {
      const categories = await Category.find();
      res.json(categories);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

// GET admin profile
router.get("/admin/profile", adminAuth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      username: admin.username || "",
      email: admin.email || "",     
      role: admin.role || "",
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
