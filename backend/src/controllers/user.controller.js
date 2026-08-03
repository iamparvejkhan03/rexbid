import User from "../models/user.model.js";
import { StripeService } from "../services/stripeService.js";
import jwt from "jsonwebtoken";
import {
  newUserRegistrationEmail,
  resetPasswordEmail,
  welcomeEmail,
} from "../utils/nodemailer.js";
import crypto from "crypto";
import BidPayment from "../models/bidPayment.model.js";
import Review from "../models/review.model.js";
import Auction from "../models/auction.model.js";
import { getCachedRates } from "../routes/currency.route.js";
import {
  deleteFromCloudinary,
  uploadDocumentToCloudinary,
  uploadImageToCloudinary,
} from "../utils/cloudinary.js";
import { setTempData, getTempData, deleteTempData } from '../utils/tempCache.js';
import { v4 as uuidv4 } from 'uuid';

const convertPrice = (auction, targetCurrency, priceField) => {
  const rates = getCachedRates();
  if (!rates) return auction[priceField]; // fallback
  const base = auction.baseCurrency;
  const rate = rates[base].rates[targetCurrency];
  if (!rate) return auction[priceField];
  return auction[priceField] * rate;
};

// Helper function to generate tokens and set cookies
const generateTokensAndRespond = async (user, req, res, message) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const resetToken = user.generateResetPasswordToken();

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive data from user object
    const safeUser = user.toSafeObject();

    // await loginUser(req, res);

    // Set cookies and send response
    res
      .status(201)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60 * 1000, // 30 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .json({
        success: true,
        message,
        data: {
          user: safeUser,
          accessToken,
          refreshToken,
        },
      });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

