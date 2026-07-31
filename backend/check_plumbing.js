const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const checkPlumbingValves = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const cat = await Category.findOne({ name: 'Plumbing Valves' });
    console.log(cat);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPlumbingValves();
