const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const megaBatchDelete2 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    let deletedCount = 0;

    const deleteOperations = [
      { name: 'Shelf Brackets', parent: 'furniture accessories' },
      { name: 'Hinges', parent: 'furniture accessories' },
      { name: 'Air compressors', parent: 'power tools' },
      { name: 'files', parent: 'hand tools' },
      { name: 'Emergency LIghts', parent: 'lighting' },
      { name: 'Emergency Lights', parent: 'lighting' },
      { name: 'PVC Pipes', parent: 'plumbing' },
      { name: 'CPVC Pipes', parent: 'plumbing' },
      { name: 'UPVC Pipes', parent: 'plumbing' },
      { name: 'GI Pipes', parent: 'plumbing' },
      { name: 'Pipe Fittings', parent: 'plumbing' },
      { name: 'Ball Valves', parent: 'plumbing' },
      { name: 'Gate Valves', parent: 'plumbing' }
    ];

    for (const op of deleteOperations) {
      // Find case-insensitive by regex for name
      const nameRegex = new RegExp(`^${op.name}$`, 'i');
      const categories = await Category.find({ name: nameRegex, level: 3 }).populate('parentCategory');
      
      console.log(`\nProcessing '${op.name}' (Remove from ${op.parent})`);
      
      let foundMatchingParent = false;
      for (const cat of categories) {
        const parentName = cat.parentCategory ? cat.parentCategory.name.toLowerCase() : 'unknown';
        const shouldDelete = parentName.includes(op.parent.toLowerCase());
        
        if (shouldDelete) {
          console.log(`  [-] Deleting under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
          await Category.findByIdAndDelete(cat._id);
          deletedCount++;
          foundMatchingParent = true;
        } else {
          console.log(`  [+] Keeping under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
        }
      }
      
      if (categories.length === 0) {
        console.log(`  [!] No categories found matching name '${op.name}'`);
      } else if (!foundMatchingParent) {
        console.log(`  [!] Did not find any '${op.name}' under a parent matching '${op.parent}'`);
      }
    }

    console.log(`\nSuccessfully deleted ${deletedCount} categories in total.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

megaBatchDelete2();
