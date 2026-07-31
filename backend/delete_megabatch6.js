const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const megaBatchDelete6 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    let deletedCount = 0;

    // Helper 1: Delete EXCEPT given parents
    const deleteExcept = async (categoryName, validParentKeywords) => {
      const categories = await Category.find({ name: new RegExp(`^${categoryName}$`, 'i'), level: 3 }).populate('parentCategory');
      console.log(`\nProcessing '${categoryName}' (Keep only under ${validParentKeywords.join(', ')})`);
      
      let foundMatchingParent = false;
      for (const cat of categories) {
        const parentName = cat.parentCategory ? cat.parentCategory.name.toLowerCase() : 'unknown';
        const shouldKeep = validParentKeywords.some(keyword => parentName.includes(keyword.toLowerCase()));
        
        if (!shouldKeep) {
          console.log(`  [-] Deleting under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
          await Category.findByIdAndDelete(cat._id);
          deletedCount++;
        } else {
          foundMatchingParent = true;
          console.log(`  [+] Keeping under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
        }
      }
    };

    // Helper 2: Delete ONLY FROM given parents
    const deleteFrom = async (categoryName, targetParentKeywords) => {
      const categories = await Category.find({ name: new RegExp(`^${categoryName}$`, 'i'), level: 3 }).populate('parentCategory');
      console.log(`\nProcessing '${categoryName}' (Remove from ${targetParentKeywords.join(', ')})`);
      
      let foundMatchingParent = false;
      for (const cat of categories) {
        const parentName = cat.parentCategory ? cat.parentCategory.name.toLowerCase() : 'unknown';
        const shouldDelete = targetParentKeywords.some(keyword => parentName.includes(keyword.toLowerCase()));
        
        if (shouldDelete) {
          console.log(`  [-] Deleting under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
          await Category.findByIdAndDelete(cat._id);
          deletedCount++;
          foundMatchingParent = true;
        } else {
          console.log(`  [+] Keeping under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
        }
      }
    };

    // Execute operations
    await deleteExcept('Safety Shoes', ['footwear']);
    await deleteFrom('Battery Chargers', ['batteries', 'charging']);

    console.log(`\nSuccessfully deleted ${deletedCount} categories in total.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

megaBatchDelete6();