// Registration Controller
export const registerUser = async (req, res) => {
  try {
    // ========== STEP 2: Complete registration after 3D Secure ==========
    const { registrationToken, setupIntentId } = req.body;

    if (registrationToken && setupIntentId) {
      // Retrieve cached data
      const cachedData = await getTempData(registrationToken);
      if (!cachedData) {
        return res.status(400).json({
          success: false,
          message: 'Registration session expired. Please try again.',
        });
      }

      // Verify the SetupIntent status
      const setupIntent = await StripeService.retrieveSetupIntent(setupIntentId);
      if (setupIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Payment method verification failed. Please try again.',
        });
      }

      // Retrieve the payment method to get card details
      const paymentMethod = await StripeService.retrievePaymentMethod(
        setupIntent.payment_method
      );

      // Check user doesn't already exist (defensive)
      const existingUser = await User.findOne({
        $or: [
          { email: cachedData.userData.email },
          { username: cachedData.userData.username },
        ],
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or username already exists',
        });
      }

      // Create user in database
      const user = await User.create({
        ...cachedData.userData,
        stripeCustomerId: cachedData.stripeCustomerId,
        paymentMethodId: paymentMethod.id,
        cardLast4: paymentMethod.card.last4,
        cardBrand: paymentMethod.card.brand,
        cardExpMonth: paymentMethod.card.exp_month,
        cardExpYear: paymentMethod.card.exp_year,
        isPaymentVerified: true,
      });

      // Send welcome email and notify admins
      welcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
      const adminUsers = await User.find({ userType: 'admin' });
      for (const admin of adminUsers) {
        newUserRegistrationEmail(admin.email, user).catch(err => console.error('Admin email failed:', err));
      }

      // Generate tokens and respond
      return await generateTokensAndRespond(
        user,
        req,
        res,
        'Registration successful'
      );
    }

    // ========== STEP 1: Initiate registration ==========
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      userType,
      companyName,
      companyVATNumber,
      countryCode,
      countryName,
      currency,
      phone = '',
      image = '',
      street = '',
      city = '',
      state = '',
      postCode = '',
      paymentMethodId,
    } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID is required',
      });
    }

    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedUsername = username?.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Handle ID document upload
    const identificationDocumentFile = req.file;
    let identificationDocumentUrl = null;
    let identificationDocumentPublicId = null;

    if (identificationDocumentFile) {
      const isImage = identificationDocumentFile.mimetype.startsWith('image/');
      const uploadFn = isImage
        ? uploadImageToCloudinary
        : uploadDocumentToCloudinary;

      const uploadResult = await uploadFn(
        identificationDocumentFile.buffer,
        isImage ? undefined : identificationDocumentFile.originalname,
        'identification-documents'
      );
      identificationDocumentUrl = uploadResult.secure_url;
      identificationDocumentPublicId = uploadResult.public_id;
    }

    // Create Stripe customer
    const customer = await StripeService.createCustomer(
      normalizedEmail,
      `${firstName} ${lastName}`
    );

    // Create SetupIntent (automatically attaches the payment method)
    const setupIntent = await StripeService.createSetupIntent({
      customer: customer.id,
      payment_method: paymentMethodId,
      payment_method_types: ['card'],
      usage: 'off_session',
      confirm: false, // we confirm on the frontend
    });

    // Prepare user data (without payment info yet)
    const userData = {
      firstName,
      lastName,
      username: normalizedUsername,
      email: normalizedEmail,
      companyName: companyName || '',
      companyVATNumber: companyVATNumber || '',
      password,
      userType,
      countryCode,
      countryName,
      currency,
      phone,
      image,
      isVerified: false,
      identificationDocument: identificationDocumentUrl,
      identificationDocumentPublicId,
      identificationStatus: identificationDocumentUrl ? 'pending' : undefined,
      address: {
        street,
        city,
        state,
        postCode,
        country: countryName,
      },
    };

    // If no 3D Secure required, create user immediately
    if (setupIntent.status === 'succeeded') {
      // Retrieve payment method details
      const paymentMethod = await StripeService.retrievePaymentMethod(
        setupIntent.payment_method
      );

      const user = await User.create({
        ...userData,
        stripeCustomerId: customer.id,
        paymentMethodId: paymentMethod.id,
        cardLast4: paymentMethod.card.last4,
        cardBrand: paymentMethod.card.brand,
        cardExpMonth: paymentMethod.card.exp_month,
        cardExpYear: paymentMethod.card.exp_year,
        isPaymentVerified: true,
      });

      await welcomeEmail(user);
      const admins = await User.find({ userType: 'admin' });
      for (const admin of admins) {
        await newUserRegistrationEmail(admin.email, user);
      }

      return await generateTokensAndRespond(
        user,
        req,
        res,
        'Registration successful'
      );
    }

    // 3D Secure required – cache registration data and return client secret
    const token = uuidv4();
    await setTempData(token, {
      userData,
      stripeCustomerId: customer.id,
    });

    return res.status(200).json({
      success: true,
      requiresAction: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      registrationToken: token,
      message: 'Please complete the 3D Secure authentication.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No user found",
      });
    }

    // Check if user is active
    // if (!user.isActive) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Account is deactivated",
    //   });
    // }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    // await generateTokensAndRespond(user, res, 'Login successful');
    await generateTokensAndRespond(user, req, res, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

// Logout Controller
export const logoutUser = async (req, res) => {
  try {
    const user = req.user;

    // Clear refresh token from database
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    // Clear cookies
    res.clearCookie("accessToken").clearCookie("refreshToken").json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during token refresh",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    const resetToken = await user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const emailSent = await resetPasswordEmail(user.email, url);

    if (!emailSent) {
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiry = null;
      await user.save({ validateBeforeSave: false });
      return res
        .status(500)
        .json({ success: false, message: "Could not send email" });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { newPassword } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(200)
        .json({ success: true, message: "Token is invalid or has expired" });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to get user" });
  }
};

export const getBillingInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "stripeCustomerId paymentMethodId cardLast4 cardBrand cardExpMonth cardExpYear isPaymentVerified userType"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const billingInfo = {
      stripeCustomerId: user.stripeCustomerId,
      isPaymentVerified: user.isPaymentVerified,
      userType: user.userType,
    };

    // Add card details if available
    if (user.cardLast4) {
      billingInfo.card = {
        last4: user.cardLast4,
        brand: user.cardBrand,
        expMonth: user.cardExpMonth,
        expYear: user.cardExpYear,
      };
    }

    res.status(200).json({
      success: true,
      data: billingInfo,
    });
  } catch (error) {
    console.error("Get billing info error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching billing information",
    });
  }
};

// export const updatePaymentMethod = async (req, res) => {
//     try {
//         const { paymentMethodId } = req.body;
//         const userId = req.user._id;

