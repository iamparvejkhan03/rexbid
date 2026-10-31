import { model, Schema } from "mongoose";

const catalogueSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        // Stored as the calendar day the catalogue closes.
        // We save it at LOCAL NOON of that day to avoid timezone drift.
        closingDate: {
            type: Date,
            required: true,
        },
        image: {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
            filename: { type: String, default: "" },
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

catalogueSchema.index({ closingDate: 1 });

const Catalogue = model("Catalogue", catalogueSchema);
export default Catalogue;