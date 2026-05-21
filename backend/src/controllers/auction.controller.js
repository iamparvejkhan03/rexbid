import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import {
  uploadImageToCloudinary,
  uploadDocumentToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import agendaService from "../services/agendaService.js";
import {
  auctionSubmittedForApprovalEmail,
  auctionWonAdminEmail,
  bidConfirmationEmail,
  newBidNotificationEmail,
  outbidNotificationEmail,
  sendAuctionEndedSellerEmail,
  sendAuctionWonEmail,
  sendOutbidNotifications,
} from "../utils/nodemailer.js";
import Category from "../models/category.model.js";
import Commission from "../models/commission.model.js";

// Create New Auction
export const createAuction = async (req, res) => {
  try {
    const seller = req.user;

    const {
      title,
      subTitle,
      features,
      description,
      specifications,
      location,
      videoLink,
      startPrice,
      bidIncrement,
      auctionType,
      reservePrice,
      buyNowPrice,
      allowOffers,
      startDate,
      endDate,
    } = req.body;

    let categoriesArray = [];
    if (req.body.categories) {
      try {
        // Try to parse it as JSON first (since you're sending JSON.stringify from frontend)
        const parsed = JSON.parse(req.body.categories);
        // If parsed is an array, use it directly
        if (Array.isArray(parsed)) {
          categoriesArray = parsed;
        } else {
          categoriesArray = [parsed];
        }
      } catch (e) {
        // If it's not JSON, handle as regular string or array
        if (Array.isArray(req.body.categories)) {
          categoriesArray = req.body.categories;
        } else if (typeof req.body.categories === "string") {
          // Split by comma if it's a comma-separated string, otherwise single item
          categoriesArray = req.body.categories.includes(",")
            ? req.body.categories.split(",").map((c) => c.trim())
            : [req.body.categories];
        }
      }
    }

    // Validation
    if (!categoriesArray || categoriesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one category is required",
      });
    }

    // Basic validation
    if (!title || !description || !auctionType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate start price for all auction types
    if (!startPrice || parseFloat(startPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Start price is required and must be positive",
      });
    }

    // Validate bid increment for standard and reserve auctions
    if (
      (auctionType === "standard" || auctionType === "reserve") &&
      (!bidIncrement || parseFloat(bidIncrement) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Bid increment is required for standard and reserve auctions",
      });
    }

    // Parse specifications from JSON string to object
    let parsedSpecifications = {};
    if (specifications) {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (parseError) {
        console.error("Error parsing specifications:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        });
      }
    }

    // Validate reserve price for reserve auctions
    if (auctionType === "reserve") {
      if (!reservePrice || parseFloat(reservePrice) < parseFloat(startPrice)) {
        return res.status(400).json({
          success: false,
          message:
            "Reserve price must be provided and greater than or equal to start price",
        });
      }
    }

    // Validate buy now price for buy_now auctions
    if (auctionType === "buy_now") {
      if (!buyNowPrice || parseFloat(buyNowPrice) < parseFloat(startPrice)) {
        return res.status(400).json({
          success: false,
          message:
            "Buy Now price must be provided and greater than or equal to start price",
        });
      }
    }

    // Handle file uploads
    let uploadedPhotos = [];
    let uploadedDocuments = [];
    let uploadedServiceRecords = [];

    // Upload photos
    if (req.files && req.files.photos) {
      const photos = Array.isArray(req.files.photos)
        ? req.files.photos
        : [req.files.photos];

      // Get captions from request body
      // const photoCaptions = req.body.photoCaptions || [];
      const photoCaptions = Array.isArray(req.body.photoCaptions)
        ? req.body.photoCaptions
        : [];

      for (const [index, photo] of photos.entries()) {
        try {
          const result = await uploadImageToCloudinary(
            photo.buffer,
            "auction-photos",
          );
          uploadedPhotos.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: photo.originalname,
            order: index,
            caption: photoCaptions[index] || "", // ADD THIS LINE
          });
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: `Failed to upload photo: ${photo.originalname}`,
          });
        }
      }
    }

    // For documents:
    if (req.files && req.files.documents) {
      const documents = Array.isArray(req.files.documents)
        ? req.files.documents
        : [req.files.documents];

      // Get document captions
      // const documentCaptions = req.body.documentCaptions || [];
      const newDocumentCaptions = Array.isArray(req.body.newDocumentCaptions)
        ? req.body.newDocumentCaptions
        : [];

      for (const [index, doc] of documents.entries()) {
        try {
          const result = await uploadDocumentToCloudinary(
            doc.buffer,
            doc.originalname,
            "auction-documents",
          );
          uploadedDocuments.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: doc.originalname,
            originalName: doc.originalname,
            resourceType: "raw",
            caption: documentCaptions[index] || "", // ADD THIS
          });
        } catch (uploadError) {
          console.error("Document upload error:", uploadError);
        }
      }
    }

    // For service records:
    if (req.files && req.files.serviceRecords) {
      const serviceRecords = Array.isArray(req.files.serviceRecords)
        ? req.files.serviceRecords
        : [req.files.serviceRecords];

      // Get service record captions
      // const serviceRecordCaptions = req.body.serviceRecordCaptions || [];
      const serviceRecordCaptions = Array.isArray(
        req.body.serviceRecordCaptions,
      )
        ? req.body.serviceRecordCaptions
        : [];

      for (const [index, record] of serviceRecords.entries()) {
        try {
          const result = await uploadImageToCloudinary(
            record.buffer,
            "auction-service-records",
          );
          uploadedServiceRecords.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: record.originalname,
            originalName: record.originalname,
            order: index,
            caption: serviceRecordCaptions[index] || "", // ADD THIS
          });
        } catch (uploadError) {
          console.error("Service record upload error:", uploadError);
        }
      }
    }
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create auction data object
    const auctionData = {
      title,
      subTitle: subTitle || "",
      categories: categoriesArray,
      features: features || "",
      description,
      specifications: new Map(Object.entries(parsedSpecifications)),
      location: location || "",
      videoLink: videoLink || "",
      startPrice: parseFloat(startPrice),
      startDate: start,
      endDate: end,
      auctionType,
      allowOffers: allowOffers === "true" || allowOffers === true,
      seller: seller._id,
      sellerUsername: seller.username,
      photos: uploadedPhotos,
      documents: uploadedDocuments,
      serviceRecords: uploadedServiceRecords,
      status:
        auctionType === "buy_now" || auctionType === "giveaway"
          ? "active"
          : "draft",
    };

    // Add bid increment for standard and reserve auctions
    if (auctionType === "standard" || auctionType === "reserve") {
      auctionData.bidIncrement = parseFloat(bidIncrement);
    }

    // Add reserve price for reserve auctions
    if (auctionType === "reserve") {
      auctionData.reservePrice = parseFloat(reservePrice);
    }

    // Add buy now price for buy_now auctions
    if (auctionType === "buy_now") {
      auctionData.buyNowPrice = parseFloat(buyNowPrice);
    }

    // Add optional bid increment for buy_now auctions if provided
    if (
      auctionType === "buy_now" &&
      bidIncrement &&
      parseFloat(bidIncrement) > 0
    ) {
      auctionData.bidIncrement = parseFloat(bidIncrement);
    }

    const auction = await Auction.create(auctionData);

    // Schedule activation job (always needed for all types)
    await agendaService.scheduleAuctionActivation(
      auction._id,
      auction.startDate,
    );

    // Only schedule end job for timed auctions (standard/reserve)
    if (
      auction.auctionType === "standard" ||
      auction.auctionType === "reserve"
    ) {
      await agendaService.scheduleAuctionEnd(auction._id, auction.endDate);
    }

    // Populate seller info for response
    await auction.populate("seller", "username firstName lastName");

    res.status(201).json({
      success: true,
      message: "Auction created successfully",
      data: {
        auction,
      },
    });

    // Notify admins if needed
    const adminUsers = await User.find({ userType: "admin" });
    for (const admin of adminUsers) {
      await auctionSubmittedForApprovalEmail(
        admin.email,
        auction,
        auction.seller,
      );
    }
  } catch (error) {
    console.error("Create auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating auction",
    });
  }
};

