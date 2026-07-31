const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const checkStructure = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const menCats = await Category.find({ name: 'Men' });
    console.log('Men categories:');
    for (const c of menCats) {
      console.log(`- ID: ${c._id}, Level: ${c.level}, Parent: ${c.parentCategory}`);
    }
    
    const fashionCats = await Category.find({ name: 'Fashion' });
    console.log('\nFashion categories:');
    for (const c of fashionCats) {
      console.log(`- ID: ${c._id}, Level: ${c.level}, Parent: ${c.parentCategory}`);
    }
    
    const footwearCats = await Category.find({ name: 'Footwear' });
    console.log('\nFootwear categories:');
    for (const c of footwearCats) {
      console.log(`- ID: ${c._id}, Level: ${c.level}, Parent: ${c.parentCategory}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkStructure();
