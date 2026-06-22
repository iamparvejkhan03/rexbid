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

        // Check if email already exists
        const existingUser = await PilotPhase.findOne({ 
            email: email.toLowerCase().trim() 
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered for pilot notifications",
            });
        }

        // Save to database
        const notification = await PilotPhase.create({
            email: email.toLowerCase().trim(),
            phoneNumber: phoneNumber.trim(),
            timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
            success: true,
            message: "We'll notify you when bidding opens!",
            data: notification,
        });

    } catch (error) {
        console.error("Pilot notification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllPilotUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = search 
            ? {
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { phoneNumber: { $regex: search, $options: 'i' } }
                ]
              }
            : {};

        // Get total count for pagination
        const totalUsers = await PilotPhase.countDocuments(searchQuery);

        // Get users with pagination
        const users = await PilotPhase.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    hasNext: page * limit < totalUsers,
                    hasPrev: page > 1,
                },
                stats: {
                    total: totalUsers,
                }
            }
        });

    } catch (error) {
        console.error("Get all pilot users error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deletePilotUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await PilotPhase.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pilot user not found",
            });
        }

        await PilotPhase.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Pilot user deleted successfully",
        });

    } catch (error) {
        console.error("Delete pilot user error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};