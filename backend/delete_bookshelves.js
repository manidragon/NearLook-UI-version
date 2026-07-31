const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const deleteUnwantedBookshelves = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Find all Bookshelves
    const bookshelves = await Category.find({ name: 'Bookshelves', level: 3 }).populate('parentCategory');
    console.log(`Found ${bookshelves.length} 'Bookshelves' categories.`);
    
    let deletedCount = 0;
    
    for (const cat of bookshelves) {
      const parentName = cat.parentCategory ? cat.parentCategory.name : 'Unknown';
      if (parentName.toLowerCase() !== 'study room furniture') {
        console.log(`Deleting Bookshelves under parent: ${parentName} (ID: ${cat._id})`);
        await Category.findByIdAndDelete(cat._id);
        deletedCount++;
      } else {
        console.log(`Keeping Bookshelves under parent: ${parentName} (ID: ${cat._id})`);
      }
    }
    
    console.log(`Successfully deleted ${deletedCount} categories.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteUnwantedBookshelves();
