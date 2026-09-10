const User = require('../models/User');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Order = require('../models/Order');
const Review = require('../models/Review');

const getNotificationCounts = async (req, res) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [usersCount, productsCount, sellersCount, ordersCount, reviewsCount] = await Promise.all([
      // New users in the last 24 hours
      User.countDocuments({ createdAt: { $gte: yesterday } }),
      
      // Products pending approval
      Product.countDocuments({ approvalStatus: 'PENDING' }),
      
      // Sellers pending verification
      Seller.countDocuments({ accountStatus: 'PENDING_VERIFICATION' }),
      
      // Global orders that are just placed (PENDING/PLACED)
      Order.countDocuments({ orderStatus: 'PLACED' }),
      
      // New reviews in the last 24 hours
      Review.countDocuments({ createdAt: { $gte: yesterday } })
    ]);

    return res.status(200).json({
      users: usersCount,
      products: productsCount,
      sellers: sellersCount,
      orders: ordersCount,
      reviews: reviewsCount
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return res.status(500).json({ error: "Failed to fetch admin notifications" });
  }
};

module.exports = {
  getNotificationCounts
};