export const getAuctions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category, // OLD - keep for backward compatibility
      categories, // NEW - array of categories
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      // Car filters
      make,
      model,
      yearMin,
      yearMax,
      transmission,
      fuelType,
      condition,
      // Auction filters
      auctionType,
      allowOffers,
      // Price filters
      priceMin,
      priceMax,
      location,
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter
    if (status && status !== "any") {
      filter.status = status;
    } else {
      filter.status = { $ne: "draft" };
    }

    // ========== CATEGORY FILTERING - UPDATED ==========
    // Handle both single category (for backward compatibility) and multiple categories
    if (categories || category) {
      // If categories is sent as array (from multi-select)
      if (categories) {
        // Handle both array and string formats
        let categoriesArray = [];

        if (Array.isArray(categories)) {
          categoriesArray = categories;
        } else if (typeof categories === "string") {
          // If sent as comma-separated string
          categoriesArray = categories
            .split(",")
            .filter((c) => c.trim() !== "");
        }

        if (categoriesArray.length > 0) {
          filter.categories = { $in: categoriesArray };
        }
      }
      // Fallback to single category for backward compatibility
      else if (category) {
        filter.categories = { $in: [category] };
      }
    }
    // ===================================================

    // Price filtering
    if (priceMin || priceMax) {
      filter.currentPrice = {};
      if (priceMin) filter.currentPrice.$gte = parseFloat(priceMin);
      if (priceMax) filter.currentPrice.$lte = parseFloat(priceMax);
    }

    // Search in title, description, and specifications
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "specifications.make": { $regex: search, $options: "i" } },
        { "specifications.model": { $regex: search, $options: "i" } },
      ];
    }

    // Location filtering
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Build specifications filter for Map type
    const specsFilter = {};

    // For Map type, we need to check both existence and value
    if (make) {
      specsFilter["specifications.make"] = {
        $exists: true,
        $regex: make,
        $options: "i",
      };
    }

    if (model) {
      specsFilter["specifications.model"] = {
        $exists: true,
        $regex: model,
        $options: "i",
      };
    }

    if (yearMin || yearMax) {
      // Convert filter values to numbers
      const minYear = yearMin ? parseInt(yearMin) : null;
      const maxYear = yearMax ? parseInt(yearMax) : null;

      // Use $expr to handle type conversion
      specsFilter.$expr = specsFilter.$expr || { $and: [] };

      const yearCondition = {
        $and: [
          { $ne: ["$specifications.year", null] },
          { $ne: ["$specifications.year", ""] },
        ],
      };

      if (minYear !== null) {
        yearCondition.$and.push({
          $gte: [{ $toInt: "$specifications.year" }, minYear],
        });
      }

      if (maxYear !== null) {
        yearCondition.$and.push({
          $lte: [{ $toInt: "$specifications.year" }, maxYear],
        });
      }

      specsFilter.$expr.$and.push(yearCondition);
    }

    // Other car filters - with existence checks
    if (transmission && transmission !== "") {
      specsFilter["specifications.transmission"] = {
        $exists: true,
        $eq: transmission,
      };
    }

    if (fuelType && fuelType !== "") {
      specsFilter["specifications.fuelType"] = {
        $exists: true,
        $eq: fuelType,
      };
    }

    if (condition && condition !== "") {
      specsFilter["specifications.condition"] = {
        $exists: true,
        $eq: condition,
      };
    }

    // Auction type filter
    if (auctionType && auctionType !== "") {
      filter.auctionType = auctionType;
    }

    // Allow offers filter
    if (allowOffers !== undefined && allowOffers !== "") {
      filter.allowOffers = allowOffers === "true";
    }

    // Combine specifications filter with main filter
    if (Object.keys(specsFilter).length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push(specsFilter);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get auctions with pagination
    const auctions = await Auction.find(filter)
      .populate("seller", "username firstName lastName")
      .populate("currentBidder", "username")
      .populate("winner", "username firstName lastName")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Auction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        auctions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAuctions: total,
          hasNextPage: skip + auctions.length < total,
          hasPrevPage: skip > 0,
        },
      },
    });
  } catch (error) {
    console.error("Get auctions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching auctions",
    });
  }
};

export const getTopLiveAuctions = async (req, res) => {
  try {
    const {
      category,
      status = "active", // Default to active auctions
      limit = 4,
      sortBy = "highestBid", // highestBid, mostBids, endingSoon, newest
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filtering
    if (status === "active") {
      filter.status = "active";
      filter.endDate = { $gt: new Date() }; // Only auctions that haven't ended
    } else if (status === "ending_soon") {
      filter.status = "active";
      filter.endDate = {
        $gt: new Date(),
        $lt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ending in next 24 hours
      };
    } else if (status === "sold") {
      // Filter for sold, ended, and reserve_not_met statuses
      filter.status = { $in: ["sold", "ended", "reserve_not_met"] };
    } else if (status === "upcoming") {
      filter.status = "active";
      filter.startDate = { $gt: new Date() }; // Haven't started yet
    } else {
      // For any other status, use it directly
      filter.status = status;
    }

    // Add category filter if provided
    if (category && category !== "all") {
      filter.category = category;
    }

    // Build sort options based on sortBy parameter
    const sortOptions = {};
    switch (sortBy) {
      case "highestBid":
        sortOptions.currentPrice = -1;
        sortOptions.bidCount = -1;
        break;
      case "mostBids":
        sortOptions.bidCount = -1;
        sortOptions.currentPrice = -1;
        break;
      case "endingSoon":
        sortOptions.endDate = 1;
        sortOptions.currentPrice = -1;
        break;
      case "newest":
        sortOptions.createdAt = -1;
        sortOptions.currentPrice = -1;
        break;
      case "lowestBid":
        sortOptions.currentPrice = 1;
        sortOptions.bidCount = -1;
        break;
      default:
        sortOptions.currentPrice = -1;
        sortOptions.bidCount = -1;
    }

    // Get auctions based on filters and sort
    let auctions = await Auction.find(filter)
      .populate("seller", "username firstName lastName")
      .populate("currentBidder", "username firstName")
      .sort(sortOptions)
      .limit(parseInt(limit));

    // If we don't have enough auctions and we're looking for active/ending_soon,
    // try to fill with other active auctions
    if (
      auctions.length < parseInt(limit) &&
      (status === "active" || status === "ending_soon")
    ) {
      const additionalFilter = {
        status: "active",
        endDate: { $gt: new Date() },
        _id: { $nin: auctions.map((a) => a._id) }, // Exclude already fetched auctions
      };

      if (category && category !== "all") {
        additionalFilter.category = category;
      }

      const additionalAuctions = await Auction.find(additionalFilter)
        .populate("seller", "username firstName lastName")
        .populate("currentBidder", "username firstName")
        .sort({
          createdAt: -1, // Get newest first as fallback
          startDate: 1,
        })
        .limit(parseInt(limit) - auctions.length);

      auctions.push(...additionalAuctions);
    }

    res.status(200).json({
      success: true,
      data: {
        auctions,
        total: auctions.length,
        filters: {
          category: category || "all",
          status,
          sortBy,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get top live auctions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching top live auctions",
    });
  }
};

// Get Single Auction
export const getAuction = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id)
      .populate("seller", "username firstName lastName countryName")
      .populate("currentBidder", "username firstName")
      .populate("winner", "username firstName lastName")
      .populate("bids.bidder", "username firstName");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Increment views
    auction.views += 1;
    await auction.save();

    res.status(200).json({
      success: true,
      data: { auction },
    });
  } catch (error) {
    console.error("Get auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching auction",
    });
  }
};

