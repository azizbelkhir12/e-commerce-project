const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => {
      console.log("Connected to the Projet_Interne database");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB ", error);
    });
};

module.exports = connectDB;
