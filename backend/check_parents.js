const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const checkDuplicateParents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const books = await Category.find({ name: 'Bookshelves', level: 3 }).populate('parentCategory', 'name').lean();
    console.log('Bookshelves categories:');
    books.forEach(b => console.log(`- ${b.name} (Parent: ${b.parentCategory ? b.parentCategory.name : 'null'})`));
    
    const hoodies = await Category.find({ name: 'Hoodies', level: 3 }).populate('parentCategory', 'name').lean();
    console.log('\nHoodies categories:');
    hoodies.forEach(h => console.log(`- ${h.name} (Parent: ${h.parentCategory ? h.parentCategory.name : 'null'})`));
    
    const babycaps = await Category.find({ name: 'Baby Caps', level: 3 }).populate('parentCategory', 'name').lean();
    console.log('\nBaby Caps categories:');
    babycaps.forEach(b => console.log(`- ${b.name} (Parent: ${b.parentCategory ? b.parentCategory.name : 'null'})`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDuplicateParents();
