// D:\Mani\Code with Zosh\Backup\source code\backend\src\services\UserService.js
const User = require('../models/User');
const jwtProvider = require('../utils/jwtProvider');
const UserError = require('../exceptions/UserError');

class UserService {


    async findUserProfileByJwt(jwt) {
        const email = jwtProvider.getEmailFromJwt(jwt)

        const user = await User.findOne({ email }).populate("addresses");
        if (!user) {
            throw new UserError(`User does not exist with email ${email}`);
        }
        return user;
    }

    async findUserByEmail(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new UserException(`User does not exist with email ${email}`);
        }
        return user;
    }

    async findAllUsers() {
        // Find all users and return them, excluding password
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return users;
    }

 // ✅ FIX: Use findOneAndUpdate for reliable updates
    async updateUserProfile(userId, updateData) {
        
        // ✅ Use findOneAndUpdate with new: true to return updated document
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            updateData,
            { 
                new: true,      // Return the updated document
                runValidators: true, // Run schema validators
                select: '-password' // Exclude password
            }
        );
        
        if (!updatedUser) {
            throw new UserError('User not found');
        }

        
        return updatedUser;
    }

    // ✅ FIX: Use findOneAndUpdate for profile picture
    async updateProfilePicture(userId, imageUrl) {
        
        // ✅ Use findOneAndUpdate with new: true
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { profilePicture: imageUrl },
            { 
                new: true,
                select: '-password'
            }
        );
        
        if (!updatedUser) {
            throw new UserError('User not found');
        }

        
        return updatedUser;
    }
}

module.exports = new UserService();