const Enquiry = require("../models/Enquiry");

exports.createEnquiry = async (req, res) => {
  try {
    const {
      sellerId,
      name,
      email,
      subject,
      message,
    } = req.body;

    const enquiry = await Enquiry.create({
      seller: sellerId,
      name,
      email,
      subject,
      message,
    });

    res.status(201).json(enquiry);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSellerEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      seller: req.seller._id,
    }).sort({ createdAt: -1 });

    // Mark all 'NEW' enquiries as 'READ' now that the seller has viewed them
    await Enquiry.updateMany(
      { seller: req.seller._id, status: "NEW" },
      { $set: { status: "READ" } }
    );

    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};