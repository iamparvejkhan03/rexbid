import {
    deliveryQuoteAdminEmail,
    deliveryQuoteUserEmail,
} from "../utils/nodemailer.js";

// ============================================================
// Submit delivery partner quote request (no DB, direct email)
// ============================================================
export const submitDeliveryQuote = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and delivery details are required.",
            });
        }

        // Basic email format check
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        // Final subject (fallback if empty)
        const finalSubject = subject?.trim() || `New Delivery Quote Request - ${name}`;

        // Fire and forget — don't block the response on email sending
        deliveryQuoteAdminEmail({
            name,
            email,
            phone: phone || "",
            subject: finalSubject,
            message,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
        }).catch((err) => console.error("Admin delivery quote email error:", err));

        deliveryQuoteUserEmail({ name, email }).catch((err) =>
            console.error("User confirmation email error:", err)
        );

        return res.status(201).json({
            success: true,
            message:
                "Your delivery quote request has been sent successfully. Our partner team will get back to you within 24 hours.",
            data: {
                name,
                email,
                subject: finalSubject,
            },
        });
    } catch (error) {
        console.error("Submit delivery quote error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while submitting your quote request.",
        });
    }
};