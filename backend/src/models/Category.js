// D:\Mani\Code with Zosh\Backup\source code\backend\src\models\Category.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
    },
    parentCategory: {
        type: Schema.Types.ObjectId, 
        ref: 'Category',
        default: null, 
    },
    level: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
