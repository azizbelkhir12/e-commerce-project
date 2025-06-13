const mongoose = require('mongoose');
const { type } = require('os');

const paimentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    transaction_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled'],
        default: 'pending'
    },
}, {timestamps: true});

module.exports = mongoose.model('Paiment', paimentSchema);