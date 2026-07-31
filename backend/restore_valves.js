const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const restoreValves = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const parent = await Category.findOne({ name: 'Plumbing Valves' });
    if (!parent) {
      console.log('Parent not found');
      process.exit(1);
    }
    
    await Category.create({ name: 'Ball Valves', parentCategory: parent._id, level: 3 });
    await Category.create({ name: 'Gate Valves', parentCategory: parent._id, level: 3 });
    
    console.log('Restored Ball Valves and Gate Valves');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

restoreValves();
