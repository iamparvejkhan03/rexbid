import PilotPhase from "../models/pilotPhase.model.js";

export const submitPilotNotification = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        if (!email || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Email and phone number are required",
            });
        }

        // Save to database
        const notification = await PilotPhase.create({
            email: email.toLowerCase().trim(),
            phoneNumber: phoneNumber.trim(),
            timestamp: new Date().toISOString(),
        });

        // Optional: Send email to admin
        // await sendAdminNotification(email, phoneNumber);

        return res.status(200).json({
            success: true,
            message: "We'll notify you when bidding opens!",
        });

    } catch (error) {
        console.error("Pilot notification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};