export const updateAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = req.user;

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Check if user owns the auction
    if (auction.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own auctions",
      });
    }

    // CHECK: If auction is sold, prevent seller from editing
    if (auction.status === "sold" || auction.status === "sold_buy_now") {
      return res.status(401).json({
        success: false,
        message: `Sold auction can be edited by administrator only.`,
      });
    }

    // CHECK: If auction is ended, seller can reset and re-list it
    const isEndedAuction =
      auction.status === "ended" || auction.status === "reserve_not_met";

    const {
      title,
      features,
      description,
      specifications,
      location,
      videoLink,
      startPrice,
      bidIncrement,
      auctionType,
      reservePrice,
      buyNowPrice,
      allowOffers,
      startDate,
      endDate,
      removedPhotos,
      removedDocuments,
      removedServiceRecords,
      photoOrder,
      serviceRecordOrder,
    } = req.body;

    // ========== CATEGORIES HANDLING ==========
    let categoriesArray = [];
    if (req.body.categories) {
      try {
        const parsed = JSON.parse(req.body.categories);
        if (Array.isArray(parsed)) {
          categoriesArray = parsed;
        } else {
          categoriesArray = [parsed];
        }
      } catch (e) {
        if (Array.isArray(req.body.categories)) {
          categoriesArray = req.body.categories;
        } else if (typeof req.body.categories === "string") {
          categoriesArray = req.body.categories.includes(",")
            ? req.body.categories.split(",").map((c) => c.trim())
            : [req.body.categories];
        }
      }
    }

    // Validation - categories are required
    if (!categoriesArray || categoriesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one category is required",
      });
    }

    // Basic validation
    if (!title || !description || !auctionType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate start price for all auction types
    if (!startPrice || parseFloat(startPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Start price is required and must be positive",
      });
    }

    // If auction is ended, we'll reset all bidding/offer data
    if (isEndedAuction) {
      const resetData = {
        // Reset all bidding/offers/winner data
        bids: [],
        offers: [],
        currentPrice: parseFloat(startPrice),
        currentBidder: null,
        winner: null,
        finalPrice: null,
        bidCount: 0,

        // Reset payment info
        paymentStatus: "pending",
        paymentMethod: null,
        paymentDate: null,
        transactionId: null,
        invoice: null,

        // Reset notifications
        notifications: {
          ending30min: false,
          ending2hour: false,
          ending24hour: false,
          ending30minSentAt: null,
          ending2hourSentAt: null,
          ending24hourSentAt: null,
          offerReceived: false,
          offerExpiring: false,
        },

        lastBidTime: null,

        // Reset commission
        commissionAmount: 0,
        bidPaymentRequired: true,
      };

      // Apply reset data to auction object
      Object.assign(auction, resetData);
    }

    // Validate bid increment for standard and reserve auctions
    if (
      (auctionType === "standard" || auctionType === "reserve") &&
      (!bidIncrement || parseFloat(bidIncrement) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Bid increment is required for standard and reserve auctions",
      });
    }

    // Validate buy now price for buy_now auctions
    if (auctionType === "buy_now") {
      if (!buyNowPrice || parseFloat(buyNowPrice) < parseFloat(startPrice)) {
        return res.status(400).json({
          success: false,
          message:
            "Buy Now price must be provided and greater than or equal to start price",
        });
      }
    }

    // Validate reserve price for reserve auctions
    if (auctionType === "reserve") {
      if (!reservePrice || parseFloat(reservePrice) < parseFloat(startPrice)) {
        return res.status(400).json({
          success: false,
          message:
            "Reserve price must be provided and greater than or equal to start price",
        });
      }
    }

    // Validate giveaway auctions
    if (auctionType === "giveaway") {
      // For giveaways, we don't need pricing fields
      if (buyNowPrice || reservePrice || bidIncrement) {
        console.log("Warning: Pricing fields ignored for giveaway auction");
      }
    }

    // Handle specifications (keep your existing specifications handling code)
    let finalSpecifications = new Map();

    // Convert existing specifications to Map if they exist
    if (auction.specifications && auction.specifications instanceof Map) {
      auction.specifications.forEach((value, key) => {
        if (value !== null && value !== undefined && value !== "") {
          finalSpecifications.set(key, value);
        }
      });
    } else if (
      auction.specifications &&
      typeof auction.specifications === "object"
    ) {
      Object.entries(auction.specifications).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          finalSpecifications.set(key, value);
        }
      });
    }

    // Parse and merge new specifications
    if (specifications) {
      try {
        let newSpecs;
        if (typeof specifications === "string") {
          newSpecs = JSON.parse(specifications);
        } else {
          newSpecs = specifications;
        }

        if (typeof newSpecs === "object" && newSpecs !== null) {
          Object.entries(newSpecs).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              finalSpecifications.set(key, value.toString());
            } else {
              finalSpecifications.delete(key);
            }
          });
        }
      } catch (parseError) {
        console.error("Error parsing specifications:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        });
      }
    }

    // Handle removed photos
    let finalPhotos = [...auction.photos];
    if (removedPhotos) {
      try {
        const removedPhotoIds =
          typeof removedPhotos === "string"
            ? JSON.parse(removedPhotos)
            : removedPhotos;

        if (Array.isArray(removedPhotoIds)) {
          // Remove photos from the array and delete from Cloudinary
          for (const photoId of removedPhotoIds) {
            const photoIndex = finalPhotos.findIndex(
              (photo) =>
                photo.publicId === photoId || photo._id?.toString() === photoId,
            );

            if (photoIndex > -1) {
              const removedPhoto = finalPhotos[photoIndex];
              // Delete from Cloudinary
              if (removedPhoto.publicId) {
                await deleteFromCloudinary(removedPhoto.publicId);
              }
              finalPhotos.splice(photoIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error("Error processing removed photos:", error);
      }
    }

    // Handle removed documents
    let finalDocuments = [...auction.documents];
    if (removedDocuments) {
      try {
        const removedDocIds =
          typeof removedDocuments === "string"
            ? JSON.parse(removedDocuments)
            : removedDocuments;

        if (Array.isArray(removedDocIds)) {
          for (const docId of removedDocIds) {
            const docIndex = finalDocuments.findIndex(
              (doc) => doc.publicId === docId || doc._id?.toString() === docId,
            );

            if (docIndex > -1) {
              const removedDoc = finalDocuments[docIndex];
              // Delete from Cloudinary
              if (removedDoc.publicId) {
                await deleteFromCloudinary(removedDoc.publicId);
              }
              finalDocuments.splice(docIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error("Error processing removed documents:", error);
      }
    }

    // Handle removed service records
    let finalServiceRecords = [...(auction.serviceRecords || [])];
    if (removedServiceRecords) {
      try {
        const removedServiceRecordIds =
          typeof removedServiceRecords === "string"
            ? JSON.parse(removedServiceRecords)
            : removedServiceRecords;

        if (Array.isArray(removedServiceRecordIds)) {
          for (const recordId of removedServiceRecordIds) {
            const recordIndex = finalServiceRecords.findIndex(
              (record) =>
                record.publicId === recordId ||
                record._id?.toString() === recordId,
            );

            if (recordIndex > -1) {
              const removedRecord = finalServiceRecords[recordIndex];
              // Delete from Cloudinary
              if (removedRecord.publicId) {
                await deleteFromCloudinary(removedRecord.publicId);
              }
              finalServiceRecords.splice(recordIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error("Error processing removed service records:", error);
      }
    }

    // ========== CAPTION HANDLING ==========

    // 1. Get photo captions from request body
    const photoCaptionsArray = [];
    if (req.body.photoCaptions) {
      if (Array.isArray(req.body.photoCaptions)) {
        photoCaptionsArray.push(...req.body.photoCaptions);
      } else if (typeof req.body.photoCaptions === "string") {
        photoCaptionsArray.push(req.body.photoCaptions);
      }
    }

    // 2. Get existing document captions from request body
    const existingDocumentCaptions = [];
    if (req.body.existingDocumentCaptions) {
      if (Array.isArray(req.body.existingDocumentCaptions)) {
        existingDocumentCaptions.push(...req.body.existingDocumentCaptions);
      } else if (typeof req.body.existingDocumentCaptions === "string") {
        existingDocumentCaptions.push(req.body.existingDocumentCaptions);
      }
    }

    // 3. Get new document captions from request body
    const newDocumentCaptions = [];
    if (req.body.newDocumentCaptions) {
      if (Array.isArray(req.body.newDocumentCaptions)) {
        newDocumentCaptions.push(...req.body.newDocumentCaptions);
      } else if (typeof req.body.newDocumentCaptions === "string") {
        newDocumentCaptions.push(req.body.newDocumentCaptions);
      }
    }

    // 4. Get service record captions from request body
    const serviceRecordCaptionsArray = [];
    if (req.body.serviceRecordCaptions) {
      if (Array.isArray(req.body.serviceRecordCaptions)) {
        serviceRecordCaptionsArray.push(...req.body.serviceRecordCaptions);
      } else if (typeof req.body.serviceRecordCaptions === "string") {
        serviceRecordCaptionsArray.push(req.body.serviceRecordCaptions);
      }
    }

    // ========== PHOTO UPDATES ==========

    // Update captions for ALL photos
    finalPhotos.forEach((photo, index) => {
      if (index < photoCaptionsArray.length) {
        photo.caption = photoCaptionsArray[index] || "";
      }
    });

    // Handle new photo uploads
    const newPhotos = [];
    if (req.files && req.files.photos) {
      const photos = Array.isArray(req.files.photos)
        ? req.files.photos
        : [req.files.photos];

      for (const [index, photo] of photos.entries()) {
        try {
          const result = await uploadImageToCloudinary(
            photo.buffer,
            "auction-photos",
          );
          newPhotos.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: photo.originalname,
            order: finalPhotos.length + newPhotos.length,
            caption: photoCaptionsArray[index] || "",
          });
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: `Failed to upload photo: ${photo.originalname}`,
          });
        }
      }
    }

    // Handle photo ordering
    if (photoOrder) {
      try {
        const parsedPhotoOrder =
          typeof photoOrder === "string" ? JSON.parse(photoOrder) : photoOrder;

        if (Array.isArray(parsedPhotoOrder)) {
          // Create a map of existing photos by their ID for quick lookup
          const existingPhotosMap = new Map();
          finalPhotos.forEach((photo) => {
            const photoId = photo.publicId || photo._id?.toString();
            if (photoId) {
              existingPhotosMap.set(photoId, photo);
            }
          });

          // Track used new photos to prevent duplicates
          const usedNewPhotos = new Set();
          const reorderedPhotos = [];

          for (const orderItem of parsedPhotoOrder) {
            if (orderItem.isExisting) {
              // Find existing photo by ID
              const existingPhoto = existingPhotosMap.get(orderItem.id);
              if (existingPhoto) {
                reorderedPhotos.push(existingPhoto);
                // Remove from map to avoid duplicates
                existingPhotosMap.delete(orderItem.id);
              }
            } else {
              // For new photos, find by the temporary ID from frontend
              let foundNewPhoto = null;
              for (let i = 0; i < newPhotos.length; i++) {
                if (!usedNewPhotos.has(i)) {
                  foundNewPhoto = newPhotos[i];
                  usedNewPhotos.add(i);
                  break;
                }
              }

              if (foundNewPhoto) {
                reorderedPhotos.push(foundNewPhoto);
              }
            }
          }

          // Add any remaining existing photos that weren't in the photoOrder
          existingPhotosMap.forEach((photo) => reorderedPhotos.push(photo));

          // Add any remaining new photos that weren't used
          newPhotos.forEach((photo, index) => {
            if (!usedNewPhotos.has(index)) {
              reorderedPhotos.push(photo);
            }
          });

          finalPhotos = reorderedPhotos;
        }
      } catch (error) {
        console.error("Error processing photo order:", error);
        // Fallback: append new photos at the end
        finalPhotos = [...finalPhotos, ...newPhotos];
      }
    } else {
      // If no photoOrder is provided, just append new photos at the end
      finalPhotos = [...finalPhotos, ...newPhotos];
    }

    // ========== DOCUMENT UPDATES ==========

    // Update captions for existing documents
    finalDocuments.forEach((doc, index) => {
      if (index < existingDocumentCaptions.length) {
        doc.caption = existingDocumentCaptions[index] || "";
      }
    });

    // Handle new document uploads
    if (req.files && req.files.documents) {
      const documents = Array.isArray(req.files.documents)
        ? req.files.documents
        : [req.files.documents];

      for (const [index, doc] of documents.entries()) {
        try {
          const result = await uploadDocumentToCloudinary(
            doc.buffer,
            doc.originalname,
            "auction-documents",
          );
          finalDocuments.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: doc.originalname,
            originalName: doc.originalname,
            resourceType: "raw",
            caption: newDocumentCaptions[index] || "",
          });
        } catch (uploadError) {
          console.error("Document upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: `Failed to upload document: ${doc.originalname}`,
          });
        }
      }
    }

    // ========== SERVICE RECORD UPDATES ==========

    // Update captions for ALL service records
    finalServiceRecords.forEach((record, index) => {
      if (index < serviceRecordCaptionsArray.length) {
        record.caption = serviceRecordCaptionsArray[index] || "";
      }
    });

    // Handle new service record uploads
    const newServiceRecords = [];
    if (req.files && req.files.serviceRecords) {
      const serviceRecords = Array.isArray(req.files.serviceRecords)
        ? req.files.serviceRecords
        : [req.files.serviceRecords];

      for (const [index, record] of serviceRecords.entries()) {
        try {
          const result = await uploadImageToCloudinary(
            record.buffer,
            "auction-service-records",
          );
          newServiceRecords.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: record.originalname,
            originalName: record.originalname,
            order: finalServiceRecords.length + newServiceRecords.length,
            caption: serviceRecordCaptionsArray[index] || "",
          });
        } catch (uploadError) {
          console.error("Service record upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: `Failed to upload service record: ${record.originalname}`,
          });
        }
      }
    }

    // Handle service record ordering
    if (serviceRecordOrder) {
      try {
        const parsedServiceRecordOrder =
          typeof serviceRecordOrder === "string"
            ? JSON.parse(serviceRecordOrder)
            : serviceRecordOrder;

        if (Array.isArray(parsedServiceRecordOrder)) {
          // Create a map of existing service records by their ID for quick lookup
          const existingServiceRecordsMap = new Map();
          finalServiceRecords.forEach((record) => {
            const recordId = record.publicId || record._id?.toString();
            if (recordId) {
              existingServiceRecordsMap.set(recordId, record);
            }
          });

          // Track used new service records to prevent duplicates
          const usedNewServiceRecords = new Set();
          const reorderedServiceRecords = [];

          for (const orderItem of parsedServiceRecordOrder) {
            if (orderItem.isExisting) {
              // Find existing service record by ID
              const existingRecord = existingServiceRecordsMap.get(
                orderItem.id,
              );
              if (existingRecord) {
                reorderedServiceRecords.push(existingRecord);
                // Remove from map to avoid duplicates
                existingServiceRecordsMap.delete(orderItem.id);
              }
            } else {
              // For new service records, find by the temporary ID from frontend
              let foundNewRecord = null;
              for (let i = 0; i < newServiceRecords.length; i++) {
                if (!usedNewServiceRecords.has(i)) {
                  foundNewRecord = newServiceRecords[i];
                  usedNewServiceRecords.add(i);
                  break;
                }
              }

              if (foundNewRecord) {
                reorderedServiceRecords.push(foundNewRecord);
              }
            }
          }

          // Add any remaining existing service records that weren't in the order
          existingServiceRecordsMap.forEach((record) =>
            reorderedServiceRecords.push(record),
          );

          // Add any remaining new service records that weren't used
          newServiceRecords.forEach((record, index) => {
            if (!usedNewServiceRecords.has(index)) {
              reorderedServiceRecords.push(record);
            }
          });

          finalServiceRecords = reorderedServiceRecords;
        }
      } catch (error) {
        console.error("Error processing service record order:", error);
        // Fallback: append new service records at the end
        finalServiceRecords = [...finalServiceRecords, ...newServiceRecords];
      }
    } else {
      // If no serviceRecordOrder is provided, just append new service records at the end
      finalServiceRecords = [...finalServiceRecords, ...newServiceRecords];
    }

    // ========== DATE VALIDATION ==========
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // ========== STATUS DETERMINATION ==========
    let newStatus = "draft";

    // ========== PREPARE UPDATE DATA ==========
    const updateData = {
      title,
      categories: categoriesArray,
      features: features || "",
      description,
      specifications: finalSpecifications,
      location,
      videoLink,
      startPrice: parseFloat(startPrice),
      auctionType,
      allowOffers: allowOffers === "true" || allowOffers === true,
      startDate: start,
      endDate: end,
      photos: finalPhotos,
      documents: finalDocuments,
      serviceRecords: finalServiceRecords,
      status: newStatus,
    };

    // Add bid increment only for standard and reserve auctions
    if (auctionType === "standard" || auctionType === "reserve") {
      updateData.bidIncrement = parseFloat(bidIncrement);
    } else {
      updateData.bidIncrement = undefined;
    }

    // Add reserve price if applicable
    if (auctionType === "reserve") {
      updateData.reservePrice = parseFloat(reservePrice);
    } else {
      updateData.reservePrice = undefined;
    }

    // Add buy now price if applicable
    if (auctionType === "buy_now") {
      updateData.buyNowPrice = parseFloat(buyNowPrice);
    } else {
      updateData.buyNowPrice = undefined;
    }

    // Add reset fields for ended auctions
    if (isEndedAuction) {
      updateData.bids = [];
      updateData.offers = [];
      updateData.currentPrice = parseFloat(startPrice);
      updateData.currentBidder = null;
      updateData.winner = null;
      updateData.finalPrice = null;
      updateData.bidCount = 0;
      updateData.paymentStatus = "pending";
      updateData.paymentMethod = null;
      updateData.paymentDate = null;
      updateData.transactionId = null;
      updateData.invoice = null;
      updateData.notifications = {
        ending30min: false,
        ending2hour: false,
        ending24hour: false,
        ending30minSentAt: null,
        ending2hourSentAt: null,
        ending24hourSentAt: null,
        offerReceived: false,
        offerExpiring: false,
      };
      updateData.lastBidTime = null;
      updateData.commissionAmount = 0;
      updateData.bidPaymentRequired = true;
    }

    const updatedAuction = await Auction.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("seller", "username firstName lastName");

    // ========== RESCHEDULE JOBS ==========
    if (
      start.getTime() !== new Date(auction.startDate).getTime() ||
      end.getTime() !== new Date(auction.endDate).getTime()
    ) {
      await agendaService.cancelAuctionJobs(auction._id);

      // Only schedule jobs for timed auctions (standard/reserve)
      if (auctionType === "standard" || auctionType === "reserve") {
        if (start > new Date()) {
          await agendaService.scheduleAuctionActivation(
            updatedAuction._id,
            start,
          );
        }
        await agendaService.scheduleAuctionEnd(updatedAuction._id, end);
      } else {
        console.log(`🛒 ${auctionType} auction ${id} - no jobs scheduled`);
      }
    }

    res.status(200).json({
      success: true,
      message: isEndedAuction
        ? "Ended auction has been reset and updated successfully"
        : "Auction updated successfully",
      data: { auction: updatedAuction },
      reset: isEndedAuction,
    });
  } catch (error) {
    console.error("Update auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating auction",
    });
  }
};

