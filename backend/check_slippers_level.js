const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const checkSlippersLevel = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const slippers = await Category.find({ name: 'Slippers' });
    console.log('Slippers categories:');
    for (const c of slippers) {
      console.log(`- ID: ${c._id}, Level: ${c.level}, Parent: ${c.parentCategory}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkSlippersLevel();
