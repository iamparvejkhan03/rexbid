import { Schema, model } from "mongoose";

const auctionDateSchema = new Schema(
    {
        // Optional override; auto-generated from dates if blank
        label: { type: String, trim: true, default: "" },

        startDate: { type: Date, required: true, index: true },
        endDate: { type: Date, required: true },

        isActive: { type: Boolean, default: true, index: true },

        notes: { type: String, trim: true, default: "" },

        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

auctionDateSchema.pre("validate", function (next) {
    if (!this.label || !this.label.trim()) {
        const fmt = (d) =>
            new Date(d).toLocaleString("en-IE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        this.label = `${fmt(this.startDate)} → ${fmt(this.endDate)}`;
    }
    if (this.endDate <= this.startDate) {
        return next(new Error("End date must be after start date"));
    }
    next();
});

auctionDateSchema.index({ isActive: 1, startDate: 1 });

const AuctionDate = model("AuctionDate", auctionDateSchema);
export default AuctionDate;