export const deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = req.user;

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Check if user owns the auction
    if (auction.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own auctions",
      });
    }

    // Only allow deletion of draft or cancelled auctions
    if (!["draft", "cancelled"].includes(auction.status)) {
      return res.status(400).json({
        success: false,
        message: "Only draft or cancelled auctions can be deleted",
      });
    }

    // Delete uploaded files from cloudinary
    for (const photo of auction.photos) {
      await deleteFromCloudinary(photo.publicId);
    }

    for (const doc of auction.documents) {
      await deleteFromCloudinary(doc.publicId);
    }

    await Auction.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Auction deleted successfully",
    });
  } catch (error) {
    console.error("Delete auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting auction",
    });
  }
};

// Place Bid

export const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const bidder = req.user;

    // Validate auction status
    if (!bidder?.isActive) {
      return res.status(400).json({
        success: false,
        message: `Account is inactive. Can't place a bid.`,
      });
    }

    // Check if user is a bidder
    if (bidder.userType !== "bidder") {
      return res.status(403).json({
        success: false,
        message: "Only bidders can place bids",
      });
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Store previous highest bidder before placing new bid
    const previousHighestBidder = auction.currentBidder;
    const previousBidders = [
      ...new Set(auction.bids.map((bid) => bid.bidder.toString())),
    ];

    // Place bid using the model method
    await auction.placeBid(bidder._id, bidder.username, parseFloat(amount));

    // Populate the updated auction
    await auction.populate("currentBidder", "username firstName email");
    await auction.populate("seller", "username firstName email");

    res.status(200).json({
      success: true,
      message: "Bid placed successfully",
      data: { auction },
    });

    // Send bid confirmation to the current bidder
    await bidConfirmationEmail(
      bidder.email,
      bidder.username,
      auction,
      amount,
      auction.currentPrice,
    );

    await newBidNotificationEmail(
      auction.seller,
      auction,
      parseFloat(amount),
      bidder,
    );

    // Send outbid notifications to previous bidders (except current bidder)
    if (
      previousHighestBidder &&
      previousHighestBidder.toString() !== bidder._id.toString()
    ) {
      await sendOutbidNotifications(
        auction,
        previousHighestBidder,
        previousBidders,
        bidder._id.toString(),
        amount,
      );
    }
  } catch (error) {
    console.error("Place bid error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User's Auctions
export const getUserAuctions = async (req, res) => {
  try {
    const user = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { seller: user._id };
    if (status && status.trim() !== "") {
      filter.status = status;
    }

    const auctions = await Auction.find(filter)
      .populate("currentBidder", "username firstName image")
      .populate("winner", "username firstName lastName image")
      .populate(
        "bids.bidder",
        "username firstName lastName email image company",
      )
      .sort({ createdAt: -1 });
    // .limit(limit * 1)
    // .skip((page - 1) * limit);

    const total = await Auction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        auctions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAuctions: total,
        },
      },
    });
  } catch (error) {
    console.error("Get user auctions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching user auctions",
    });
  }
};

