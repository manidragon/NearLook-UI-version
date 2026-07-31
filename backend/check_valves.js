const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const checkValves = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const categories = await Category.find({ name: /valves$/i });
    for (const cat of categories) {
      console.log(`Found: ${cat.name}`);
    }
    
    if (categories.length === 0) {
      console.log('No valves found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkValves();
