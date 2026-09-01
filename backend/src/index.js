require('dotenv').config();

const express = require('express');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const enquiryRoutes = require("./routers/enquiryRoutes");
const initDbCleanup = require('./cron/dbCleanup');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

// Setup Socket.io
io.on('connection', (socket) => {

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      const Chat = require('./models/Chat');
      
      const newMessage = await Message.create({
        chat: data.chatId,
        senderType: data.senderType,
        senderId: data.senderId,
        content: data.content
      });

      await Chat.findByIdAndUpdate(data.chatId, { lastMessage: newMessage._id });

      io.to(data.chatId).emit('receive_message', newMessage);
    } catch (error) {
      console.error("Socket send_message error:", error);
    }
  });

  socket.on('mark_seen', async (data) => {
    try {
      const Message = require('./models/Message');
      await Message.updateMany(
        { chat: data.chatId, senderType: { $ne: data.readerType }, isRead: false },
        { $set: { isRead: true } }
      );
      io.to(data.chatId).emit('messages_seen', { chatId: data.chatId, readerType: data.readerType });
    } catch (error) {
      console.error("Socket mark_seen error:", error);
    }
  });

  socket.on('disconnect', () => {
  });
});

app.use(cors({
  origin: [
    'https://nearlook.in',
    'https://www.nearlook.in',
    'http://localhost:5173', // For local development
    'http://localhost:3000'
  ],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log('-------------------------------------------');
  next();
});
const productRouters = require("./routers/productRoutes.js");
const authRouters = require("./routers/authRouters.js");
const adminRouters = require("./routers/adminRouters.js");
const cartRouters = require("./routers/cartRoutes.js");
const revenueRouters = require("./routers/revenueRoutes.js");
const sellerOrderRouters = require("./routers/sellerOrderRoutes.js");
const sellerProductRouters = require("./routers/sellerProductRoutes.js");
const sellerReportRouters = require("./routers/sellerReportRoutes.js");
const sellerRouters = require("./routers/sellerRoutes.js");
const transactionRouters = require("./routers/transactionRoutes.js");
const userRouters = require("./routers/userRoutes.js");
const wishlistRouters = require("./routers/wishlistRoutes.js");
const orderRouters = require("./routers/orderRoutes.js");
const paymentRoutres = require("./routers/paymentRoutes.js");
const dealRoutres = require("./routers/dealRoutes.js");
const couponRouters = require("./routers/couponRoutes.js");
const homeRouters = require("./routers/homeCategoryRoutes.js");
const chatboatRouters = require("./routers/chatboatRoutes.js");
const reviewRouters = require("./routers/reviewRouters.js");
const addressRoutes = require('./routers/addressRoutes');
const categoryRouters = require("./routers/categoryRoutes");
const categoryAttributeRoutes = require('./routers/categoryAttributeRoutes');
const catalogRoutes = require('./routers/catalogRoutes');
const returnRoutes = require('./routers/returnRoutes.js');
const walletRoutes = require('./routers/walletRoutes.js');
const webhookRoutes = require('./routers/webhookRoutes.js');
const sellerReviewRoutes = require("./routers/sellerReviewRoutes");
const chatRoutes = require("./routers/chatRoutes.js");
const adminPayoutRoutes = require('./routers/adminPayoutRoutes.js');

app.use("/api/chats", chatRoutes);
app.use(
  "/api/seller-review",
  sellerReviewRoutes
);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/admin/categories', categoryAttributeRoutes);
app.use('/api/categories', categoryRouters);
app.use('/api/addresses', addressRoutes);

app.use('/auth', authRouters);
app.use("/api/users", userRouters);
app.use("/sellers", sellerRouters);
app.use("/products", productRouters);
app.use("/api/sellers/product", sellerProductRouters);
app.use("/api/cart", cartRouters);
app.use("/api/orders", orderRouters);
app.use("/api/seller/orders", sellerOrderRouters);
app.use("/api/transactions", transactionRouters);
app.use("/api/wishlist", wishlistRouters);
app.use("/api/sellers/report", sellerReportRouters);

app.use("/api/payment", paymentRoutres);
app.use("/home", homeRouters);
app.use("/api/deals", dealRoutres);
app.use("/admin", adminRouters);
app.use("/api/admin/payouts", adminPayoutRoutes);

app.use("/api/coupons", couponRouters);
app.use("/api/sellers/revenue", revenueRouters);

app.use("/api/reviews", reviewRouters);

// chatbot
app.use("/chat", chatboatRouters);

// enquiry routes
app.use("/api/enquiries", enquiryRoutes);

const port = process.env.PORT || 8080;

console.clear();

server.listen(port, async () => {
    try {
        console.log(`🚀 Server is running on port: ${port}`);
        await connectDB();
        // Start Cron Jobs
        initDbCleanup();
        require('./cron/payoutCron.js');
    } catch (error) {
        console.error("Database connection failed:", error);
    }
});