const mongoose = require('mongoose');

const categoryScheme = new mongoose.Schema({
    Catname: {
        type: String,
        required: 'Category Name is required'
   
}}, 
    {timestamps: true});

module.exports = mongoose.model('Category', categoryScheme);