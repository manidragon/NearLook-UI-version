const HomeCategory = require('../models/HomeCategory');
const Deal = require('../models/Deal');
const cloudinary = require('cloudinary').v2;

class HomeCategoryService {
 
    // Create a single home category
    async createHomeCategory(homeCategory) {
        return await HomeCategory.create(homeCategory);
    }

    // Create multiple home categories or return existing ones
    async createCategories(homeCategories) {
        const existingCategories = await HomeCategory.find();
        if (existingCategories.length === 0) {
            return await HomeCategory.insertMany(homeCategories);
        }
        return existingCategories;
    }

    // Update an existing home category
    async updateHomeCategory(category, id) {
        const existingCategory = await HomeCategory.findById(id);
        if (!existingCategory) {
            throw new Error("Category not found");
        }
        return await HomeCategory.findByIdAndUpdate(existingCategory._id, category, { new: true });
    }

    // ✅ NEW: Delete home category and related deals
    async deleteHomeCategory(id) {
        const existingCategory = await HomeCategory.findById(id);
        if (!existingCategory) {
            throw new Error("Category not found");
        }
        
        // Delete image from Cloudinary if it exists
        if (existingCategory.image && existingCategory.image.includes('cloudinary.com')) {
            try {
                const parts = existingCategory.image.split('/upload/');
                if (parts.length > 1) {
                    let path = parts[1];
                    // Remove version number (e.g. v1234567890/)
                    if (path.match(/^v\d+\//)) {
                        path = path.replace(/^v\d+\//, '');
                    }
                    // Remove file extension
                    const dotIndex = path.lastIndexOf('.');
                    if (dotIndex !== -1) {
                        path = path.substring(0, dotIndex);
                    }
                    await cloudinary.uploader.destroy(path);
                }
            } catch (err) {
                console.error("Failed to delete image from Cloudinary:", err.message);
            }
        }
        
        // Delete the category itself
        await HomeCategory.findByIdAndDelete(id);
        
        // Cascading delete: remove any deals that reference this category
        await Deal.deleteMany({ category: id });
        
        return { message: 'Category deleted successfully' };
    }

    // Get all home categories
    async getAllHomeCategories() {
        return await HomeCategory.find();
    }
}

module.exports = new HomeCategoryService();