//         if (!paymentMethodId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Payment method ID is required'
//             });
//         }

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         if (!user.stripeCustomerId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No Stripe customer found'
//             });
//         }

//         // Verify and update card with Stripe (using the same function from registration)
//         const verificationResult = await StripeService.verifyAndSaveCard(
//             user.stripeCustomerId,
//             paymentMethodId
//         );

//         if (!verificationResult.success) {
//             throw new Error('Card verification failed');
//         }

//         const paymentMethodDetails = verificationResult.paymentMethod;

//         // Update user in database
//         user.paymentMethodId = paymentMethodDetails.id;
//         user.cardLast4 = paymentMethodDetails.last4;
//         user.cardBrand = paymentMethodDetails.brand;
//         user.cardExpMonth = paymentMethodDetails.expMonth;
//         user.cardExpYear = paymentMethodDetails.expYear;
//         user.isPaymentVerified = true;

//         await user.save();

//         const updatedCardInfo = {
//             last4: user.cardLast4,
//             brand: user.cardBrand,
//             expMonth: user.cardExpMonth,
//             expYear: user.cardExpYear
//         };

//         res.status(200).json({
//             success: true,
//             message: 'Payment method updated successfully',
//             data: {
//                 card: updatedCardInfo,
//                 isPaymentVerified: true,
//                 userType: user.userType,
//                 stripeCustomerId: user.stripeCustomerId
//             }
//         });

//     } catch (error) {
//         console.error('Update payment method error:', error);
//         res.status(400).json({
//             success: false,
//             message: error.message || 'Failed to update payment method'
//         });
//     }
// };

export const updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const userId = req.user._id;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: "No Stripe customer found",
      });
    }

    // ✅ STEP 1: Cancel ONLY pending authorizations (requires_capture) on old card
    // DO NOT cancel succeeded payments (already charged commissions)
    const pendingAuthorizations = await BidPayment.find({
      bidder: userId,
      type: "bid_authorization",
      status: "requires_capture", // ONLY this status!
    });

    console.log(
      `🔄 Cancelling ${pendingAuthorizations.length} PENDING authorizations for user ${userId}`
    );

    let cancelledCount = 0;
    for (const payment of pendingAuthorizations) {
      try {
        await StripeService.cancelPaymentIntent(payment.paymentIntentId);
        payment.status = "canceled";
        await payment.save();
        cancelledCount++;
        console.log(
          `✅ Cancelled PENDING authorization for auction: ${payment.auction}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to cancel authorization ${payment.paymentIntentId}:`,
          error.message
        );
      }
    }

    // ✅ STEP 2: Also mark any 'succeeded' bid_authorizations as 'replaced'
    // These are the old $2500 authorizations that were replaced by final commissions
    const succeededAuthorizations = await BidPayment.find({
      bidder: userId,
      type: "bid_authorization",
      status: "succeeded",
    });

    for (const payment of succeededAuthorizations) {
      payment.status = "replaced"; // Mark as replaced for clarity
      await payment.save();
      console.log(
        `📝 Marked succeeded authorization as replaced for auction: ${payment.auction}`
      );
    }

    // ✅ STEP 3: Verify and update card with Stripe
    const verificationResult = await StripeService.verifyAndSaveCard(
      user.stripeCustomerId,
      paymentMethodId
    );

    if (!verificationResult.success) {
      throw new Error("Card verification failed");
    }

    const paymentMethodDetails = verificationResult.paymentMethod;

    // ✅ STEP 4: Update user in database
    user.paymentMethodId = paymentMethodDetails.id;
    user.cardLast4 = paymentMethodDetails.last4;
    user.cardBrand = paymentMethodDetails.brand;
    user.cardExpMonth = paymentMethodDetails.expMonth;
    user.cardExpYear = paymentMethodDetails.expYear;
    user.isPaymentVerified = true;

    await user.save();

    const updatedCardInfo = {
      last4: user.cardLast4,
      brand: user.cardBrand,
      expMonth: user.cardExpMonth,
      expYear: user.cardExpYear,
    };

    res.status(200).json({
      success: true,
      message: `Payment method updated successfully. ${cancelledCount} pending authorizations cancelled.`,
      data: {
        card: updatedCardInfo,
        isPaymentVerified: true,
        userType: user.userType,
        stripeCustomerId: user.stripeCustomerId,
        cancelledAuthorizations: cancelledCount,
      },
    });
  } catch (error) {
    console.error("Update payment method error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update payment method",
    });
  }
};

/**
 * Get seller stats for a user (items sold, average rating, total reviews)
 */
