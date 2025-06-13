const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const payementRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

//Security configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-with, Authorization, expiresIn"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS, PATCH, PUT"
  );
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/review", reviewRoutes);
/* app.use("/api/product", productRoutes); */
app.use("/api/payement", payementRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/category", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
