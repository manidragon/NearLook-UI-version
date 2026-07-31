const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const restoreBattery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const parent = await Category.findOne({ name: 'Batteries & Power' });
    if (parent) {
      await Category.create({ name: 'Battery Chargers', parentCategory: parent._id, level: 3 });
      console.log('Restored Battery Chargers under Batteries & Power');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};
restoreBattery();
