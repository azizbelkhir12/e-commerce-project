const express = require("express");
const { auth } = require("../middleware/auth");
const Review = require("../models/review");
const router = express.Router();

// Get all avis for a specific product
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ productId });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
// Create a new avis
router.post("/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { review, rating } = req.body;

    const newAvis = new Review({
      userId: req.user.id,
      productId: productId,
      name: req.user.username,
      review,
      rating,
    });
    await newAvis.save();
    res
      .status(201)
      .json({ message: "Avis created successfully", avis: newAvis });
  } catch (error) {
    res.status(500).json({ error: "Failed to create avis" });
  }
});

// Update an avis (Only author can update)
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { review, editedRating, rating } = req.body;
    console.log("Updating avis with ID:", id);
    console.log(review, editedRating || rating);
    const existingAvis = await Review.findById(id);
    if (!existingAvis) {
      return res.status(404).json({ error: "Avis not found" });
    }

    if (existingAvis.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You can only update your own avis" });
    }

    existingAvis.review = review;
    existingAvis.rating = editedRating || rating;
    await existingAvis.save();

    res
      .status(200)
      .json({ message: "Avis updated successfully", avis: existingAvis });
  } catch (error) {
    res.status(500).json({ error: "Failed to update avis" });
  }
});

// Delete an avis (Only author can delete)
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const existingAvis = await Review.findById(id);
    if (!existingAvis) {
      return res.status(404).json({ error: "Avis not found" });
    }

    if (existingAvis.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You can only delete your own avis" });
    }

    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: "Avis deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete avis" });
  }
});

module.exports = router;
