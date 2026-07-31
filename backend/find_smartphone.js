const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const findSmartphone = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const cats = await Category.find({ name: /smartphones?/i });
    console.log(cats);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

findSmartphone();
