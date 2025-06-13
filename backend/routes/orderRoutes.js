const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Order = require('../models/orders');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


router.post("/order", async (req, res) => {
    try {
        const { user, products, totalPrice, billingDetails, paymentMethod } = req.body;
    
        const newOrder = new Order({
          user,
          products,
          totalPrice,
          billingDetails,
          paymentMethod
        });

        if (paymentMethod === "cash_on_delivery") {
          const token = generateToken();
          newOrder.confirmationToken = token;
        }
    
        const savedOrder = await newOrder.save();
    
        if (paymentMethod === "cash_on_delivery") {
          await sendConfirmationEmail(
            newOrder.billingDetails.email,
            savedOrder._id,
            newOrder.confirmationToken
          );
        }
    
        return res.status(201).json(savedOrder); // ✅ send response only ONCE
      } catch (error) {
        console.error("Order submission error:", error);
        res.status(500).json({ message: 'Failed to place order.' });
      }
});

//GET ALL ORDERS FOR THE CONNECTED CLIENT
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .select("date totalPrice status")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});
router.get('/dashboard/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.product", "name") 
    res.status(200).json(orders)
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});
/* Cancel Order from Client side */
router.patch("/cancel", auth, async (req,res) => {
  const { orderId, status } = req.body;
  if (status !== "pending") {
    return res.status(400).json({ message: "Only pending orders can be canceled." });
  }
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "canceled" },
      { new: true }
    );
    res.status(200).json({message: "Order canceled successfully", order });
  } catch (err) {
    console.error("Error canceling order:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
})

/* Send confirmation email */

// Generate a unique token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendConfirmationEmail(userEmail, orderId, token) {
  const PORT = process.env.PORT;
  const expirationTime = new Date();
  expirationTime.setDate(expirationTime.getDate() + 1);

  await Order.findByIdAndUpdate(orderId, {
    confirmationToken: token,
    confirmationExpires: expirationTime,
  });

  const confirmationUrl = `http://localhost:4200/confirm-order/${orderId}/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: userEmail,
    subject: 'Confirm Your Order',
    html: `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
        <h2 style="color: #111; margin-bottom: 20px;">🛒 Confirm Your Order</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Hey there! We've received your cash on delivery order. To make sure everything’s legit, we just need you to confirm it.
        </p>
        <p style="font-size: 16px; margin: 30px 0;">
          Tap the button below to confirm your order and get it shipped straight to you:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background-color: #22c55e; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ✅ Confirm My Order
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">
          If you didn’t make this order, just ignore this email. Your order won’t be processed unless confirmed.
        </p>
        <hr style="margin: 40px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} YourStoreName. All rights reserved.
        </p>
      </div>
    </div>
  `,
  });
}

router.post('/confirm-order/:orderId/:token', async (req, res) => {
  const { orderId, token } = req.params;

  const order = await Order.findById(orderId);

  if (!order || order.confirmationToken !== token) {
    return res.status(400).send('Invalid or expired token');
  }

  const currentTime = new Date();
  if (order.confirmationExpires < currentTime) {
    return res.status(400).send('Token has expired');
  }

  order.isConfirmed = true;
  order.status = "confirmed";
  order.confirmationToken = null;
  order.confirmationExpires = null; 
  await order.save();

  res.send('Order confirmed successfully!');
});
router.get("/:orderId", auth, async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.put("/modify/:id", async (req, res) => {
  try {
    // Validate ID parameter
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
      console.error("Error: Missing or invalid ID parameter");
      return res.status(400).json({ 
        success: false,
        message: 'Order ID is required',
        receivedId: id
      });
    }

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      console.error("Error: Invalid request body");
      return res.status(400).json({ 
        success: false,
        message: 'Request body must be a valid JSON object'
      });
    }

    const { status } = req.body;
    
    // Validate status field
    const allowedStatuses = ['pending', 'expired', 'delivered', 'canceled', 'confirmed'];
    if (!status || !allowedStatuses.includes(status)) {
      console.error("Error: Invalid status value");
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status value',
        allowedStatuses,
        receivedStatus: status
      });
    }

    // Check if order exists first (better error message than findByIdAndUpdate)
    const existingOrder = await Order.findById(id).lean();
    if (!existingOrder) {
      console.error("Error: Order not found");
      return res.status(404).json({ 
        success: false,
        message: 'Order not found',
        orderId: id
      });
    }

    // Perform the update
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    // Final success response
    console.log("Successfully updated order:", updatedOrder);
    res.status(200).json({ 
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
      previousStatus: existingOrder.status
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});




router.put("/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Basic ID validation
    if (!id || id === 'undefined' || id === 'null' || !mongoose.Types.ObjectId.isValid(id)) {
      console.error("Error: Invalid order ID");
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
        receivedId: id
      });
    }

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Request body must be a valid JSON object"
      });
    }

    const { cancellationReason } = req.body;

    // Check if order exists
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        orderId: id
      });
    }

    // Prevent double cancellation
    if (existingOrder.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: "Order is already canceled",
        currentStatus: existingOrder.status
      });
    }

    // Cancel the order
    existingOrder.status = "canceled";
    existingOrder.cancellationReason = cancellationReason || "No reason provided";
    existingOrder.canceledAt = new Date();
    existingOrder.updatedAt = new Date();

    await existingOrder.save();

    // Final response
    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      order: existingOrder
    });

  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
