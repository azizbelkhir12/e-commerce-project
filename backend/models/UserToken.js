const mongoose = require("mongoose");
const { Schema } = mongoose;

const TokenSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300  //5 min
    }
});
module.exports = mongoose.model("Token", TokenSchema);
