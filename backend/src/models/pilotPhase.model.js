import { model, Schema } from "mongoose";

const pilotPhaseSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const PilotPhase = model("PilotPhase", pilotPhaseSchema);

export default PilotPhase;