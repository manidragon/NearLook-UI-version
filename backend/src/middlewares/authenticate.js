const jwtProvider = require("../utils/jwtProvider");
const User = require("../models/User");
const Seller = require("../models/Seller");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header is missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "JWT Token is missing" });
    }

    let email;
    try {
      email = jwtProvider.getEmailFromJwt(token);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check user first
    let user = await User.findOne({ email });
    if (user) {
        req.user = user;
        return next();
    }

    // Check seller
    let seller = await Seller.findOne({ email });
    if (seller) {
        // notificationController expects req.user._id
        req.user = seller;
        return next();
    }

    return res.status(404).json({ message: "User/Seller not found with email " + email });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { authenticate };
