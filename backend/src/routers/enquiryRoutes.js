const express = require("express");
const router = express.Router();

const enquiryController =
  require("../controllers/enquiryController");

const sellerAuthMiddleware = require("../middlewares/sellerAuthMiddleware");

router.post(
  "/create",
  enquiryController.createEnquiry
);

router.get(
  "/seller",
  sellerAuthMiddleware,
  enquiryController.getSellerEnquiries
);

module.exports = router;