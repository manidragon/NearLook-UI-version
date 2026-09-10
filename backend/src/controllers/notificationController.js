const User = require('../models/User');
const Seller = require('../models/Seller');
const UserRoles = require('../domain/UserRole');

const registerToken = async (req, res) => {
    try {
        const { fcmToken, role } = req.body;
        const userId = req.user._id;

        if (!fcmToken) {
            return res.status(400).json({ message: "FCM token is required" });
        }

        let updatedUser;

        if (role === UserRoles.SELLER) {
            updatedUser = await Seller.findByIdAndUpdate(userId, { fcmToken }, { new: true });
        } else {
            updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
        }

        if (!updatedUser) {
            return res.status(404).json({ message: "User/Seller not found" });
        }

        res.status(200).json({ message: "FCM token registered successfully" });
    } catch (error) {
        console.error("Error registering FCM token:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    registerToken
};
