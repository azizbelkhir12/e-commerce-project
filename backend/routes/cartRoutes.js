const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Cart = require("../models/cart");
const Product = require("../models/products");
const Coupon = require('../models/coupon');

// Get cart by clientId
router.get("/", auth, async (req, res) => {
  try {
    const clientId = req.user.id;
    const cart = await Cart.findOne({ clientId });
    if (!cart) {
      return res.status(404).send("Cart not found");
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving cart");
  }
});
router.put("/", auth, async (req, res) => {
  try {
    const clientId = req.user.id;
    const { newCartItems } = req.body;
    let cart = await Cart.findOne({ clientId });
    cart.items = newCartItems;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).send("Error updating cart");
  }
});

router.delete("/all", auth, async (req, res) => {
  try {
    const clientId = req.user.id;
    await Cart.deleteOne({ clientId });
    res.status(200).send("Cart deleted successfully");
  } catch (error) {
    console.error("Error deleting cart:", error);
    res.status(500).send("Error deleting cart");
  }
});
/* GET PRODUCTS BY IDs */
router.post('/products/bulk', async (req, res) => {
  const { ids } = req.body;

  try {
    const products = await Product.find({ _id: { $in: ids } });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});


/* SYNC GUEST CART TO DB */
router.post('/add', auth, async (req, res) => {
  try {
    const clientId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ clientId });

    if (!cart) {
      cart = new Cart({ clientId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // If product already exists in cart, just update the quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      cart.items.push({
        productId: product._id,
        name: product.name,
        images: product.images[0],
        price: product.price,
        quantity: quantity,
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});



router.post('/sync', auth, async (req, res) => {
  const userId = req.user.id;
  const guestItems = req.body.items;

  let cart = await Cart.findOne({ clientId: userId }) || new Cart({ clientId: userId, items: [] });

  for (const guestItem of guestItems) {
    const index = cart.items.findIndex(item => item.productId.toString() === guestItem.productId);

    if (index > -1) {
      cart.items[index].quantity += guestItem.quantity;
    } else {
      const product = await Product.findById(guestItem.productId);
      if (!product) {
        continue;
      }
      cart.items.push({ productId: product._id,
        name: product.name,
        images: product.images[0],
        price: product.price,
        quantity: guestItem.quantity });
    }
  }

  await cart.save();
  res.status(200).json(cart);
});



// DELETE PRODUCT FROM CART

router.delete('/:cartId/product/:productId', async (req, res) => {
  const { cartId, productId } = req.params;

  try {
    const cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.items.splice(productIndex, 1);

    await cart.save();

    res.json({ message: 'Product is deleted', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:cartId/apply-coupon', async (req, res) => {
  const { cartId } = req.params;
  const { couponId } = req.body;

  console.log("Cart ID:", cartId);
  console.log("Coupon ID:", couponId);

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(400).json({ message: 'Invalid coupon' });

    const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = (subtotal * coupon.discount) / 100;

    cart.couponId = couponId;
    cart.total = subtotal - discountAmount + (cart.shipping || 0); 

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Apply Coupon Error:", error);
    res.status(500).json({ message: 'Error applying coupon' });
  }
});

router.put('/:cartId/checkout', async (req, res) => {
  const { cartId } = req.params;
  const { shippingCost } = req.body;

  try {
    const cart = await Cart.findById(cartId).populate("couponId");
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.shipping = shippingCost;

    const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let discountAmount = 0;
    if (cart.couponId && cart.couponId.discount) {
      discountAmount = (subtotal * cart.couponId.discount) / 100;
    }

    cart.total = subtotal - discountAmount + cart.shipping;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during checkout' });
  }

});



module.exports = router;
