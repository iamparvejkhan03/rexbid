import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: false,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    companyVATNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    referredBy: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
    },

    // User Type
    userType: {
      type: String,
      enum: ["bidder", "seller", "broker", "admin", "cashier", "staff", "company"],
      required: true,
    },

    // Additional Info
    countryCode: {
      type: String,
      required: false,
      trim: true,
    },
    countryName: {
      type: String,
      required: false,
      trim: true,
    },
    currency: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      // unique: true,
      sparse: true,
      default: null,
    },
    image: {
      type: String,
      trim: true,
    },
    address: {
      buildingNameNo: { type: String, trim: true },
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      county: { type: String, trim: true },
      state: { type: String, trim: true },
      postCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    preferences: {
      emailUpdates: { type: Boolean, default: true },
      smsUpdates: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      favoriteCategories: [{ type: String }],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    permissions: {
      type: [String],
      default: [],
      enum: [
        "view_dashboard",
        "manage_users",
        "manage_cashiers",
        "manage_auctions",
        "manage_bids",
        "manage_offers",
        "manage_transactions",
        "manage_subscriptions",
        "manage_categories",
        "manage_videos",
        "manage_inquiries",
        "manage_commissions",
        "manage_admins",
      ],
    },

    // Stripe Payment Info (For Bidders Only)
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    paymentMethodId: {
      type: String,
      sparse: true,
    },
    cardLast4: {
      type: String,
      trim: true,
    },
    cardBrand: {
      type: String,
      trim: true,
    },
    cardExpMonth: {
      type: Number,
    },
    cardExpYear: {
      type: Number,
    },

    // Payment status
    isPaymentVerified: {
      type: Boolean,
      default: false,
    },

    // Payout Methods for Sellers
    payoutMethods: {
      paypal: {
        email: {
          type: String,
          trim: true,
          lowercase: true,
          validate: {
            validator: function (email) {
              if (!email) return true; // Optional field
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Please enter a valid PayPal email address",
          },
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        addedAt: Date,
        updatedAt: Date,
      },
      payoneer: {
        email: {
          type: String,
          trim: true,
          lowercase: true,
          validate: {
            validator: function (email) {
              if (!email) return true; // Optional field
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Please enter a valid Payoneer email address",
          },
        },
        isVerified: {
          type: Boolean,
          default: true,
        },
        addedAt: Date,
        updatedAt: Date,
      },
      bankTransfer: {
        accountHolderName: {
          type: String,
          trim: true,
        },
        bankName: {
          type: String,
          trim: true,
        },
        accountNumber: {
          type: String,
          trim: true,
        },
        routingNumber: {
          type: String,
          trim: true,
        },
        iban: {
          type: String,
          trim: true,
        },
        swiftCode: {
          type: String,
          trim: true,
        },
        currency: {
          type: String,
          default: "USD",
          trim: true,
        },
        bankAddress: {
          type: String,
          trim: true,
        },
        isVerified: {
          type: Boolean,
          default: true,
        },
        addedAt: Date,
        updatedAt: Date,
      },
    },

    // Default payout method preference
    defaultPayoutMethod: {
      type: String,
      enum: ["paypal", "payoneer", "bankTransfer", null],
      default: "bankTransfer",
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false, //changed
    },
    isEmailVerified: {
      type: Boolean,
      default: false, //changed
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ID Verification Fields
    identificationDocument: {
      type: String, // Cloudinary URL
      trim: true,
    },
    identificationDocumentPublicId: {
      type: String, // Cloudinary public ID for deletion
      trim: true,
    },
    identificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
    },
    identificationVerifiedAt: {
      type: Date,
    },
    identificationRejectionReason: {
      type: String,
      trim: true,
    },
    identificationType: {
      type: String,
      enum: ["passport", "drivers_license", "national_id", "other"],
    },

    // Tokens
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Index for better query performance
userSchema.index({ userType: 1, email: 1 });

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Token generation methods
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      userType: this.userType,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

// Method to get user data without sensitive information
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordTokenExpiry;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpiry;
  return userObject;
};

const User = model("User", userSchema);

export default User;
