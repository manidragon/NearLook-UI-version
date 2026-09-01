// D:\Mani\Code with Zosh\Backup\source code\backend\src\models\Seller.js
const mongoose = require('mongoose');
const UserRoles = require('../domain/UserRole');
const AccountStatus = require('../domain/AccountStatus');

const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

// Define the Seller schema
const sellerSchema = new mongoose.Schema({
    sellerName: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }, 

  district: {
    type: String,
    enum: TN_DISTRICTS,
      default: null,
    index: true,
    trim: true
  },
location: {
  type: {
    type: String,
    enum: ['Point']
  },
  coordinates: {
    type: [Number]
  },
  address: {
    type: String,
    trim: true
  }
},
    businessDetails: {
        businessName: {
            type: String,
            required: true
        },
        businessEmail: {
            type: String,
            
        },
        businessMobile: {
            type: String,
            
        },
        businessAddress: {
            type: String,
            
        },
        logo: {  
            type: String   
        },
        banner: {
            type: String
        }
    },
    bankDetails: {
        accountNumber: {
            type: String,
            required: true
        },
        accountHolderName: {
            type: String,
            required: true
        },
        ifscCode: {
            type: String,
            required: true
        },
        upiId: {
            type: String,
            default: ""
        }
    },
    pickupAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'  
    },
    GSTIN: {
        type: String,
        required: true
    },
    minFreeDelivery: {
        type: Number,
        default: 500
    },
    PAN: {
        type: String,
        default: null
    },
    businessType: {
        type: String,
        enum: ['SOLE_PROPRIETOR', 'PARTNERSHIP', 'LLC', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED'],
        default: 'SOLE_PROPRIETOR'
    },
    incorporationDate: {
        type: Date,
        default: null
    },
    taxDocuments: [{
        documentName: String,
        documentUrl: String
    }],
    fulfillmentMode: {
        type: String,
        enum: ['SELF_SHIP', 'PLATFORM_FULFILLED', 'DROPSHIP'],
        default: 'SELF_SHIP'
    },
    handlingTime: {
        type: Number,
        default: 2
    },
    storefront: {
        description: { type: String, default: "" },
        socialLinks: {
            facebook: { type: String, default: "" },
            instagram: { type: String, default: "" },
            website: { type: String, default: "" },
            twitter: { type: String, default: "" }
        },
        themeColor: { type: String, default: "#1976d2" },
        holidayMode: { type: Boolean, default: false },
        promotions: [{ type: String }]
    },

    performanceMetrics: {
        cancellationRate: { type: Number, default: 0 },
        returnRate: { type: Number, default: 0 },
        totalOrdersFulfilled: { type: Number, default: 0 },
        dispatchSlaCompliance: { type: Number, default: 100 },
        profileViews: { type: Number, default: 0 },
        followersCount: { type: Number, default: 0 }
    },
    role: {
        type: String,
        enum: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],  // Use the USER_ROLE enum
        default: UserRoles.SELLER
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: [
            AccountStatus.PENDING_VERIFICATION, 
            AccountStatus.ACTIVE, 
            AccountStatus.SUSPENDED, 
            AccountStatus.DEACTIVATED, 
            AccountStatus.BANNED, 
            AccountStatus.CLOSED
        ],  
        default: AccountStatus.PENDING_VERIFICATION
    },
    // ✅ Ratings & Reviews
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
}, {
    timestamps: true  
});

sellerSchema.index({ district: 1 });  
sellerSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true }); 

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;