// Detailed bidding stats
export const getBiddingStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts - FIXED: Remove userId from these queries
    const activeAuctions = await Auction.countDocuments({
      status: "active",
      endDate: { $gt: now },
    });

    const endingSoon = await Auction.countDocuments({
      status: "active",
      endDate: {
        $gt: now,
        $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await Auction.countDocuments({
      status: "active",
      createdAt: { $gte: today },
    });

    const totalBidders = await User.countDocuments({ userType: "bidder" });

    // Bidder-specific analytics - FIXED: Proper aggregation
    const myTotalBidsResult = await Auction.aggregate([
      {
        $match: {
          "bids.bidder": userId,
        },
      },
      {
        $project: {
          userBids: {
            $filter: {
              input: "$bids",
              as: "bid",
              cond: { $eq: ["$$bid.bidder", userId] },
            },
          },
        },
      },
      {
        $project: {
          bidCount: { $size: "$userBids" },
        },
      },
      {
        $group: {
          _id: null,
          totalBids: { $sum: "$bidCount" },
        },
      },
    ]);

    const myWinningAuctions = await Auction.countDocuments({
      winner: userId,
      status: "sold",
    });

    const myActiveBids = await Auction.countDocuments({
      "bids.bidder": userId,
      status: "active",
      endDate: { $gt: now },
    });

    // Recent activity (last 30 days) - FIXED: Proper aggregation
    const recentBids = await Auction.aggregate([
      {
        $match: {
          "bids.bidder": userId,
          "bids.timestamp": { $gte: thirtyDaysAgo },
        },
      },
      { $unwind: "$bids" },
      {
        $match: {
          "bids.bidder": userId,
          "bids.timestamp": { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bids.timestamp" },
          },
          bidsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const myTotalBids = myTotalBidsResult[0]?.totalBids || 0;
    const bidSuccessRate =
      myTotalBids > 0
        ? ((myWinningAuctions / myTotalBids) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        // Basic stats
        activeAuctions,
        newToday,
        endingSoon,
        totalBidders,

        // Bidder personal stats
        myTotalBids,
        myWinningAuctions,
        myActiveBids,

        // Analytics
        bidSuccessRate: parseFloat(bidSuccessRate),

        // Recent activity
        recentBiddingActivity: recentBids,

        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Get bidding stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching bidding stats",
    });
  }
};

// Get user's won auctions
export const getWonAuctions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 12, status, search } = req.query;

    // Build filter for auctions won by user
    const filter = {
      winner: userId,
      status: { $in: ["sold", "ended"] }, // Include both sold and ended auctions where user won
    };

    // Add status filter if provided
    if (status && status !== "all") {
      // Map frontend status to backend status
      const statusMap = {
        payment_pending: "sold",
        paid: "sold",
        shipped: "sold",
        delivered: "sold",
      };
      filter.status = statusMap[status] || status;
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        // { category: { $regex: search, $options: "i" } },
        { categories: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const auctions = await Auction.find(filter)
      .populate("seller", "username firstName lastName email phone createdAt")
      .populate("winner", "username firstName lastName")
      .populate("currentBidder", "username firstName")
      .sort({ endDate: -1 });
    // .limit(limit * 1)
    // .skip((page - 1) * limit);

    const total = await Auction.countDocuments(filter);

    // Transform data to match frontend structure
    const transformedAuctions = auctions.map((auction) => ({
      _id: auction._id.toString(),
      title: auction.title,
      category: auction.category,
      description: auction.description,
      category: auction.category,

      // Pricing & Bidding
      finalBid: auction.finalPrice || auction.currentPrice,
      startingBid: auction.startPrice,
      yourMaxBid: getMaxBidForUser(auction.bids, userId),
      winningBid: auction.finalPrice || auction.currentPrice,
      bids: auction.bidCount,

      // Buy Now Info
      buyNowPrice: auction.buyNowPrice,

      // Offers Info
      allowsOffers: auction.allowOffers,
      offersCount: auction.offers ? auction.offers.length : 0,
      bidsCount: auction.bids ? auction.bids.length : 0,
      pendingOffersCount: auction.offers
        ? auction.offers.filter((o) => o.status === "pending").length
        : 0,

      // Payment & Invoice Info
      paymentStatus: auction.paymentStatus || "pending",
      paymentMethod: auction.paymentMethod,
      paymentDate: auction.paymentDate,
      transactionId: auction.transactionId,
      hasInvoice: !!(auction.invoice && auction.invoice.url),
      invoice: auction.invoice
        ? {
            url: auction.invoice.url,
            filename: auction.invoice.filename,
            uploadedAt: auction.invoice.uploadedAt,
            uploadedBy: auction.invoice.uploadedBy
              ? {
                  _id: auction.invoice.uploadedBy._id.toString(),
                  name:
                    auction.invoice.uploadedBy.name ||
                    auction.invoice.uploadedBy.username,
                  email: auction.invoice.uploadedBy.email,
                }
              : null,
          }
        : null,

      // Status & Timing
      auctionStatus: auction.status,
      auctionType: auction.auctionType,
      endTime: auction.endDate,
      winTime:
        auction.status === "sold" || auction.status === "sold_buy_now"
          ? auction.updatedAt
          : null,
      reservePrice: auction.reservePrice,
      reserveMet: auction.currentPrice >= auction.reservePrice,

      // Location
      location: auction.location,

      // Seller Info
      seller: {
        _id: auction.seller._id.toString(),
        name:
          auction.seller.firstName && auction.seller.lastName
            ? `${auction.seller.firstName} ${auction.seller.lastName}`
            : auction.seller.username,
        username: auction.seller.username,
        memberSince: auction.seller.createdAt || "2025",
        email: auction.seller.email,
        phone: auction.seller.phone,
        company: auction.seller.company || "N/A",
      },

      // Winner Info (if sold)
      winner: auction.winner
        ? {
            _id: auction.winner._id.toString(),
            name:
              auction.winner.firstName && auction.winner.lastName
                ? `${auction.winner.firstName} ${auction.winner.lastName}`
                : auction.winner.username,
            username: auction.winner.username,
            email: auction.winner.email,
          }
        : null,

      // Messages
      congratulatoryMessage: generateCongratulatoryMessage(auction),

      // Created/Updated timestamps
      createdAt: auction.createdAt,
      updatedAt: auction.updatedAt,

      // Bid increment
      bidIncrement: auction.bidIncrement,

      // Current bidder info
      currentBidder: auction.currentBidder
        ? {
            _id: auction.currentBidder._id.toString(),
            name: auction.currentBidder.name || auction.currentBidder.username,
          }
        : null,
    }));

    // Calculate statistics
    const totalWon = total;
    const totalSpent = auctions.reduce(
      (sum, auction) => sum + (auction.finalPrice || auction.currentPrice),
      0,
    );
    const averageSavings =
      auctions.length > 0
        ? auctions.reduce(
            (sum, auction) =>
              sum +
              auction.startPrice / (auction.finalPrice || auction.currentPrice),
            0,
          ) / auctions.length
        : 0;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentWins = auctions.filter(
      (auction) => new Date(auction.endDate) > weekAgo,
    ).length;

    res.status(200).json({
      success: true,
      data: {
        auctions: transformedAuctions,
        statistics: {
          totalWon,
          totalSpent,
          averageSavings,
          recentWins,
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAuctions: total,
        },
      },
    });
  } catch (error) {
    console.error("Get won auctions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching won auctions",
    });
  }
};

// Helper function to get user's max bid
const getMaxBidForUser = (bids, userId) => {
  const userBids = bids.filter(
    (bid) => bid.bidder.toString() === userId.toString(),
  );
  if (userBids.length === 0) return 0;
  return Math.max(...userBids.map((bid) => bid.amount));
};

// Helper function to generate congratulatory messages
const generateCongratulatoryMessage = (auction) => {
  const messages = {
    Aircraft: "Congratulations on winning this magnificent aircraft!",
    "Engines & Parts":
      "Outstanding win! This is a fantastic addition to any collection.",
    "Aviation Memorabilia":
      "Fantastic win! This piece is in impeccable condition and holds great historical value.",
  };

  return (
    messages[auction.category] || "Congratulations on winning the auction!"
  );
};

// Get seller's sold auctions
export const getSoldAuctions = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 12, status, search } = req.query;

    // Build filter for auctions sold by this seller
    const filter = {
      seller: sellerId,
      status: { $in: ["sold", "ended"] }, // Auctions that have been sold or ended
    };

    // Add status filter if provided
    if (status && status !== "all") {
      const statusMap = {
        sold: "sold",
        ended: "ended",
        reserve_not_met: "reserve_not_met",
      };
      filter.status = statusMap[status] || status;
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        // { category: { $regex: search, $options: "i" } },
        { categories: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const auctions = await Auction.find(filter)
      .populate("seller", "username firstName lastName email phone createdAt")
      .populate(
        "winner",
        "username firstName lastName email phone image company address",
      )
      .populate("currentBidder", "username firstName")
      .populate(
        "bids.bidder",
        "username firstName lastName email phone company",
      )
      .sort({ endDate: -1 });
    // .limit(limit * 1)
    // .skip((page - 1) * limit);

    const total = await Auction.countDocuments(filter);

    // Transform data to match frontend structure for seller's won auctions page
    const transformedAuctions = auctions.map((auction) => {
      // Get all unique bidders with their highest bid
      const uniqueBidders = auction.bids.reduce((acc, bid) => {
        const bidderId = bid.bidder?._id?.toString();
        if (bidderId && bid.bidder?._id) {
          const existing = acc.find((b) => b.id === bidderId);
          if (!existing || bid.amount > existing.finalBid) {
            // Remove existing and add new highest bid
            const filtered = acc.filter((b) => b.id !== bidderId);
            return [
              ...filtered,
              {
                id: bidderId,
                name:
                  bid.bidder.firstName && bid.bidder.lastName
                    ? `${bid.bidder.firstName} ${bid.bidder.lastName}`
                    : bid.bidder.username,
                username: bid.bidder.username,
                email: bid.bidder.email,
                image: bid.bidder.image,
                phone: bid.bidder.phone,
                company: bid.bidder.company,
                address: bid.bidder.address,
                finalBid: bid.amount,
                bidTime: bid.timestamp,
                isWinner: auction.winner?._id?.toString() === bidderId,
              },
            ];
          }
        }
        return acc;
      }, []);

      // Sort bidders by final bid (highest first)
      const sortedBidders = uniqueBidders.sort(
        (a, b) => b.finalBid - a.finalBid,
      );

      return {
        id: auction._id.toString(),
        auctionId: `AV${auction._id.toString().slice(-6).toUpperCase()}`,
        title: auction.title,
        description: auction.description,
        category: auction.category,
        auctionType:
          auction.auctionType === "reserve"
            ? "Reserve Auction"
            : "Standard Auction",
        reservePrice: auction.reservePrice,
        startingBid: auction.startPrice,
        winningBid: auction.finalPrice || auction.currentPrice,
        startTime: auction.startDate,
        endTime: auction.endDate,
        winner: auction.winner
          ? {
              id: auction.winner._id.toString(),
              name:
                auction.winner.firstName && auction.winner.lastName
                  ? `${auction.winner.firstName} ${auction.winner.lastName}`
                  : auction.winner.username,
              username: auction.winner.username,
              email: auction.winner.email,
              image: auction.winner.image,
              phone: auction.winner.phone,
              company: auction.winner.company,
              address: auction.winner.address,
              ip: "Not Available", // IP might not be stored
              bidHistory: auction.bids
                .filter(
                  (bid) =>
                    bid.bidder?._id?.toString() ===
                    auction.winner?._id?.toString(),
                )
                .map((bid) => ({
                  amount: bid.amount,
                  time: bid.timestamp,
                }))
                .sort((a, b) => new Date(a.time) - new Date(b.time)),
            }
          : null,
        bidders: sortedBidders.filter(
          (bidder) =>
            !auction.winner || bidder.id !== auction.winner._id?.toString(),
        ),
      };
    });

    // Calculate statistics for seller
    const totalSold = total;
    const totalRevenue = auctions.reduce(
      (sum, auction) => sum + (auction.finalPrice || auction.currentPrice || 0),
      0,
    );
    const averageSalePrice = totalSold > 0 ? totalRevenue / totalSold : 0;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSales = auctions.filter(
      (auction) => new Date(auction.endDate) > weekAgo,
    ).length;

    res.status(200).json({
      success: true,
      data: {
        auctions: transformedAuctions,
        statistics: {
          totalSold,
          totalRevenue,
          averageSalePrice,
          recentSales,
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAuctions: total,
        },
      },
    });
  } catch (error) {
    console.error("Get sold auctions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching sold auctions",
    });
  }
};

