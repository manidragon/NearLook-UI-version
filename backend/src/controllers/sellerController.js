// D:\Mani\Code with Zosh\Backup\source code\backend\src\controllers\sellerController.js
const UserRoles = require("../domain/UserRole");
const SellerError = require("../exceptions/SellerError");
const Seller = require("../models/Seller");
const VerificationCode = require("../models/VerificationCode");
const SellerService = require("../services/SellerService");
const VerificationService = require("../services/VerificationService");
const generateOTP = require("../utils/generateOtp");
const jwtProvider = require("../utils/jwtProvider");
const { sendVerificationEmail } = require("../utils/sendEmail");

class SellerController {
  async getSellerProfile(req, res) {
    try {
      const jwt = req.headers.authorization.split(" ")[1];
      const seller = await SellerService.getSellerProfile(jwt);

      // ✅ Dynamic Metrics Calculation
      const SellerReview = require("../models/SellerReview");
      const Order = require("../models/Order");

      // 1. Reviews & Ratings
      const reviews = await SellerReview.find({ seller: seller._id });
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews) 
        : 0;

      // 2. Cancellation Rate & SLA Compliance
      const allOrders = await Order.find({ seller: seller._id });
      const totalOrders = allOrders.length;
      const canceledOrders = allOrders.filter(o => o.orderStatus === 'CANCELLED').length;
      
      const cancellationRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;

      // Simple SLA: Assume orders older than handling time that aren't shipped/delivered/cancelled have breached SLA
      const now = new Date();
      const slaBreachedOrders = allOrders.filter(o => {
        if (o.orderStatus === 'DELIVERED' || o.orderStatus === 'SHIPPED' || o.orderStatus === 'CANCELLED') return false;
        const diffTime = Math.abs(now - new Date(o.orderDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > (seller.handlingTime || 2);
      }).length;
      
      const slaCompliance = totalOrders > 0 
        ? (((totalOrders - slaBreachedOrders) / totalOrders) * 100) 
        : 100;

      // Attach dynamic metrics to response
      const sellerObj = seller.toObject ? seller.toObject() : { ...seller };
      sellerObj.totalReviews = totalReviews;
      sellerObj.averageRating = Math.round(averageRating * 10) / 10;
      
      if (!sellerObj.performanceMetrics) sellerObj.performanceMetrics = {};
      sellerObj.performanceMetrics.cancellationRate = Math.round(cancellationRate * 10) / 10;
      sellerObj.performanceMetrics.dispatchSlaCompliance = Math.round(slaCompliance * 10) / 10;

      res.status(200).json(sellerObj);
    } catch (err) {
      res
        .status(err instanceof SellerError ? 404 : 500)
        .json({ message: err.message });
    }
  }

  // ✅ NEW: GET SELLER ANALYTICS
  async getAnalytics(req, res) {
    try {
      const jwt = req.headers.authorization?.split(" ")[1];
      if (!jwt) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const seller = await SellerService.getSellerProfile(jwt);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const Transaction = require("../models/Transaction");
      const TransactionService = require("../services/TransactionService");

      // 1. Calculate actual lifetime totals from DB
      // We will use the exact same TransactionService method that powers the Transactions page
      const earningsSummary = await TransactionService.getSellerEarningsSummary(seller._id, null, null);

      const totalOrders = earningsSummary.transactionCount;
      const totalRevenue = earningsSummary.netAfterReturns;
      
      const totalViews = seller.performanceMetrics?.profileViews || 0;
      const totalFollowers = seller.performanceMetrics?.followersCount || 0;

      // Also get all completed transactions for the timeline chart
      const allTransactions = await Transaction.find({ 
        seller: seller._id,
        paymentStatus: 'COMPLETED'
      });

      // 2. Generate Real 30-Day Time Series Data
      const timeSeriesData = [];
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      // Filter transactions from the last 30 days
      const recentTransactions = allTransactions.filter(txn => {
        const txnDate = new Date(txn.date || txn.createdAt);
        return txnDate >= thirtyDaysAgo && txnDate <= now;
      });

      // Group transactions by date (YYYY-MM-DD)
      const transactionsByDate = {};
      recentTransactions.forEach(txn => {
        const dateStr = new Date(txn.date || txn.createdAt).toISOString().split('T')[0];
        if (!transactionsByDate[dateStr]) {
          transactionsByDate[dateStr] = { revenue: 0, count: 0 };
        }
        transactionsByDate[dateStr].revenue += (txn.netAmount || txn.amount || 0);
        transactionsByDate[dateStr].count += 1;
      });

      // Distribute views and followers evenly across 30 days (since we don't track historical dates for them)
      const dailyViews = Math.round(totalViews / 30);
      const dailyFollowers = Math.round(totalFollowers / 30);

      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayStats = transactionsByDate[dateStr] || { revenue: 0, count: 0 };

        timeSeriesData.push({
          date: dateStr,
          views: dailyViews,
          followers: dailyFollowers,
          revenue: dayStats.revenue
        });
      }

      res.status(200).json({
        summary: {
          totalViews,
          totalFollowers,
          totalOrders,
          totalRevenue
        },
        timeSeries: timeSeriesData
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async createSeller(req, res) {
    try {
      const { email, otp, ...sellerData } = req.body;

      // 🔑 Verify OTP FIRST (mandatory)
      const verificationCode = await VerificationService.getVerificationCodeByEmail(email);
      if (!verificationCode || verificationCode.otp !== otp) {
        throw new SellerError("Invalid or expired OTP");
      }

      // Check if seller already exists
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        await VerificationService.deleteVerificationCode(verificationCode._id);
        throw new SellerError("Seller already exists with this email");
      }

      // 🔑 Delete used OTP
      await VerificationService.deleteVerificationCode(verificationCode._id);

      const newSeller = await SellerService.createSeller({
        email,
        ...sellerData
      });

      return res.status(201).json({
        message: "Seller registration successful. Your application is pending admin approval.",
        seller: {
          _id: newSeller._id,
          email: newSeller.email,
          sellerName: newSeller.sellerName,
          accountStatus: newSeller.accountStatus
        }
      });

    } catch (err) {
      res
        .status(err instanceof SellerError ? 400 : 500)
        .json({ error: err.message });
    }
  }

  async getSellerById(req, res) {
    try {
      const seller = await SellerService.getSellerById(req.params.id);
      res.status(200).json(seller);
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(400).json({ message: "Invalid Seller ID format" });
      }
      res
        .status(err instanceof SellerError ? 404 : 500)
        .json({ message: err.message });
    }
  }

  // ✅ UPDATED: now returns totalReviews + averageRating per product
  async getSellerProductsById(req, res) {
    try {
      const Product = require("../models/Product");
      const Review = require("../models/Review");

      const sellerId = req.params.id;

      // Fetch all active products that have at least one offer from this seller
      const products = await Product.find({
        "variants.offers.seller": sellerId,
        isActive: true
      }).lean();

      // For each product, count reviews and compute average rating
      const productsWithReviews = await Promise.all(
        products.map(async (product) => {
          const reviews = await Review.find(
            { product: product._id },
            { rating: 1 }   // only fetch rating field — faster
          ).lean();

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                totalReviews
              : 0;

          return { ...product, totalReviews, averageRating };
        })
      );

      res.status(200).json(productsWithReviews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllSellers(req, res) {
    try {
      const { status } = req.query;
      const sellers = await SellerService.getAllSellers(status);
      res.status(200).json(sellers);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateSeller(req, res) {
    try {
      const seller = await req.seller;
      const updatedSeller = await SellerService.updateSeller(
        seller,
        req.body
      );
      res.status(200).json(updatedSeller);
    } catch (err) {
      res
        .status(err instanceof SellerError ? 404 : 500)
        .json({ message: err.message });
    }
  }

  async deleteSeller(req, res) {
    try {
      await SellerService.deleteSeller(req.params.id);
      res.status(204).send();
    } catch (err) {
      res
        .status(err instanceof SellerError ? 404 : 500)
        .json({ message: err.message });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;
      const seller = await SellerService.verifyEmail(email, otp);
      res.status(200).json(seller);
    } catch (err) {
      res
        .status(err instanceof SellerError ? 404 : 500)
        .json({ message: err.message });
    }
  }

  async updateSellerAccountStatus(req, res) {
    try {
      const updatedSeller = await SellerService.updateSellerAccountStatus(
        req.params.id,
        req.params.status
      );
      res.status(200).json(updatedSeller);
    } catch (err) {
      res
        .status(err instanceof SellerError ? 404 : 500)
        .json({ message: err.message });
    }
  }

  async sendLoginOtp(req, res) {
    try {
      const { email } = req.body;
      const otp = generateOTP();
      await VerificationService.createVerificationCode(otp, email);
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async verifyLoginOtp(req, res) {
    try {
      const { otp, email } = req.body;

      const seller = await Seller.findOne({ email });
      if (!seller) {
        throw new SellerError("Invalid email or password");
      }

      if (seller.accountStatus !== "ACTIVE") {
        let message = "Your account is not active.";
        if (seller.accountStatus === "PENDING_VERIFICATION") {
          message = "Your application is still pending. Please wait for admin approval.";
        } else if (seller.accountStatus === "SUSPENDED") {
          message = "Your account has been suspended. Please contact support.";
        } else if (seller.accountStatus === "BANNED") {
          message = "Your account has been banned.";
        } else if (seller.accountStatus === "DEACTIVATED") {
          message = "Your account has been deactivated.";
        } else if (seller.accountStatus === "CLOSED") {
          message = "Your account has been closed.";
        }
        throw new SellerError(message);
      }

      const verificationCode = await VerificationCode.findOne({ email });
      if (!verificationCode || verificationCode.otp !== otp) {
        throw new Error("Invalid OTP");
      }

      await VerificationCode.deleteOne({ _id: verificationCode._id });

      const token = jwtProvider.createJwt({
        email: seller.email,
        id: seller._id,
        role: seller.role
      });

      return res.status(200).json({
        message: "Login Success",
        jwt: token,
        role: seller.role,
        accountStatus: seller.accountStatus
      });

    } catch (err) {
      res
        .status(err instanceof SellerError ? 403 : 400)
        .json({ message: err.message });
    }
  }

  async incrementProfileViews(req, res) {
    try {
      const seller = await Seller.findByIdAndUpdate(
        req.params.id,
        { $inc: { "performanceMetrics.profileViews": 1 } },
        { new: true }
      );
      if (!seller) return res.status(404).json({ message: "Seller not found" });
      res.status(200).json({ views: seller.performanceMetrics.profileViews });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async toggleFollowSeller(req, res) {
    try {
      const { action } = req.body; // "follow" or "unfollow"
      const sellerId = req.params.id;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized. Please login to follow sellers." });
      }

      const User = require("../models/User"); // Import here to avoid circular dep if any

      // Check if already following to prevent duplicate counts
      const isFollowing = user.followedSellers && user.followedSellers.includes(sellerId);
      
      if (action === "follow" && isFollowing) {
        const seller = await Seller.findById(sellerId);
        return res.status(200).json({ followers: seller?.performanceMetrics?.followersCount || 0 });
      }
      if (action === "unfollow" && !isFollowing) {
        const seller = await Seller.findById(sellerId);
        return res.status(200).json({ followers: seller?.performanceMetrics?.followersCount || 0 });
      }

      const increment = action === "follow" ? 1 : -1;
      
      // Update User
      if (action === "follow") {
        await User.findByIdAndUpdate(user._id, { $addToSet: { followedSellers: sellerId } }, { new: true });
        user.followedSellers.push(sellerId); // Update local object memory just in case
      } else {
        await User.findByIdAndUpdate(user._id, { $pull: { followedSellers: sellerId } }, { new: true });
      }

      // Update Seller
      const seller = await Seller.findByIdAndUpdate(
        sellerId,
        { $inc: { "performanceMetrics.followersCount": increment } },
        { new: true }
      );

      if (!seller) return res.status(404).json({ message: "Seller not found" });
      res.status(200).json({ followers: seller.performanceMetrics.followersCount });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SellerController();