import Agenda from "agenda";
import Auction from "../models/auction.model.js";
import backendAxios from "../utils/backendAxios.js";
import {
  cancelAllBidderAuthorizations,
  cancelLosingBidderAuthorizations,
  chargeWinningBidder,
  chargeWinningBidderDirect,
} from "../controllers/bidPayment.controller.js";
import {
  auctionEndedAdminEmail,
  auctionEndingSoonEmail,
  auctionListedEmail,
  auctionWonAdminEmail,
  paymentSuccessEmail,
  sendAuctionEndedSellerEmail,
  sendAuctionWonEmail,
  sendBulkAuctionNotifications,
} from "../utils/nodemailer.js";
import User from "../models/user.model.js";

class AgendaService {
  constructor() {
    this.agenda = new Agenda({
      db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
      processEvery: "30 seconds", // Check for due jobs every 30 seconds
    });

    this.defineJobs();
  }

  defineJobs() {
    // Job to activate an auction at its start time
    this.agenda.define("activate auction", async (job) => {
      const { auctionId } = job.attrs.data;

      try {
        const auction = await Auction.findById(auctionId);
        if (auction && auction.status === "approved") {
          auction.status = "active";
          await auction.save();
          await auction.populate("seller", "email username firstName");

          // Send email to seller
          await auctionListedEmail(auction, auction.seller);

          // Send bulk notifications to all users (except admin and auction seller)
          const allUsers = await User.find({
            _id: { $ne: auction.seller._id }, // Exclude auction owner
            userType: { $ne: "admin" }, // Exclude admin users
            isActive: true, // Only active users
          }).select("email username firstName preferences userType");

          // Send bulk notifications
          await sendBulkAuctionNotifications(allUsers, auction, auction.seller);

          // console.log(`✅ Agenda: Activated auction ${auctionId}`);
        }
      } catch (error) {
        console.error("Agenda job error (activate auction):", error);
        // Job will retry based on Agenda's retry logic
      }
    });

    this.agenda.define("end auction", async (job) => {
      const { auctionId } = job.attrs.data;

      try {
        let auction = await Auction.findById(auctionId).populate(
          "seller",
          "email phone username firstName",
        );
        // Don't populate winner initially since it might be null

        if (!auction) {
          console.log(`❌ Agenda: Auction ${auctionId} not found`);
          return;
        }

        // NEW: Skip ending for giveaways - they should only end when claimed
        // Skip ending for always-available auctions (buy_now and giveaway)
        if (
          auction.auctionType === "buy_now" ||
          auction.auctionType === "giveaway"
        ) {
          console.log(
            `🛒 Auction ${auctionId} is ${auction.auctionType} - skipping auto-end (waiting for purchase)`,
          );
          return;
        }

        // Only process if auction is still active and end date has passed
        if (auction.status === "active" && new Date() >= auction.endDate) {
          // CRITICAL CHECK: Skip if auction already has a winner (means offer was accepted or buy now used)
          if (auction.winner) {
            console.log(
              `ℹ️ Agenda: Auction ${auctionId} already has a winner, skipping automated ending`,
            );
            return;
          }

          // CRITICAL CHECK: Skip if auction status is already sold
          const soldStatuses = ["sold", "sold_buy_now"];
          if (soldStatuses.includes(auction.status)) {
            console.log(
              `ℹ️ Agenda: Auction ${auctionId} is already in sold status (${auction.status}), skipping`,
            );
            return;
          }

          // Check if any offer is accepted
          const hasAcceptedOffer =
            auction.offers &&
            auction.offers.some(
              (offer) =>
                offer.status === "accepted" || offer.status === "completed",
            );

          if (hasAcceptedOffer) {
            console.log(
              `ℹ️ Agenda: Auction ${auctionId} has accepted offer, skipping automated ending`,
            );
            return;
          }

          console.log(`✅ Agenda: Ending auction ${auctionId}`);

          // Use the model's endAuction method to handle the business logic
          const result = await auction.endAuction();

          // Re-fetch the auction with populated winner if it was sold
          if (result.wasSold) {
            auction = await Auction.findById(auctionId)
              .populate("seller", "email phone username firstName")
              .populate("winner", "email phone username firstName address");
          }

          // Send appropriate emails based on the result
          if (result.wasSold) {
            console.log(
              `✅ Agenda: Auction ${auctionId} was SOLD to ${
                auction.winner ? auction.winner.username : "unknown"
              }`,
            );

            // Send auction won email to buyer
            await sendAuctionWonEmail(auction);

            // Send admin email for sold auction
            const adminUsers = await User.find({ userType: "admin" });
            for (const admin of adminUsers) {
              await auctionWonAdminEmail(admin.email, auction, auction.winner);
            }

            console.log(`✅ Agenda: Sent SOLD emails for auction ${auctionId}`);
          } else {
            console.log(
              `✅ Agenda: Auction ${auctionId} ended without sale (status: ${result.newStatus})`,
            );

            // Send seller email (auction ended without sale)
            await sendAuctionEndedSellerEmail(auction);

            // Send admin email for ended auction
            const adminUsers = await User.find({ userType: "admin" });
            for (const admin of adminUsers) {
              await auctionEndedAdminEmail(admin.email, auction);
            }

            console.log(
              `✅ Agenda: Sent ENDED emails for auction ${auctionId}`,
            );
          }
        } else if (
          auction.status === "active" &&
          new Date() < auction.endDate
        ) {
          // Auction was extended, reschedule the job
          await this.scheduleAuctionEnd(auctionId, auction.endDate);
          console.log(
            `🔄 Agenda: Rescheduled auction ${auctionId} to ${auction.endDate}`,
          );
        } else {
          console.log(
            `ℹ️ Agenda: Auction ${auctionId} status is ${auction.status}, skipping`,
          );
        }
      } catch (error) {
        console.error("Agenda job error (end auction):", error);
      }
    });

    // Job to send notifications for auctions ending soon
    this.agenda.define("send ending soon notifications", async (job) => {
      try {
        const now = new Date();

        // Define multiple time thresholds
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const twentyFourHoursFromNow = new Date(
          now.getTime() + 24 * 60 * 60 * 1000,
        );

        // Find auctions ending within our thresholds that haven't had notifications sent yet
        const endingSoonAuctions = await Auction.find({
          status: "active",
          $or: [
            {
              // Ending in exactly 30 minutes (±15 minutes window)
              endDate: {
                $lte: thirtyMinutesFromNow,
                $gte: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes from now
              },
              "notifications.ending30min": { $ne: true }, // Not sent yet
            },
            {
              // Ending in exactly 2 hours (±15 minutes window)
              endDate: {
                $lte: twoHoursFromNow,
                $gte: new Date(now.getTime() + 105 * 60 * 1000), // 1 hour 45 minutes from now
              },
              "notifications.ending2hour": { $ne: true }, // Not sent yet
            },
            {
              // Ending in exactly 24 hours (±15 minutes window)
              endDate: {
                $lte: twentyFourHoursFromNow,
                $gte: new Date(now.getTime() + 1425 * 60 * 1000), // 23 hours 45 minutes from now
              },
              "notifications.ending24hour": { $ne: true }, // Not sent yet
            },
          ],
        }).populate("seller", "email username preferences userType"); // Populate seller to exclude them

        for (const auction of endingSoonAuctions) {
          // Calculate exact time remaining for this auction
          const timeRemaining = auction.endDate - now;
          const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));

          // Determine which notification threshold this auction falls into
          let notificationType, timeLabel;

          if (minutesRemaining <= 45 && minutesRemaining >= 15) {
            // 30-minute notification window (30 minutes ±15 minutes)
            notificationType = "ending30min";
            timeLabel = "30 minutes";
          } else if (minutesRemaining <= 135 && minutesRemaining >= 105) {
            // 2-hour notification window (2 hours ±15 minutes)
            notificationType = "ending2hour";
            timeLabel = "2 hours";
          } else if (minutesRemaining <= 1455 && minutesRemaining >= 1425) {
            // 24-hour notification window (24 hours ±15 minutes)
            notificationType = "ending24hour";
            timeLabel = "24 hours";
          } else {
            // Skip if not in any precise notification window
            continue;
          }

          // Find ALL users who should receive notifications (excluding auction seller, admins, and opted-out users)
          const allUsers = await User.find({
            _id: { $ne: auction.seller._id }, // Exclude auction owner
            userType: { $nin: ["admin", "seller", "broker"] }, // Exclude admin, seller, and broker users
            "preferences.bidAlerts": { $ne: false }, // Exclude users who opted out
            isActive: true, // Only active users
          }).select("email username preferences userType");

          // Send to each user
          for (const user of allUsers) {
            try {
              await auctionEndingSoonEmail(
                user.email,
                user.username,
                auction,
                timeLabel,
              );
              console.log(
                `✅ Sent ${timeLabel} notification to ${user.email} (${user.userType}) for auction ${auction.title}`,
              );
            } catch (error) {
              console.error(
                `Failed to send ending soon email to ${user.email}:`,
                error,
              );
            }
          }

          // Mark this notification as sent in the auction document
          await Auction.findByIdAndUpdate(auction._id, {
            $set: {
              [`notifications.${notificationType}`]: true,
              [`notifications.${notificationType}SentAt`]: new Date(),
            },
          });

          console.log(
            `📧 Sent ${timeLabel} notifications for auction "${auction.title}" to ${allUsers.length} users`,
          );
        }

        console.log(
          `📧 Completed ending soon notifications for ${endingSoonAuctions.length} auctions`,
        );
      } catch (error) {
        console.error("Agenda job error (ending soon notifications):", error);
      }
    });
  }

  // Schedule auction activation job
  async scheduleAuctionActivation(auctionId, startDate) {
    await this.agenda.schedule(startDate, "activate auction", { auctionId });
    // console.log(`📅 Scheduled activation for auction ${auctionId} at ${startDate}`);
  }

  // Schedule auction ending job
  async scheduleAuctionEnd(auctionId, endDate) {
    await this.agenda.schedule(endDate, "end auction", { auctionId });
    // console.log(`📅 Scheduled ending for auction ${auctionId} at ${endDate}`);
  }

  // Cancel jobs if auction is deleted or modified
  async cancelAuctionJobs(auctionId) {
    await this.agenda.cancel({
      "data.auctionId": auctionId,
    });
    console.log(`🗑️ Cancelled jobs for auction ${auctionId}`);
  }

  // Start Agenda
  async start() {
    await this.agenda.start();
    console.log("🕒 Agenda service started");
    await this.agenda.every("15 minutes", "send ending soon notifications");
  }

  // Graceful shutdown
  async stop() {
    await this.agenda.stop();
    console.log("🛑 Agenda service stopped");
  }
}

export default new AgendaService();