export const lowerReservePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = req.user;
    const { newReservePrice } = req.body;

    // Validate input
    if (!newReservePrice || isNaN(parseFloat(newReservePrice))) {
      return res.status(400).json({
        success: false,
        message: "Valid new reserve price is required",
      });
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Check if user owns the auction
    if (auction.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own auctions",
      });
    }

    // Check if auction is active
    if (auction.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Can only lower reserve price for active auctions",
      });
    }

    // Check if auction has reserve price
    if (auction.auctionType !== "reserve") {
      return res.status(400).json({
        success: false,
        message: "Only reserve auctions can have reserve prices",
      });
    }

    const newPrice = parseFloat(newReservePrice);
    const currentReserve = parseFloat(auction.reservePrice);
    const currentBid = parseFloat(auction.currentPrice);

    // Validate new reserve price is lower
    if (newPrice >= currentReserve) {
      return res.status(400).json({
        success: false,
        message: "New reserve price must be lower than current reserve price",
      });
    }

    // Validate new reserve price is higher than current bid
    // if (newPrice <= currentBid) {
    //     return res.status(400).json({
    //         success: false,
    //         message: `New reserve price must be higher than current bid ($${currentBid.toLocaleString()})`
    //     });
    // }

    // Validate positive price
    if (newPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Reserve price must be greater than 0",
      });
    }

    // Update reserve price
    auction.reservePrice = newPrice;

    // Save the auction
    const updatedAuction = await auction.save();

    // Populate seller info for response
    await updatedAuction.populate("seller", "username firstName lastName");

    res.status(200).json({
      success: true,
      message: "Reserve price lowered successfully",
      data: { auction: updatedAuction },
    });
  } catch (error) {
    console.error("Lower reserve price error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while lowering reserve price",
    });
  }
};

