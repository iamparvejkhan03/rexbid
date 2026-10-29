import { model, Schema } from "mongoose";

const RECIPIENT_GROUPS = [
    "all_sellers",
    "all_companies",
    "sellers_and_companies",
    "all_bidders",
    "all_users",
];

const emailCampaignSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200, // used as both campaign name and email subject
        },
        body: {
            type: String,
            required: true, // sanitized HTML inner content (no wrapper)
        },
        recipients: {
            groups: {
                type: [{ type: String, enum: RECIPIENT_GROUPS }],
                default: [],
            },
            specificUserIds: {
                type: [{ type: Schema.Types.ObjectId, ref: "User" }],
                default: [],
            },
        },
        scheduleDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ["draft", "scheduled", "sending", "sent", "failed", "cancelled"],
            default: "draft",
        },
        stats: {
            total: { type: Number, default: 0 },
            sent: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
        },
        sentAt: {
            type: Date,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

emailCampaignSchema.pre("validate", function (next) {
    const hasGroups =
        Array.isArray(this.recipients?.groups) && this.recipients.groups.length > 0;
    const hasUsers =
        Array.isArray(this.recipients?.specificUserIds) &&
        this.recipients.specificUserIds.length > 0;
    if (!hasGroups && !hasUsers) {
        return next(
            new Error("At least one recipient group or specific user is required")
        );
    }
    next();
});

emailCampaignSchema.index({ status: 1 });
emailCampaignSchema.index({ scheduleDate: 1 });
emailCampaignSchema.index({ createdBy: 1 });

const EmailCampaign = model("EmailCampaign", emailCampaignSchema);
export default EmailCampaign;