require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB.');
    
    await Category.collection.dropIndex('categoryId_1');
    console.log('Successfully dropped categoryId_1 index.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

dropIndex();