/**
 * @desc    Buy Now - Purchase item immediately
 * @route   POST /api/v1/auctions/buy-now/:id
 * @access  Private
 */
export const buyNow = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer = req.user;

    // Validate auction status
    if (!buyer?.isActive) {
      return res.status(400).json({
        success: false,
        message: `Account is inactive. Can't buy an item.`,
      });
    }

    // Check if user is a bidder
    if (buyer?.userType !== "bidder") {
      return res.status(403).json({
        success: false,
        message: "Only bidders can buy items",
      });
    }

    // Find auction
    const auction = await Auction.findById(id)
      .populate("seller", "username firstName lastName email phone address")
      .populate(
        "currentBidder",
        "username firstName lastName email phone address",
      )
      .populate("winner", "username firstName lastName email phone address");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Check if user is seller
    if (auction.seller._id.toString() === buyer._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot buy your own auction",
      });
    }

    // Validate auction can be bought
    if (auction.auctionType === "giveaway") {
      // For giveaways, no price check needed
      console.log("Processing free giveaway claim");
    } else {
      // For regular buy now, check price exists
      if (!auction.buyNowPrice) {
        return res.status(400).json({
          success: false,
          message: "Buy Now is not available for this auction",
        });
      }
    }

    if (auction.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Auction is not active. Current status: ${auction.status}`,
      });
    }

    // For regular auctions, check end date
    if (auction.auctionType !== "giveaway" && new Date() > auction.endDate) {
      return res.status(400).json({
        success: false,
        message: "Auction has already ended",
      });
    }

    if (auction.winner) {
      return res.status(400).json({
        success: false,
        message: "Auction already has a winner",
      });
    }

    // Execute Buy Now using the model method
    await auction.buyNow(buyer._id, buyer.username);

    // Populate updated auction
    const updatedAuction = await Auction.findById(id)
      .populate("seller", "username firstName lastName email")
      .populate("winner", "username firstName lastName email phone address")
      .populate("bids.bidder", "username firstName lastName");

    // Custom message for giveaway
    const successMessage =
      auction.auctionType === "giveaway"
        ? "🎉 Congratulations! You have claimed this item for free!"
        : "Congratulations! You have purchased this item.";

    res.status(200).json({
      success: true,
      message: successMessage,
      data: {
        auction: updatedAuction,
      },
    });

    // Send emails (in background)
    sendAuctionEndedSellerEmail(updatedAuction).catch((error) =>
      console.error("Failed to send seller ended auction email:", error),
    );

    sendAuctionWonEmail(updatedAuction).catch((error) =>
      console.error("Failed to send buyer won auction email:", error),
    );

    // Send admin emails to all admin users
    try {
      const adminUsers = await User.find({ userType: "admin" }).select(
        "email firstName",
      );

      if (adminUsers.length === 0) {
        console.log('⚠️ No admin users found with userType: "admin"');
      } else {
        for (const admin of adminUsers) {
          await auctionWonAdminEmail(
            admin?.email,
            updatedAuction,
            updatedAuction?.winner,
          ).catch((error) =>
            console.error(
              `Failed to send admin email to ${admin.email}:`,
              error,
            ),
          );
        }
        console.log(
          `✅ Sent admin notifications to ${adminUsers.length} admin(s)`,
        );
      }
    } catch (adminEmailError) {
      console.error(
        "Error fetching admin users or sending admin emails:",
        adminEmailError,
      );
    }
  } catch (error) {
    console.error("Buy Now error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to complete Buy Now purchase",
    });
  }
};

/**
 * @desc    Check if Buy Now is available
 * @route   GET /api/v1/auctions/:id/buy-now/check
 * @access  Private
 */
export const checkBuyNowAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    const isAvailable =
      auction.buyNowPrice &&
      auction.auctionType === "buy_now" &&
      auction.status === "active" &&
      !auction.winner &&
      auction.seller.toString() !== userId.toString();

    res.status(200).json({
      success: true,
      data: {
        isAvailable,
        buyNowPrice: auction.buyNowPrice,
        auctionStatus: auction.status,
        hasWinner: !!auction.winner,
        isSeller: auction.seller.toString() === userId.toString(),
      },
    });
  } catch (error) {
    console.error("Check Buy Now error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check Buy Now availability",
    });
  }
};

/**
 * @desc    Get commission info for an auction
 * @route   GET /api/v1/auctions/:id/commission
 * @access  Private
 */
export const getAuctionCommission = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Get global commission settings
    const commission = await Commission.findOne();

    res.status(200).json({
      success: true,
      data: {
        auctionId: auction._id,
        finalPrice: auction.finalPrice,
        commissionAmount: auction.commissionAmount,
        commissionType: auction.commissionType,
        commissionValue: auction.commissionValue,
        globalSettings: commission,
      },
    });
  } catch (error) {
    console.error("Get auction commission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch commission info",
    });
  }
};