export const getSellerStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const userCurrency = req.query.currency || 'EUR';

    const user = await User.findById(userId).select("username companyName firstName lastName countryName isVerified identificationStatus image email phone currency");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Count sold items (auctions where user is seller and status is 'sold')
    const itemsSold = await Auction.countDocuments({
      seller: userId,
      status: "sold",
    });

    const itemsAdded = await Auction.countDocuments({ seller: userId });

    // Get reviews where user is the reviewee (ratings received)
    const reviews = await Review.find({ reviewee: userId });
    const totalReviews = reviews.length;
    const sellerImage = user?.image;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Calculate percentage (e.g., positive experience – optional, you can compute as (averageRating / 5) * 100)
    const positivePercentage = averageRating > 0 ? (averageRating / 5) * 100 : 0;

    // Determine verified status: user.isVerified or identificationStatus === 'verified'
    const isVerified = user.isVerified || user.identificationStatus === "verified";

    // Optional: Calculate total revenue from sold auctions (converted to user's currency)
    let totalRevenueConverted = 0;
    let averageSalePriceConverted = 0;

    if (itemsSold > 0) {
      const soldAuctions = await Auction.find({
        seller: userId,
        status: "sold"
      }).select("finalPrice baseCurrency currentPrice");

      for (const auction of soldAuctions) {
        const finalPrice = auction.finalPrice || auction.currentPrice;
        if (finalPrice) {
          const convertedPrice = convertPrice(auction, userCurrency, 'finalPrice') || convertPrice(auction, userCurrency, 'currentPrice');
          totalRevenueConverted += convertedPrice || 0;
        }
      }
      averageSalePriceConverted = totalRevenueConverted / itemsSold;
    }

    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        companyName: user.companyName,
        email: user?.email,
        phone: user?.phone,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        country: user.countryName || "Not specified",
        currency: user?.currency || userCurrency,
        displayCurrency: userCurrency,
        isVerified,
        itemsSold,
        itemsAdded,
        sellerImage,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalReviews,
        positivePercentage: parseFloat(positivePercentage.toFixed(2)),
        // Optional revenue stats (converted)
        totalRevenue: parseFloat(totalRevenueConverted.toFixed(2)),
        averageSalePrice: parseFloat(averageSalePriceConverted.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Get seller stats error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Upload identification document
export const uploadIdentification = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPG, PNG, and PDF are allowed",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user can upload (only if rejected or not verified)
    if (user.identificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Your identity is already verified",
      });
    }

    // If user had previous document, delete it from Cloudinary
    if (user.identificationDocumentPublicId) {
      try {
        await deleteFromCloudinary(user.identificationDocumentPublicId, "raw");
      } catch (deleteError) {
        console.error("Failed to delete old document:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Upload new document to Cloudinary
    const isImage = file.mimetype.startsWith("image/");
    let uploadResult;

    if (isImage) {
      uploadResult = await uploadImageToCloudinary(
        file.buffer,
        "identification-documents",
      );
    } else {
      uploadResult = await uploadDocumentToCloudinary(
        file.buffer,
        file.originalname,
        "identification-documents",
      );
    }

    // Update user with new document info
    user.identificationDocument = uploadResult.secure_url;
    user.identificationDocumentPublicId = uploadResult.public_id;
    user.identificationStatus = "pending";
    user.identificationRejectionReason = null; // Clear any previous rejection reason
    user.identificationVerifiedAt = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Identification document uploaded successfully",
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    console.error("Upload identification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload identification document",
    });
  }
};

// Get user's verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "identificationDocument identificationStatus identificationVerifiedAt identificationRejectionReason",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: user.identificationStatus || "not_uploaded",
        documentUrl: user.identificationDocument,
        verifiedAt: user.identificationVerifiedAt,
        rejectionReason: user.identificationRejectionReason,
      },
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verification status",
    });
  }
};

// Delete identification document
export const deleteIdentification = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only allow deletion if status is rejected or pending
    if (user.identificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete verified document",
      });
    }

    // Delete from Cloudinary
    if (user.identificationDocumentPublicId) {
      try {
        await deleteFromCloudinary(user.identificationDocumentPublicId, "raw");
      } catch (deleteError) {
        console.error("Failed to delete from Cloudinary:", deleteError);
      }
    }

    // Clear document fields
    user.identificationDocument = null;
    user.identificationDocumentPublicId = null;
    user.identificationStatus = null;
    user.identificationRejectionReason = null;
    user.identificationVerifiedAt = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Identification document deleted successfully",
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    console.error("Delete identification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete identification document",
    });
  }
};