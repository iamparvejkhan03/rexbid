import nodemailer from "nodemailer";
import Commission from "../models/commission.model.js";
import { getCachedRates } from "../routes/currency.route.js";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Add connection verification
transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP Connection failed:", error);
    } else {
        console.log("SMTP Server is ready");
    }
});

// ============================================
// REXBID BRANDING CONFIGURATION
// ============================================

// Brand colors - RexBid (Gold & Navy)
const BRAND_COLORS = {
    primary: '#D19F3E',      // Gold - main brand color
    primaryLight: '#E0B05E',  // Lighter gold
    primaryDark: '#B88A2E',   // Darker gold
    secondary: '#072342',     // Navy blue - secondary brand color
    secondaryLight: '#1A3A5C', // Lighter navy
    secondaryDark: '#051A32',  // Darker navy
    grayBg: '#f8f9fa',
    grayBorder: '#e9ecef',
    text: '#1f2937',
    textLight: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
};

// Brand text variables
const BRAND_NAME = 'RexBid';
const BRAND_TAGLINE = 'Ireland\'s Marketplace for Machinery & Commercials';

// Contact/Support info
const SUPPORT_EMAIL = process.env.EMAIL_USER;
const SUPPORT_PHONE = '';
const COMPANY_LOCATION = 'Ireland';

// URLs (adjust based on your environment)
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://rexbid.ie';
const ADMIN_URL = `${process.env.FRONTEND_URL}/admin` || 'https://rexbid.ie/admin';

// ============================================
// DYNAMIC SPECIFICATIONS RENDERER (NO HARDCODED FIELDS)
// ============================================

// Simple, dynamic specification renderer - shows ALL fields, no hardcoding
const renderSpecifications = (specifications) => {
    if (!specifications) return '';

    // Handle Map
    let entries = [];
    if (specifications instanceof Map) {
        if (specifications.size === 0) return '';
        entries = Array.from(specifications.entries());
    }
    // Handle plain object
    else if (typeof specifications === 'object') {
        entries = Object.entries(specifications);
    }

    if (entries.length === 0) return '';

    let html = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';

    entries.forEach(([key, value]) => {
        const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());

        html += `
            <tr style="border-bottom: 1px solid ${BRAND_COLORS.grayBorder};">
                <td style="padding: 8px 12px; font-weight: 600; color: ${BRAND_COLORS.secondary}; width: 40%;">${label}:</td>
                <td style="padding: 8px 12px; color: ${BRAND_COLORS.text};">${value}</td>
            </tr>
        `;
    });

    html += '</table>';
    return html;
};

// Alternative simple vertical stack (if you prefer no table)
const renderSpecificationsSimple = (specifications) => {
    if (!specifications) return '';

    let specsObj = specifications;
    if (specifications instanceof Map) {
        specsObj = Object.fromEntries(specifications);
    }

    const entries = Object.entries(specsObj).filter(([key, value]) => {
        return value !== null && value !== undefined && value !== '';
    });

    if (entries.length === 0) return '';

    let html = '<div style="margin: 16px 0;">';

    entries.forEach(([key, value]) => {
        const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());

        html += `
            <div style="padding: 8px 0; border-bottom: 1px solid ${BRAND_COLORS.grayBorder};">
                <strong style="color: ${BRAND_COLORS.secondary};">${label}:</strong>
                <span style="color: ${BRAND_COLORS.text};"> ${value}</span>
            </div>
        `;
    });

    html += '</div>';
    return html;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Format currency (default EUR for Ireland)
const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return `${currency === 'GBP' ? '£' : '€'}0`;

    const symbols = {
        'EUR': '€',
        'GBP': '£',
        'USD': '$'
    };

    const symbol = symbols[currency] || currency;
    const locale = currency === 'GBP' ? 'en-GB' : 'en-IE';

    return `${symbol}${Number(amount)?.toFixed(0).toLocaleString(locale)}`;
};

// Get time remaining for auctions/end dates
const getTimeRemaining = (endDate) => {
    if (!endDate) return 'Time not available';

    const remaining = new Date(endDate) - new Date();
    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

// Simple info card (no emojis/icons)
const createInfoCard = (content, variant = 'default') => {
    const variants = {
        default: `background: ${BRAND_COLORS.grayBg}; border: 1px solid ${BRAND_COLORS.grayBorder}; border-radius: 12px; padding: 20px; margin: 20px 0;`,
        warning: `background: #fffbeb; border-left: 4px solid ${BRAND_COLORS.warning}; padding: 16px; border-radius: 8px; margin: 20px 0;`,
        success: `background: #f0fdf4; border-left: 4px solid ${BRAND_COLORS.success}; padding: 16px; border-radius: 8px; margin: 20px 0;`
    };
    return `<div style="${variants[variant]}">${content}</div>`;
};

// Two-column summary row (flex layout)
const createSummaryRow = (label, value) => `
    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${BRAND_COLORS.grayBorder};">
        <span style="font-weight: 600; color: ${BRAND_COLORS.secondary};">${label}</span>
        <span style="color: ${BRAND_COLORS.text};">${value}</span>
    </div>
`;

// URL box for links
const createUrlBox = (url) => `
    <div style="background: ${BRAND_COLORS.grayBg}; padding: 12px 16px; border-radius: 12px; font-family: monospace; font-size: 13px; word-break: break-all; margin: 16px 0; border: 1px solid ${BRAND_COLORS.grayBorder};">
        ${url}
    </div>
`;

// Button generator
const createButton = (text, url, variant = 'primary') => {
    const colors = {
        primary: `background: ${BRAND_COLORS.primary}; color: #ffffff;`,
        secondary: `background: ${BRAND_COLORS.secondary}; color: #ffffff;`,
        outline: `background: transparent; border: 2px solid ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.primary};`
    };

    return `
        <div style="text-align: center; margin: 20px 0;">
            <a href="${url}" style="display: inline-block; ${colors[variant]} padding: 12px 28px; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 15px;">
                ${text}
            </a>
        </div>
    `;
};

// ============================================
// BASE EMAIL TEMPLATE (RexBid branding)
// ============================================

const baseTemplate = (content, title = BRAND_NAME) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #f4f6f9;
            color: ${BRAND_COLORS.text};
        }
        .container {
            max-width: 560px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02);
        }
        .content {
            padding: 32px 40px;
        }
        @media (max-width: 600px) {
            .content {
                padding: 24px 20px;
            }
        }
        .footer {
            background: ${BRAND_COLORS.grayBg};
            padding: 24px 40px;
            text-align: center;
            color: ${BRAND_COLORS.textLight};
            font-size: 12px;
            border-top: 1px solid ${BRAND_COLORS.grayBorder};
        }
        .footer a {
            color: ${BRAND_COLORS.primary};
            text-decoration: none;
            margin: 0 8px;
        }
        .divider {
            height: 1px;
            background: ${BRAND_COLORS.grayBorder};
            margin: 24px 0;
        }
        h2 {
            font-size: 22px;
            text-align: center;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: ${BRAND_COLORS.secondary};
        }
        h3 {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
            color: ${BRAND_COLORS.secondary};
        }
        a {
            color: ${BRAND_COLORS.primary};
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <!-- RexBid Header: Brand name + tagline -->
            <div style="text-align: center; margin-bottom: 28px;">
                <h1 style="color: ${BRAND_COLORS.secondary}; font-size: 32px; margin: 0; letter-spacing: -0.5px;">${BRAND_NAME}</h1>
                <div style="width: 60px; height: 3px; background: ${BRAND_COLORS.primary}; margin: 12px auto 0;"></div>
                <p style="color: ${BRAND_COLORS.textLight}; font-size: 13px; margin: 12px 0 0 0;">${BRAND_TAGLINE}</p>
            </div>
            ${content}
        </div>
        <div class="footer">
            <p style="margin: 0 0 12px 0;">${BRAND_NAME} · Support Team</p>
            <p style="margin: 0 0 12px 0;">${COMPANY_LOCATION} | <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            <p style="margin: 0;">
                <a href="${FRONTEND_URL}/contact">Help Center</a> ·
                <a href="${FRONTEND_URL}/privacy-policy">Privacy Policy</a>
            </p>
            <p style="margin: 20px 0 0 0; font-size: 11px;">© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
// this is different function to convert the amount from one currency to another using the cached exchange rates.
const convertRawAmount = (amount, fromCurrency, toCurrency) => {
    if (!amount) return 0;
    if (fromCurrency === toCurrency) return amount;

    const rates = getCachedRates();
    if (!rates) return amount;

    const rate = rates[fromCurrency]?.rates[toCurrency];
    if (!rate) return amount;

    return parseFloat((amount * rate).toFixed(2));
};

// Email Templates

// 1. Contact email for admin
const contactEmail = async (name, email, phone, userType = "Bidder", message) => {
    try {
        const content = `
            <h2 style="text-align: center;">New Contact Form Submission</h2>
            
            ${createInfoCard(`
                ${createSummaryRow('Full Name:', name)}
                ${createSummaryRow('Email:', `<a href="mailto:${email}" style="color: ${BRAND_COLORS.primary};">${email}</a>`)}
                ${createSummaryRow('Phone:', phone || 'Not provided')}
                ${createSummaryRow('User Type:', userType)}
            `)}
            
            <div style="margin: 20px 0;">
                <strong style="color: ${BRAND_COLORS.secondary};">Message:</strong>
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 16px; border-radius: 8px; margin-top: 8px; border: 1px solid ${BRAND_COLORS.grayBorder};">
                    ${message}
                </div>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background: ${BRAND_COLORS.grayBg}; border-radius: 8px; border-left: 4px solid ${BRAND_COLORS.primary};">
                <p style="margin: 0; color: ${BRAND_COLORS.secondary}; font-size: 14px;">
                    <strong>Recommended Action:</strong> Respond within 24 hours for best customer engagement.
                </p>
            </div>
        `;

        const html = baseTemplate(content, 'New Contact Query');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New Contact Query - ${name}`,
            html
        });

        return !!info;
    } catch (error) {
        throw new Error(error);
    }
};

// 2. Contact confirmation email to user
const contactConfirmationEmail = async (name, email) => {
    try {
        const content = `
            <h2 style="text-align: center;">Thank You for Contacting Us</h2>
            
            ${createInfoCard(`
                <p style="margin: 0 0 16px 0; font-size: 18px; color: ${BRAND_COLORS.secondary};">Dear ${name},</p>
                
                <p style="margin: 0 0 16px 0;">
                    Thank you for reaching out to <strong>${BRAND_NAME}</strong>. We have successfully received your inquiry and appreciate you taking the time to contact us.
                </p>
                
                <p style="margin: 0 0 16px 0;">
                    Our dedicated team is currently reviewing your message and will get back to you within <strong>24-48 hours</strong>.
                </p>
                
                <p style="margin: 0;">
                    We're committed to providing you with the best possible service and look forward to assisting you with your auction needs.
                </p>
            `, 'default')}
            
            <div style="background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                <div style="color: ${BRAND_COLORS.primary}; font-size: 18px; margin-bottom: 10px; font-weight: bold;">Need Immediate Assistance?</div>
                <div style="font-size: 14px; margin-bottom: 15px; opacity: 0.9;">
                    If your inquiry requires urgent attention, please contact our support team directly for faster service.
                </div>
            </div>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 14px; border: 1px solid ${BRAND_COLORS.grayBorder};">
                <p style="margin: 0 0 8px 0;"><strong style="color: ${BRAND_COLORS.secondary};">Phone Support:</strong> Available Monday-Friday, 9:00 AM - 6:00 PM</p>
                <p style="margin: 0;"><strong style="color: ${BRAND_COLORS.secondary};">Email Support:</strong> <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_COLORS.primary};">${SUPPORT_EMAIL}</a></p>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid ${BRAND_COLORS.grayBorder};">
                <p style="margin: 5px 0;">Best regards,</p>
                <p style="margin: 5px 0;"><strong>The ${BRAND_NAME} Team</strong></p>
            </div>
        `;

        const html = baseTemplate(content, 'Thank You');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Thank You for Contacting ${BRAND_NAME}`,
            html
        });

        return !!info;
    } catch (error) {
        throw new Error(error);
    }
};

// 3. Welcome email for user
const welcomeEmail = async (user) => {
    try {
        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="text-align: center;">Welcome to ${BRAND_NAME}, ${user.firstName || user.companyName || user.username}!</h2>
            </div>
            
            <p>We're thrilled to welcome you to ${BRAND_NAME}. Your ${user.userType || 'bidder'} account has been successfully created.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0;"><strong>Account Details</strong></p>
                ${createSummaryRow('Name:', `${user.firstName || ''} ${user.lastName || ''}`)}
                ${createSummaryRow('Email:', user.email)}
                ${createSummaryRow('Account Type:', user.userType || 'Bidder')}
            `)}
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Go to Profile', `${FRONTEND_URL}/${user?.userType || 'bidder'}/profile`, 'primary')}
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
                ${createButton('Browse Auctions', `${FRONTEND_URL}/auctions`, 'outline')}
            </div>
            
            <p>Need help getting started? Check out our FAQ section or contact our support team - we're here to help!</p>
        `;

        const html = baseTemplate(content, `Welcome, ${user.firstName || user.companyName || user.username}`);

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Welcome to ${BRAND_NAME}, ${user.firstName || user.companyName || user.username}!`,
            html
        });

        console.log(`Welcome email sent to ${user.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send welcome email:`, error);
        return false;
    }
};

// 4. New user registered for admin
const newUserRegistrationEmail = async (adminEmail, user) => {
    try {
        const userTypeDisplay = (user.userType || "bidder").charAt(0).toUpperCase() + (user.userType || "bidder").slice(1);

        const content = `
            <h2 style="text-align: center;">New User Registration</h2>
            <p style="text-align: center;">A new user has successfully registered on ${BRAND_NAME}.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0;"><strong>User Information</strong></p>
                ${createSummaryRow('Full Name:', `${user.firstName || ''} ${user.lastName || ''}`)}
                ${createSummaryRow('Username:', user.username || user.companyName || 'Not provided')}
                ${createSummaryRow('Email:', user.email)}
                ${createSummaryRow('Account Type:', userTypeDisplay)}
                ${createSummaryRow('Phone Number:', user.phone || 'Not provided')}
                ${createSummaryRow('Country:', user.countryName || 'Not provided')}
            `)}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.primary};">
                <p style="margin: 0 0 12px 0;"><strong>Admin Actions</strong></p>
                <p style="margin: 0 0 16px 0;">You can review this user's account, verify their details, or take necessary actions from the admin panel.</p>
                <div style="text-align: center;">
                    ${createButton('Go to User Management', `${FRONTEND_URL}/admin/users`, 'secondary')}
                </div>
            </div>
        `;

        const html = baseTemplate(content, 'New User Registration');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New User Registration - ${userTypeDisplay}`,
            html
        });

        console.log(`New user registration email sent to admin for ${user.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send new user registration email:`, error);
        return false;
    }
};

// 5. Reset password email
const resetPasswordEmail = async (email, url) => {
    try {
        const content = `
            <h2 style="text-align: center;">Password Reset Request</h2>
            <p style="text-align: center;">We received a request to reset your ${BRAND_NAME} password.</p>
            
            ${createInfoCard(`
                <p>To reset your password, please click the button below. This link will expire in <strong>1 hour</strong> for security purposes.</p>
                
                ${createButton('Reset Password Now', url, 'primary')}
                
                <p style="margin-top: 16px; margin-bottom: 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
                ${createUrlBox(url)}
            `, 'warning')}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid ${BRAND_COLORS.grayBorder};">
                <p style="margin: 0 0 12px 0;"><strong>Create a Secure Password</strong></p>
                <p style="margin: 0 0 8px 0;">• Use at least 8 characters</p>
                <p style="margin: 0 0 8px 0;">• Include uppercase and lowercase letters</p>
                <p style="margin: 0 0 8px 0;">• Add numbers and special characters</p>
                <p style="margin: 0 0 8px 0;">• Avoid using personal information</p>
                <p style="margin: 0;">• Don't reuse passwords from other websites</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.warning};">
                <p style="margin: 0;"><strong>Important Security Notice:</strong> If you did NOT request this password reset, please ignore this email. Your account remains secure.</p>
            </div>
            
            <p>After resetting your password, you can log in to your ${BRAND_NAME} account and continue browsing our diverse selection of items.</p>
        `;

        const html = baseTemplate(content, 'Password Reset');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Reset Your ${BRAND_NAME} Password`,
            html
        });

        return !!info;
    } catch (error) {
        throw new Error(`Failed to send reset password email: ${error.message}`);
    }
};

// 6. Auction submitted for admin approval
const auctionSubmittedForApprovalEmail = async (adminEmail, auction, seller) => {
    try {
        const content = `
            <h2 style="text-align: center;">New Listing Awaiting Approval</h2>
            <p style="text-align: center;">A seller has submitted a new listing for review. The listing requires your approval before it can go live.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0;"><strong>Listing Information</strong></p>
                ${createSummaryRow('Title:', auction.title)}
                ${auction.subTitle ? createSummaryRow('Subtitle:', auction.subTitle) : ''}
                ${createSummaryRow('Categories:', auction?.categories?.join(', ') || 'N/A')}
                ${createSummaryRow('Location:', auction?.location || 'Not specified')}
                ${createSummaryRow('Listing Type:', auction?.auctionType ? auction.auctionType.toUpperCase() : 'N/A')}
                ${auction?.allowOffers ? createSummaryRow('Offers:', 'Allowed') : ''}
            `)}
            
            ${auction.specifications ? `
                <div style="margin: 20px 0;">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Specifications</strong>
                    ${renderSpecifications(auction.specifications)}
                </div>
            ` : ''}
            
            ${auction.description ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid ${BRAND_COLORS.grayBorder};">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Description</strong>
                    <p style="margin: 8px 0 0 0;">${auction.description.substring(0, 200)}${auction.description.length > 200 ? '...' : ''}</p>
                </div>
            ` : ''}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.primary};">
                <p style="margin: 0 0 12px 0;"><strong>Seller Information</strong></p>
                ${createSummaryRow('Name:', `${seller.firstName || seller.companyName || seller.username} ${seller.lastName || ''}`)}
                ${createSummaryRow('Username:', seller.username || seller.companyName)}
            </div>
            
            <div style="background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 12px 0;"><strong>Admin Action Required</strong></p>
                <p style="margin: 0 0 16px 0;">Please review this listing to ensure timely activation.</p>
                ${createButton('Review Listings', `${FRONTEND_URL}/admin/auctions/all`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Listing Approval Required');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New Listing for Approval - ${auction.title}`,
            html
        });

        console.log(`Listing submission email sent to admin for auction ${auction._id}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send listing submission email:`, error);
        return false;
    }
};

// 7. Auction approved and live for seller
const auctionApprovedEmail = async (seller, listing) => {
    try {
        const content = `
            <h2 style="text-align: center;">Listing Approved and Live</h2>
            <p style="text-align: center;">Great news! Your listing has been approved and is now live on ${BRAND_NAME}.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0;"><strong>Listing Details</strong></p>
                ${createSummaryRow('Title:', listing.title)}
                ${listing.subTitle ? createSummaryRow('Subtitle:', listing.subTitle) : ''}
                ${createSummaryRow('Listing Type:', listing?.auctionType ? listing.auctionType.toUpperCase() : 'N/A')}
                ${listing?.allowOffers ? createSummaryRow('Offers:', 'Allowed') : ''}
                ${listing?.buyNowPrice ? createSummaryRow('Buy Now Price:', formatCurrency(listing.buyNowPrice)) : ''}
                ${createSummaryRow('Listing Price:', formatCurrency(listing?.startPrice))}
            `)}
            
            ${listing.specifications && listing.specifications.size > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                    ${renderSpecifications(listing.specifications)}
                </div>
            ` : ''}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 12px 16px; border-radius: 12px; margin: 20px 0; word-break: break-all;">
                <strong>Your Listing URL:</strong><br>
                <a href="${FRONTEND_URL}/auction/${listing?._id}" style="color: ${BRAND_COLORS.primary};">${FRONTEND_URL}/auction/${listing?._id}</a>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Your Live Listing', `${FRONTEND_URL}/auction/${listing?._id}`, 'primary')}
            </div>
            
            <p>Your item is now searchable and visible to our community. We wish you a quick and successful sale!</p>
            
            <p>For any questions about the selling process or if you need assistance, our support team is here to help.</p>
        `;

        const html = baseTemplate(content, 'Listing Approved');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `Your Listing is Live: ${listing?.title}`,
            html
        });

        console.log(`Listing approved email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send listing approved email:`, error);
        return false;
    }
};

// 8. Auction listed and live for seller (working one)
const auctionListedEmail = async (listing, seller) => {
    try {
        const content = `
            <h2>Your Listing is Now Live</h2>
            <p>Great news! Your listing is now active and visible to potential buyers on ${BRAND_NAME}.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0;"><strong>Listing Details</strong></p>
                ${createSummaryRow('Title:', listing.title)}
                ${listing.subTitle ? createSummaryRow('Subtitle:', listing.subTitle) : ''}
                ${createSummaryRow('Listing Type:', listing?.auctionType ? listing.auctionType.toUpperCase() : 'N/A')}
                ${listing?.allowOffers ? createSummaryRow('Offers:', 'Allowed') : ''}
                ${listing?.buyNowPrice ? createSummaryRow('Buy Now Price:', formatCurrency(listing.buyNowPrice)) : ''}
                ${createSummaryRow('Listing Price:', formatCurrency(listing?.startPrice))}
            `)}
            
            ${listing.specifications && listing.specifications.size > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                    ${renderSpecifications(listing.specifications)}
                </div>
            ` : ''}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 12px 16px; border-radius: 12px; margin: 20px 0; word-break: break-all;">
                <strong>Your Listing URL:</strong><br>
                <a href="${FRONTEND_URL}/auction/${listing?._id}" style="color: ${BRAND_COLORS.primary};">${FRONTEND_URL}/auction/${listing?._id}</a>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Your Live Listing', `${FRONTEND_URL}/auction/${listing?._id}`, 'primary')}
            </div>
            
            <p>We wish you a quick and successful sale!</p>
        `;

        const html = baseTemplate(content, 'Listing Live');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `Your Listing is Live on ${BRAND_NAME}: ${listing?.title}`,
            html
        });

        console.log(`Listing live email sent to seller ${seller?.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send listing live email:`, error);
        return false;
    }
};

// 9. New auction listed notification for bidders (based on interests/categories) - sent when auction goes live or is coming soon
const newAuctionNotificationEmail = async (bidder, listing, seller) => {
    try {
        const isLive = listing?.status === "active" || listing?.status === "approved";
        const listingStatus = isLive ? "Live Now" : "Coming Soon";

        let primaryAction = "View Details";

        if (isLive) {
            if (listing.auctionType === "buy_now" && listing?.buyNowPrice) {
                primaryAction = "Buy Now";
            } else if (listing.allowOffers) {
                primaryAction = "Make Offer";
            } else {
                primaryAction = "View Details";
            }
        }

        const content = `
            <h2 style="text-align: center;">New Listing: ${listing?.title}</h2>
            <p style="text-align: center;">We're excited to let you know about a new listing on ${BRAND_NAME}.</p>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; font-size: 14px; font-weight: bold; color: ${BRAND_COLORS.secondary};">
                ${listingStatus}
            </div>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0;"><strong>Listing Details</strong></p>
                ${createSummaryRow('Title:', listing.title)}
                ${listing.subTitle ? createSummaryRow('Subtitle:', listing.subTitle) : ''}
                ${createSummaryRow('Categories:', listing?.categories?.join(', ') || 'N/A')}
                ${createSummaryRow('Location:', listing?.location || 'Not specified')}
                ${createSummaryRow('Listing Type:', listing?.auctionType ? listing.auctionType.toUpperCase() : 'N/A')}
                ${listing?.allowOffers ? createSummaryRow('Offers:', 'Allowed') : ''}
            `)}
            
            ${listing.specifications && listing.specifications.size > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Specifications</strong>
                    ${renderSpecifications(listing.specifications)}
                </div>
            ` : ''}
            
            ${listing?.description ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid ${BRAND_COLORS.grayBorder};">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Description</strong>
                    <p style="margin: 8px 0 0 0;">${listing?.description.substring(0, 200)}${listing?.description.length > 200 ? '...' : ''}</p>
                </div>
            ` : ''}
            
            ${isLive ? `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.warning};">
                    <p style="margin: 0; font-weight: bold;">Available Now</p>
                    <p style="margin: 8px 0 0 0;">${listing?.buyNowPrice ? "Use Buy Now to secure it immediately or place a bid." : listing?.allowOffers ? "Make an offer to start negotiations." : "Place a bid to compete for this item."}</p>
                </div>
            ` : `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.warning};">
                    <p style="margin: 0; font-weight: bold;">Coming Soon</p>
                    <p style="margin: 8px 0 0 0;">This item will be available shortly.</p>
                </div>
            `}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Seller Information</strong></p>
                <p style="margin: 0;">${seller?.companyName || seller?.username}</p>
                <p style="margin: 0;">${seller?.firstName} ${seller?.lastName}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton(primaryAction, `${FRONTEND_URL}/auction/${listing?._id}`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'New Listing');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: bidder.email,
            subject: `New Listing: ${listing?.title}`,
            html
        });

        console.log(`New listing notification sent to bidder ${bidder?.email} for listing ${listing?._id}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send new listing notification:`, error);
        return false;
    }
};

// 10. Bulk send new listing notifications to multiple bidders (used when a new auction goes live to notify all interested bidders)
const sendBulkAuctionNotifications = async (bidders, listing, seller) => {
    try {
        const notificationPromises = bidders?.map(async (bidder) => {
            try {
                if (bidder?.preferences) {
                    await newAuctionNotificationEmail(bidder, listing, seller);
                    return { success: true, email: bidder.email };
                }
                return {
                    success: false,
                    email: bidder?.email,
                    reason: "Notifications disabled",
                };
            } catch (error) {
                console.error(
                    `Failed to send notification to ${bidder?.email}:`,
                    error.message
                );
                return { success: false, email: bidder?.email, error: error.message };
            }
        });

        const results = await Promise.allSettled(notificationPromises);

        const successful = results.filter(
            (result) => result.status === "fulfilled" && result.value.success
        ).length;
        const failed = results.filter(
            (result) => result.status === "fulfilled" && !result.value.success
        ).length;
        const errors = results.filter(
            (result) => result.status === "rejected"
        ).length;

        console.log(
            `Bulk listing notifications completed: ${successful} successful, ${failed} skipped/failed, ${errors} errors`
        );

        return {
            total: bidders.length,
            successful,
            failed,
            errors,
        };
    } catch (error) {
        console.error("Error in bulk listing notifications:", error);
        throw error;
    }
};

// 11. Bid confirmation email for bidder
const bidConfirmationEmail = async (
    userEmail,
    userName,
    listing,
    amount,
    currentBid,
    userCurrency
) => {
    try {
        const isWinning = amount >= currentBid;

        const content = `
            <h2 style="text-align: center;">Your Bid Has Been Confirmed</h2>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 20px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                
                <p style="margin: 15px 0; font-size: 24px; font-weight: bold; color: ${BRAND_COLORS.secondary};">Bid Amount: ${formatCurrency(amount, userCurrency)}</p>
                
                ${createSummaryRow('Your Bid Amount:', formatCurrency(amount, userCurrency))}
                ${createSummaryRow('Current Highest Bid:', formatCurrency(currentBid, userCurrency))}
                ${createSummaryRow('Your Position:', isWinning ? 'Leading' : 'Leading')}
            `)}
            
            <p>Thank you for placing your bid on <strong>${listing.title}</strong> on ${BRAND_NAME}.</p>
            <p>We'll notify you immediately if you are outbid or when the listing ends.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Listing Details', `${FRONTEND_URL}/auction/${listing._id}`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Bid Confirmation');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Bid Confirmation - ${listing.title}`,
            html
        });

        return !!info;
    } catch (error) {
        throw new Error(`Failed to send bid confirmation: ${error.message}`);
    }
};

// 12. New bid notification for seller
const newBidNotificationEmail = async (seller, listing, bidAmount, bidder, userCurrency) => {
    try {
        const content = `
            <h2 style="text-align: center;">New Bid Received</h2>
            <p style="text-align: center;">Great news! Your listing has received a new bid.</p>
            
            ${createInfoCard(`
                <p style="margin: 15px 0; font-size: 32px; font-weight: bold; color: ${BRAND_COLORS.secondary}; text-align: center;">${formatCurrency(bidAmount, userCurrency)}</p>
                
                ${createSummaryRow('Listing:', listing.title)}
                ${createSummaryRow('Current Price:', formatCurrency(listing.currentPrice || 0, userCurrency))}
                ${createSummaryRow('Total Bids:', (listing.bidCount || 0).toLocaleString())}
            `)}
            
            ${listing.specifications && listing.specifications.size > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                    ${renderSpecifications(listing.specifications)}
                </div>
            ` : ''}
            
            ${bidder ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0 0 8px 0;"><strong>Bidder Information</strong></p>
                    <p style="margin: 0;">${bidder.username || bidder.companyName}</p>
                    <p style="margin: 0;">${bidder.firstName} ${bidder.lastName}</p>
                </div>
            ` : ''}
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Listing Details', `${FRONTEND_URL}/auction/${listing._id}`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'New Bid Received');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `New Bid Received - ${listing.title}`,
            html
        });

        console.log(`New bid notification sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send new bid notification:`, error);
        return false;
    }
};

// 13. Offer confirmation email for bidder
const offerConfirmationEmail = async (
    userEmail,
    userName,
    listing,
    offerAmount,
    listingPrice,
    offerId,
    userCurrency
) => {
    try {
        const content = `
            <h2 style="text-align: center;">Your Offer Has Been Submitted</h2>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 20px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                
                <p style="margin: 15px 0; font-size: 28px; font-weight: bold; color: ${BRAND_COLORS.secondary}; text-align: center;">${formatCurrency(offerAmount, userCurrency)}</p>
                
                <div style="background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 8px 15px; border-radius: 20px; display: inline-block; font-size: 14px; margin: 10px 0;">
                    Offer ID: ${offerId}
                </div>
                
                ${createSummaryRow('Your Offer Amount:', formatCurrency(offerAmount, userCurrency))}
                ${createSummaryRow('Listing Price:', formatCurrency(listingPrice, userCurrency))}
                ${createSummaryRow('Offer Difference:', formatCurrency(offerAmount - listingPrice, userCurrency))}
            `)}
            
            ${listing.specifications && listing.specifications.size > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                    ${renderSpecifications(listing.specifications)}
                </div>
            ` : ''}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; font-weight: bold;">What Happens Next</p>
                <p style="margin: 8px 0 0 0;">The seller has 48 hours to respond to your offer. We'll notify you immediately when they respond.</p>
            </div>
            
            <p>Thank you for submitting your offer for <strong>${listing.title}</strong> on ${BRAND_NAME}.</p>
            <p>We have notified the seller of your offer and they have 48 hours to respond.</p>
        `;

        const html = baseTemplate(content, 'Offer Submitted');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Offer Submitted - ${listing.title}`,
            html
        });

        return !!info;
    } catch (error) {
        throw new Error(`Failed to send offer confirmation: ${error.message}`);
    }
};

// 14. New offer notification for seller
const newOfferNotificationEmail = async (seller, listing, offerAmount, bidder, userCurrency) => {
    try {
        const content = `
            <h2 style="text-align: center;">New Offer Received</h2>
            <p style="text-align: center;">A potential bidder has made an offer on your listing.</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <p style="font-size: 36px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${formatCurrency(offerAmount, userCurrency)}</p>
            </div>
            
            ${createInfoCard(`
                ${createSummaryRow('Offer Amount:', formatCurrency(offerAmount, userCurrency))}
                ${createSummaryRow('Listing Price:', formatCurrency(listing?.startPrice || listing?.buyNowPrice || 0, userCurrency))}
                ${createSummaryRow('Item:', listing?.title)}
            `)}
            
            ${listing.specifications && listing.specifications.size > 0 ? `
                <div style="margin: 20px 0;">
                    <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                    ${renderSpecifications(listing.specifications)}
                </div>
            ` : ''}
            
            ${bidder ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0 0 8px 0;"><strong>Bidder Information</strong></p>
                    <p style="margin: 0;">Full Name: ${bidder?.firstName} ${bidder?.lastName}</p>
                    <p style="margin: 0;">Username: ${bidder?.username || bidder?.companyName}</p>
                </div>
            ` : ''}
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center; border-left: 4px solid ${BRAND_COLORS.warning};">
                <p style="margin: 0; font-weight: bold;">Respond Within 48 Hours</p>
                <p style="margin: 8px 0 0 0;">Offers typically expire after 48 hours. Respond promptly to keep the bidder engaged.</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Review Offers', `${FRONTEND_URL}/seller/offers/all`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'New Offer Received');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: seller?.email,
            subject: `New Offer Received - ${listing?.title}`,
            html
        });

        console.log(`New offer notification sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send new offer notification:`, error);
        return false;
    }
};

// 15. Outbid notification for bidder
const outbidNotificationEmail = async (
    userEmail,
    userName,
    listing,
    newBid,
    listingUrl,
    outBidderCurrency
) => {
    try {
        const content = `
            <h2 style="text-align: center;">You've Been Outbid</h2>
            <p style="text-align: center;">Another bidder has placed a higher bid on an item you were bidding on.</p>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.danger};">
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                
                <p style="margin: 15px 0; font-size: 24px; font-weight: bold; color: ${BRAND_COLORS.secondary};">New Highest Bid: ${formatCurrency(newBid, outBidderCurrency)}</p>
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 20px 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            </div>
            
            <div style="text-align: center; padding: 25px; background: ${BRAND_COLORS.grayBg}; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">Place a new bid to regain your position.</p>
                
                <div style="margin: 20px 0;">
                    ${createButton('Place New Bid Now', listingUrl, 'primary')}
                </div>
                
                <div>
                    <a href="${FRONTEND_URL}/bidder/bids" style="display: inline-block; background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin: 5px;">View All Your Bids</a>
                    <a href="${FRONTEND_URL}/auctions" style="display: inline-block; background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin: 5px;">Browse Other Listings</a>
                </div>
            </div>
            
            <p>Dear ${userName},</p>
            <p>This is an automated notification to let you know that another bidder has placed a higher bid on <strong>${listing.title}</strong>.</p>
            <p>Act quickly. The sooner you place your next bid, the better your chances of winning.</p>
        `;

        const html = baseTemplate(content, 'Outbid Notification');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `You've Been Outbid - ${listing.title}`,
            html
        });

        return !!info;
    } catch (error) {
        throw new Error(`Failed to send outbid notification: ${error.message}`);
    }
};

const DEBOUNCE_DELAY = 5000; // 5 seconds
const lastNotificationTimes = new Map(); // Store last notification time per auction

// 16. Bulk outbid notifications for multiple bidders
const sendOutbidNotifications = async (
    auction,
    previousHighestBidder,
    previousBidders,
    currentBidderId,
    newBidAmount,
    outBidderCurrency
) => {
    try {
        const auctionId = auction._id.toString();

        // Per-auction debounce check
        const now = Date.now();
        const lastTime = lastNotificationTimes.get(auctionId) || 0;

        if (now - lastTime < DEBOUNCE_DELAY) {
            console.log(
                `Outbid notifications debounced for auction ${auctionId} - too frequent`
            );
            return;
        }
        lastNotificationTimes.set(auctionId, now);

        // Get all unique bidders who should be notified
        const biddersToNotify = previousBidders.filter(
            (bidderId) => bidderId !== currentBidderId.toString()
        );

        if (biddersToNotify.length === 0) {
            console.log("No bidders to notify for outbid");
            return;
        }

        // Get user details for all bidders to notify
        const User = (await import("../models/user.model.js")).default;
        const users = await User.find({
            _id: { $in: biddersToNotify },
            "preferences.outbidNotifications": true,
        });

        if (users.length === 0) {
            console.log("No users found with outbid notifications enabled");
            return;
        }

        // Create auction URL
        const auctionUrl = `${process.env.FRONTEND_URL}/auction/${auction._id}`;

        // Send notifications to each outbid user
        const notificationPromises = users.map(async (user) => {
            try {
                await outbidNotificationEmail(
                    user.email,
                    user.username || user?.companyName || `${user.firstName} ${user.lastName}`,
                    auction,
                    newBidAmount,
                    auctionUrl,
                    outBidderCurrency
                );
            } catch (error) {
                console.error(
                    `Failed to send outbid notification to ${user.email}:`,
                    error.message
                );
            }
        });

        const results = await Promise.allSettled(notificationPromises);

        // Log summary
        const successful = results.filter(
            (result) => result.status === "fulfilled"
        ).length;
        const failed = results.filter(
            (result) => result.status === "rejected"
        ).length;

        console.log(
            `Outbid notifications for auction ${auctionId}: ${successful} successful, ${failed} failed`
        );
    } catch (error) {
        console.error("Error sending outbid notifications:", error);
    }
};

// 17. Auction ending soon notification for bidders
const auctionEndingSoonEmail = async (
    userEmail,
    userName,
    listing
) => {
    try {
        const content = `
            <h2 style="text-align: center;">Listing Expiring Soon</h2>
            <p style="text-align: center;">Time is running out to get this item.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${createSummaryRow('Listing Type:', listing?.auctionType || 'N/A')}
                ${createSummaryRow('Current Offers/Bids:', (listing?.offers?.length || listing?.bids?.length || 0).toLocaleString())}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <p>The listing for <strong>${listing?.title}</strong> is about to expire. Once expired, this item will no longer be available for purchase.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Listing Now', `${FRONTEND_URL}/auction/${listing._id}`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Listing Expiring Soon');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Listing Expires Soon: ${listing?.title}`,
            html
        });

        return !!info;
    } catch (error) {
        console.error(`Failed to send listing expiring soon email:`, error);
        return false;
    }
};

// 18. Auction ended notification for seller (with final status - sold/unsold)
const sendAuctionEndedSellerEmail = async (listing) => {
    try {
        // Safety check - ensure seller is populated and has email
        if (
            !listing?.seller ||
            typeof listing?.seller === "string" ||
            !listing?.seller?.email
        ) {
            console.error("Seller not populated or missing email for listing:", listing?._id);
            return false;
        }

        const isSold = listing?.status === "sold" || listing?.status === "sold_buy_now";
        const statusMessage = isSold
            ? `Sold for ${formatCurrency(listing?.finalPrice || 0)}`
            : "Listing ended without sale";

        const content = `
            <h2 style="text-align: center;">${isSold ? 'Item Sold' : 'Listing Ended'}</h2>
            <p style="text-align: center;">${statusMessage}</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                
                ${listing?.finalPrice ? `
                    <p style="margin: 15px 0; font-size: 24px; font-weight: bold; color: ${BRAND_COLORS.secondary}; text-align: center;">${formatCurrency(listing?.finalPrice, listing?.seller?.currency)}</p>
                ` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
                
                ${createSummaryRow('Final Status:', listing?.status?.toUpperCase() || 'N/A')}
                ${createSummaryRow('Original Price:', formatCurrency(listing?.buyNowPrice || listing?.startPrice || 0, listing?.seller?.currency))}
                ${createSummaryRow('Total Offers:', (listing?.offers?.length || 0).toLocaleString())}
                ${createSummaryRow('Total Views:', (listing?.views || 0).toLocaleString())}
            `)}
            
            ${isSold && listing?.winner ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.success};">
                    <p style="margin: 0 0 8px 0;"><strong>Congratulations! Your item has been sold.</strong></p>
                    <p style="margin: 0;">Buyer details will be shared after payment confirmation.</p>
                </div>
            ` : `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.warning};">
                    <p style="margin: 0;"><strong>No Sale This Time</strong></p>
                    <p style="margin: 8px 0 0 0;">Your listing ended without a sale.</p>
                </div>
            `}
            
            <p>Dear ${listing?.seller?.firstName || listing?.seller?.companyName || listing?.seller?.username},</p>
            <p>Your listing for <strong>${listing?.title}</strong> on ${BRAND_NAME} has ended.</p>
        `;

        const html = baseTemplate(content, isSold ? 'Item Sold' : 'Listing Ended');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: listing?.seller?.email,
            subject: `Your Listing Has Ended - ${listing?.title}`,
            html
        });
        return !!info;
    } catch (error) {
        console.error(`Failed to send listing ended email to seller for listing ${listing?._id}:`, error);
        return false;
    }
};
// 19. Auction won notification for bidder
const sendAuctionWonEmail = async (listing) => {
    try {
        // Safety check - ensure winner is populated and has email
        if (
            !listing?.winner ||
            typeof listing?.winner === "string" ||
            !listing?.winner.email
        ) {
            console.error(
                "Winner not populated or missing email for listing:",
                listing?._id
            );
            return false;
        }

        const finalPrice = listing?.finalPrice || listing?.currentPrice || 0;

        const content = `
            <h2 style="text-align: center;">Congratulations! You Won the Listing</h2>
            <p style="text-align: center;">You are the winning bidder for this item.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                <p style="margin: 15px 0; font-size: 24px; font-weight: bold; color: ${BRAND_COLORS.secondary}; text-align: center;">${formatCurrency(convertRawAmount(finalPrice, listing?.baseCurrency, listing?.winner?.currency), listing?.winner?.currency)}</p>
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
                
                ${createSummaryRow('Invoice Number:', listing?.transactionId || `INV-${listing?._id?.toString()?.toUpperCase()}`)}
                ${createSummaryRow('Total Amount Due:', formatCurrency(convertRawAmount(finalPrice, listing?.baseCurrency, listing?.winner?.currency), listing?.winner?.currency))}
            `)}
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Confirm Payment', `mailto:${SUPPORT_EMAIL}?subject=Payment%20Confirmation%20-%20${listing?.title}`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Invoice');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: listing?.winner?.email,
            subject: `Invoice - ${listing?.title}`,
            html
        });

        console.log(`Listing won invoice email sent to ${listing?.winner?.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send listing won invoice email for listing ${listing._id}:`, error);
        return false;
    }
};

// 20. Auction won notification for admin
const auctionWonAdminEmail = async (adminEmail, adminCurrency, listing, buyer) => {
    try {
        const content = `
            <h2 style="text-align: center;">Item Sold</h2>
            <p style="text-align: center;">A listing has been successfully completed with a buyer.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                <p style="margin: 15px 0; font-size: 24px; font-weight: bold; color: ${BRAND_COLORS.secondary}; text-align: center;">${formatCurrency(convertRawAmount(listing?.finalPrice || listing?.startPrice || listing?.buyNowPrice || 0, listing?.baseCurrency, adminCurrency) || 0, adminCurrency)}</p>
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
                
                ${createSummaryRow('Sale Type:', listing?.auctionType || 'N/A')}
                ${createSummaryRow('Categories:', listing?.categories?.join(', ') || 'N/A')}
                ${createSummaryRow('Total Offers/Bids:', (listing?.offers?.length || listing?.bids?.length || 0).toLocaleString())}
                ${createSummaryRow('Sale Status:', 'Completed')}
                ${createSummaryRow('Payment:', listing?.paymentStatus || 'Pending')}
            `)}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 12px 0;"><strong>Buyer Information</strong></p>
                ${createSummaryRow('Name:', buyer?.firstName || buyer?.companyName || buyer?.username)}
                ${createSummaryRow('Username:', buyer?.username || buyer?.companyName)}
                ${createSummaryRow('Email:', buyer?.email)}
                ${createSummaryRow('Phone:', buyer?.phone || 'Not provided')}
            </div>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 12px 0;"><strong>Seller Information</strong></p>
                ${createSummaryRow('Name:', listing?.seller?.firstName || listing?.seller?.username || 'N/A')}
                ${createSummaryRow('Email:', listing?.seller?.email || 'N/A')}
                ${listing?.seller?.phone ? createSummaryRow('Phone:', listing?.seller?.phone) : ''}
            </div>
        `;

        const html = baseTemplate(content, 'Item Sold');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Item Sold - ${listing?.title}`,
            html
        });

        console.log(`Listing sold admin email sent for listing ${listing._id}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send listing sold admin email:`, error);
        return false;
    }
};

// 21. Auction ended notification for admin
const auctionEndedAdminEmail = async (adminEmail, adminCurrency, listing) => {
    try {
        const isSold = listing.status === "sold" || listing.status === "sold_buy_now";
        const statusDisplay = isSold ? 'Sold' : 'Ended';

        const content = `
            <h2 style="text-align: center;">Listing ${statusDisplay}</h2>
            <p style="text-align: center;">A listing on ${BRAND_NAME} has ended.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing?.finalPrice && isSold ? `
                    <p style="margin: 15px 0; font-size: 24px; font-weight: bold; color: ${BRAND_COLORS.secondary}; text-align: center;">${formatCurrency(convertRawAmount(listing?.finalPrice, listing?.baseCurrency, adminCurrency), adminCurrency)}</p>
                ` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
                
                ${createSummaryRow('Listing Type:', listing?.auctionType || 'N/A')}
                ${createSummaryRow('Categories:', listing?.categories?.join(', ') || 'N/A')}
                ${createSummaryRow('Original Price:', formatCurrency(convertRawAmount(listing?.startPrice || listing?.buyNowPrice || 0, listing?.baseCurrency, adminCurrency), adminCurrency))}
                ${createSummaryRow('Final Status:', listing?.status?.toUpperCase() || 'N/A')}
                ${createSummaryRow('Total Offers/Bids:', (listing?.offers?.length || listing?.bids?.length || 0).toLocaleString())}
                ${createSummaryRow('Total Views:', (listing?.views || 0).toLocaleString())}
                ${createSummaryRow('Listing ID:', listing?._id?.toString() || 'N/A')}
            `)}
            
            ${listing?.seller ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0 0 8px 0;"><strong>Seller Information</strong></p>
                    ${createSummaryRow('Name:', listing?.seller?.firstName || listing?.seller?.companyName || listing?.seller?.username)}
                    ${createSummaryRow('Email:', listing?.seller?.email)}
                    ${listing?.seller?.phone ? createSummaryRow('Phone:', listing?.seller?.phone) : ''}
                </div>
            ` : ''}
            
            ${listing.winner && isSold ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0 0 8px 0;"><strong>Buyer Information</strong></p>
                    ${createSummaryRow('Name:', listing?.winner?.firstName || listing?.winner?.companyName || listing?.winner?.username)}
                    ${createSummaryRow('Email:', listing?.winner?.email)}
                    ${listing?.winner?.phone ? createSummaryRow('Phone:', listing?.winner?.phone) : ''}
                </div>
            ` : ''}
        `;

        const html = baseTemplate(content, `Listing ${statusDisplay}`);

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Listing ${statusDisplay} - ${listing?.title}`,
            html
        });

        console.log(`Listing ended admin email sent for listing ${listing?._id} (Status: ${listing?.status})`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send listing ended admin email:`, error);
        return false;
    }
};

// 22. Offer accepted notification for bidder
const offerAcceptedEmail = async (
    buyerEmail,
    buyerName,
    buyerCurrency,
    seller,
    listing,
    offerAmount,
    offerId
) => {
    try {
        const content = `
            <h2 style="text-align: center;">Offer Accepted</h2>
            <p style="text-align: center;">Congratulations! The seller has accepted your offer.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
                
                ${createSummaryRow('Original Price:', formatCurrency(convertRawAmount(listing?.buyNowPrice || listing?.startPrice || 0, listing?.baseCurrency, buyerCurrency), buyerCurrency))}
                ${createSummaryRow('Offer ID:', offerId)}
            `)}
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Purchase', `${FRONTEND_URL}/bidder/offers`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Offer Accepted');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: buyerEmail,
            subject: `Offer Accepted - ${listing?.title}`,
            html
        });

        console.log(`Offer accepted email sent to buyer ${buyerEmail}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send offer accepted email:`, error);
        return false;
    }
};

// 23. Offer rejected notification for bidder
const offerRejectedEmail = async (
    buyerEmail,
    buyerName,
    buyerCurrency,
    seller,
    listing,
    offerAmount,
    offerId,
    reason,
) => {
    try {
        const content = `
            <h2 style="text-align: center;">Offer Declined</h2>
            <p style="text-align: center;">The seller has declined your offer.</p>
            
            ${reason ? `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.warning};">
                    <p style="margin: 0 0 8px 0;"><strong>Seller's Response</strong></p>
                    <p style="margin: 0;">${reason}</p>
                </div>
            ` : ''}
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
                
                ${createSummaryRow('Offer ID:', offerId)}
            `)}
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Browse Other Listings', `${FRONTEND_URL}/auctions`, 'primary')}
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
                <a href="${FRONTEND_URL}/auction/${listing._id}" style="display: inline-block; background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin: 5px;">Make New Offer</a>
                <a href="${FRONTEND_URL}/bidder/offers" style="display: inline-block; background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin: 5px;">My Offers</a>
            </div>
        `;

        const html = baseTemplate(content, 'Offer Declined');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: buyerEmail,
            subject: `Offer Declined - ${listing?.title}`,
            html
        });

        console.log(`Offer rejected email sent to buyer ${buyerEmail}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send offer rejected email:`, error);
        return false;
    }
};

// 24. Offer canceled notification for bidder
const offerCanceledEmail = async (
    buyerEmail,
    buyerName,
    buyerCurrency,
    seller,
    listing,
    offerAmount,
    offerId
) => {
    try {
        const content = `
            <h2 style="text-align: center;">Offer Canceled</h2>
            <p style="text-align: center;">Your offer has been canceled by the seller.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
                
                ${createSummaryRow('Offer ID:', offerId)}
            `)}
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Browse Other Listings', `${FRONTEND_URL}/auctions`, 'primary')}
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
                <a href="${FRONTEND_URL}/auctions?category=${listing?.categories?.[0]}" style="display: inline-block; background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Similar Items</a>
            </div>
        `;

        const html = baseTemplate(content, 'Offer Canceled');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: buyerEmail,
            subject: `Offer Canceled - ${listing?.title}`,
            html
        });

        console.log(`Offer canceled email sent to buyer ${buyerEmail}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send offer canceled email:`, error);
        return false;
    }
};

// 25. Payment completed notification for bidder
const paymentCompletedEmail = async (user, listing) => {
    try {
        const content = `
            <h2 style="text-align: center;">Payment Confirmed</h2>
            <p style="text-align: center;">Thank you for your payment, ${user?.firstName || user?.companyName || user?.username}!</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <p>Great news! Your payment has been successfully processed and confirmed.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View My Purchases', `${FRONTEND_URL}/bidder/auctions/won`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Payment Confirmed');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: user?.email,
            subject: `Payment Confirmed - ${listing?.title}`,
            html
        });

        console.log(`Payment completed email sent to buyer ${user?.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send payment completed email:`, error);
        return false;
    }
};

// 26. Payment completed notification for bidder
const paymentSuccessEmail = async (user, listing) => {
    try {
        const content = `
            <h2 style="text-align: center;">Payment Successful</h2>
            <p style="text-align: center;">Your payment has been processed successfully, ${user.firstName || user?.companyName || user.username}!</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <p>You can check your order details from your dashboard.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View My Purchases', `${FRONTEND_URL}/bidder/auctions/won`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Payment Successful');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Payment Confirmed - ${listing.title}`,
            html
        });

        console.log(`Payment success email sent to ${user.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send payment success email:`, error);
        return false;
    }
};

// 27. Payment completed notification for seller
const paymentCompletedSellerEmail = async (seller, listing, buyer) => {
    try {
        const content = `
            <h2 style="text-align: center;">Payment Received</h2>
            <p style="text-align: center;">Great news, ${seller?.firstName || seller?.companyName || seller?.username}!</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <p>We're pleased to inform you that the buyer has successfully completed payment for your item. The funds have been received and confirmed.</p>
            
            ${buyer ? `
                <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0 0 12px 0;"><strong>Buyer Information</strong></p>
                    ${createSummaryRow('Name:', `${buyer?.firstName || buyer?.companyName || buyer?.username} ${buyer?.lastName || ''}`)}
                    ${buyer?.email ? createSummaryRow('Email:', buyer.email) : ''}
                    ${buyer?.phone ? createSummaryRow('Phone:', buyer.phone) : ''}
                </div>
            ` : ''}
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Sold Items', `${FRONTEND_URL}/seller/auctions/sold`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Payment Received');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: seller?.email,
            subject: `Payment Received - ${listing?.title}`,
            html
        });

        console.log(`Payment completed email sent to seller ${seller?.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send payment completed email to seller:`, error);
        return false;
    }
};

const flaggedCommentAdminEmail = async (
    adminEmail,
    reason,
    comment,
    listing,
    reportedByUser
) => {
    try {
        const content = `
            <h2 style="text-align: center;">Comment Flagged for Review</h2>
            <p style="text-align: center;">A user has reported inappropriate content.</p>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.warning};">
                <p style="margin: 0 0 8px 0;"><strong>Report Reason</strong></p>
                <p style="margin: 0;">${reason}</p>
            </div>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
            `)}
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.danger};">
                <p style="margin: 0 0 8px 0;"><strong>Flagged Comment</strong></p>
                <p style="margin: 0; font-style: italic;">${comment?.content}</p>
            </div>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 12px 0;"><strong>Comment Author</strong></p>
                ${createSummaryRow('Name:', `${comment?.user?.firstName || comment?.user?.companyName || comment?.userName || 'N/A'} ${comment?.user?.lastName || ''}`)}
                ${createSummaryRow('Username:', comment?.user?.username || comment?.user?.companyName || comment?.userName || 'N/A')}
                ${createSummaryRow('Email:', comment?.user?.email || 'N/A')}
                ${createSummaryRow('Account Type:', comment?.user?.userType || 'N/A')}
            </div>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 12px 0;"><strong>Reported By</strong></p>
                ${createSummaryRow('Name:', `${reportedByUser?.firstName} ${reportedByUser?.lastName}`)}
                ${createSummaryRow('Username:', reportedByUser?.username || reportedByUser?.companyName)}
                ${createSummaryRow('Email:', reportedByUser?.email)}
                ${createSummaryRow('Account Type:', reportedByUser?.userType)}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Review Comments', `${FRONTEND_URL}/admin/comments`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'Flagged Comment');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Flagged Comment - ${listing?.title}`,
            html
        });

        console.log(`Flagged comment email sent to admin for comment ${comment._id}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send flagged comment email:`, error);
        return false;
    }
};

// Comment emails
const newCommentSellerEmail = async (seller, listing, comment, commentAuthor) => {
    try {
        const content = `
            <h2 style="text-align: center;">New Comment on Your Listing</h2>
            <p style="text-align: center;">${commentAuthor?.firstName || commentAuthor?.companyName || commentAuthor?.username} has commented on your listing.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.primary};">
                <p style="margin: 0 0 8px 0;"><strong>Comment</strong></p>
                <p style="margin: 0; font-style: italic;">${comment?.content}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Listing', `${FRONTEND_URL}/auction/${listing?._id}`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'New Comment');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: seller?.email,
            subject: `New Comment on Your Listing: ${listing.title}`,
            html
        });

        console.log(`New comment email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send new comment email to seller:`, error);
        return false;
    }
};

const newCommentBidderEmail = async (bidder, listing, comment, commentAuthor) => {
    try {
        const content = `
            <h2 style="text-align: center;">New Activity on Listing</h2>
            <p style="text-align: center;">${commentAuthor?.firstName || commentAuthor?.companyName || commentAuthor?.username} has added a comment on a listing you're interested in.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing?.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.primary};">
                <p style="margin: 0 0 8px 0;"><strong>Comment</strong></p>
                <p style="margin: 0; font-style: italic;">${comment?.content}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Listing', `${FRONTEND_URL}/auction/${listing?._id}`, 'primary')}
            </div>
        `;

        const html = baseTemplate(content, 'New Activity');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: bidder?.email,
            subject: `New Activity on Listing: ${listing?.title}`,
            html
        });

        console.log(`New comment email sent to bidder ${bidder.email}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send new comment email to bidder:`, error);
        return false;
    }
};

// Note: sendOfferOutbidNotifications is not needed as offers cannot be outbid
const sendOfferOutbidNotifications = async () => {
    console.log("sendOfferOutbidNotifications is deprecated - offers cannot be outbid");
    return false;
};

const payoutInitiatedEmail = async (seller, auction, payout) => {
    try {
        const info = await transporter.sendMail({
            from: `"JLTM Select" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `💰 Payout Initiated - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .info-box { 
                            background: #e3f2fd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #bbdefb;
                        }
                        .info-title { 
                            font-size: 22px; 
                            font-weight: bold; 
                            color: #0d47a1;
                            margin-bottom: 15px;
                            text-align: center;
                        }
                        .payout-details { 
                            background: #f8f9fa; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                        }
                        .amount-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                        .amount-row.total { border-bottom: none; font-weight: bold; font-size: 18px; margin-top: 10px; color: #1e2d3b; }
                        .amount-label { color: #666; }
                        .amount-value { font-weight: bold; }
                        .method-badge {
                            display: inline-block;
                            padding: 5px 10px;
                            background: #edcd1f;
                            color: #1e2d3b;
                            border-radius: 4px;
                            font-weight: bold;
                            text-transform: capitalize;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand-name">JLTM Select</div>
                            <div class="tagline">Furniture Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="info-box">
                                <div class="info-title">💰 PAYOUT INITIATED</div>
                                <p style="text-align: center; font-size: 16px;">Good news, ${seller.firstName || seller?.companyName || seller.username}!</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller.firstName || seller?.companyName || seller.username}</span>,</p>
                            
                            <p>We're pleased to inform you that the payout process for your sold item has been initiated by our admin team. Your payment is now being processed.</p>
                            
                            <div class="payout-details">
                                <h3 style="margin-bottom: 15px; color: #1e2d3b;">Payout Details:</h3>
                                
                                <p><strong>Item Sold:</strong> ${auction.title}</p>
                                <p><strong>Payout Method:</strong> <span class="method-badge">${payout.payoutMethod}</span></p>
                                
                                <div class="amount-row">
                                    <span class="amount-label">Total Sale Amount:</span>
                                    <span class="amount-value">${payout.formattedTotalAmount}</span>
                                </div>
                                <div class="amount-row">
                                    <span class="amount-label">Sales Tax:</span>
                                    <span class="amount-value">${payout.formattedCommissionAmount}</span>
                                </div>
                                <div class="amount-row total">
                                    <span class="amount-label">Your Payout Amount:</span>
                                    <span class="amount-value">${payout.formattedSellerAmount}</span>
                                </div>
                            </div>
                            
                            <p><strong>What happens next?</strong></p>
                            <p>The admin will process your payment manually. You'll receive another notification once the payment has been completed. Please allow 1-3 business days for processing.</p>
                            
                            <p>If you have any questions about this payout, please contact our support team.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated message from JLTM Select.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} JLTM Select. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Payout initiated email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error("❌ Failed to send payout initiated email:", error);
        return false;
    }
};

const payoutCompletedEmail = async (seller, auction, payout) => {
    try {
        const info = await transporter.sendMail({
            from: `"JLTM Select" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `✅ Payout Completed - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .success-box { 
                            background: #d4edda; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #c3e6cb;
                            text-align: center;
                        }
                        .success-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #155724;
                            margin-bottom: 10px;
                        }
                        .payment-summary { 
                            background: #f8f9fa; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 25px 0; 
                            border-left: 4px solid #edcd1f;
                        }
                        .amount-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                        .amount-row.total { border-bottom: none; font-weight: bold; font-size: 18px; margin-top: 10px; color: #1e2d3b; }
                        .amount-label { color: #666; }
                        .amount-value { font-weight: bold; }
                        .method-badge {
                            display: inline-block;
                            padding: 5px 10px;
                            background: #edcd1f;
                            color: #1e2d3b;
                            border-radius: 4px;
                            font-weight: bold;
                            text-transform: capitalize;
                        }
                        .transaction-id {
                            background: #e9ecef;
                            padding: 10px;
                            border-radius: 4px;
                            font-family: monospace;
                            margin: 10px 0;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand-name">JLTM Select</div>
                            <div class="tagline">Furniture Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="success-box">
                                <div class="success-title">✅ PAYMENT SENT</div>
                                <p style="font-size: 18px; color: #155724;">Your payout has been processed, ${seller.firstName || seller?.companyName || seller.username}!</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller.firstName || seller?.companyName || seller.username}</span>,</p>
                            
                            <p>Great news! Your payout has been successfully processed and the payment has been sent to your ${payout.payoutMethod} account.</p>
                            
                            <div class="payment-summary">
                                <h3 style="margin-bottom: 15px; color: #1e2d3b;">Payment Summary:</h3>
                                
                                <p><strong>Item:</strong> ${auction.title}</p>
                                <p><strong>Payout Method:</strong> <span class="method-badge">${payout.payoutMethod}</span></p>
                                
                                ${payout.transactionId
                    ? `
                                <div class="transaction-id">
                                    <strong>Transaction ID:</strong> ${payout.transactionId}
                                </div>
                                `
                    : ""
                }
                                
                                <div class="amount-row">
                                    <span class="amount-label">Total Sale Amount:</span>
                                    <span class="amount-value">${payout.formattedTotalAmount}</span>
                                </div>
                                <div class="amount-row">
                                    <span class="amount-label">Sales Tax:</span>
                                    <span class="amount-value">${payout.formattedCommissionAmount}</span>
                                </div>
                                <div class="amount-row total">
                                    <span class="amount-label">Amount Sent to You:</span>
                                    <span class="amount-value">${payout.formattedSellerAmount}</span>
                                </div>
                            </div>
                            
                            <p><strong>Payment Details:</strong></p>
                            <p>Please check your ${payout.payoutMethod} account. The payment should appear in your account within 1-3 business days depending on your provider.</p>
                            
                            <p>Thank you for selling with JLTM Select! We appreciate your business.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This payment confirmation was sent by JLTM Select.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} JLTM Select. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Payout completed email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error("❌ Failed to send payout completed email:", error);
        return false;
    }
};

const payoutFailedEmail = async (seller, payout) => {
    try {
        const info = await transporter.sendMail({
            from: `"JLTM Select" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `⚠️ Payout Update - Action Required`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .warning-box { 
                            background: #fff3cd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #ffeaa7;
                            text-align: center;
                        }
                        .warning-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #856404;
                            margin-bottom: 10px;
                        }
                        .details-box { 
                            background: #f8f9fa; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand-name">JLTM Select</div>
                            <div class="tagline">Furniture Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="warning-box">
                                <div class="warning-title">⚠️ PAYOUT ISSUE</div>
                                <p style="font-size: 16px;">We encountered an issue with your payout</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller.firstName || seller?.companyName || seller.username}</span>,</p>
                            
                            <p>We regret to inform you that there was an issue processing your payout of <strong>${payout.formattedSellerAmount}</strong> via ${payout.payoutMethod}.</p>
                            
                            <div class="details-box">
                                <h4>Reason:</h4>
                                <p>${payout.failureReason || "Payment method issue or invalid details"}</p>
                                
                                <h4>Next Steps:</h4>
                                <p>Please check your payout method details in your account settings and ensure they are correct. Our admin team will review the issue and may contact you for additional information.</p>
                            </div>
                            
                            <p>If you need immediate assistance, please contact our support team.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated message from JLTM Select.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} JLTM Select. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Payout failed email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error("❌ Failed to send payout failed email:", error);
        return false;
    }
};

// 28. Giveaway participation confirmation email
const giveawayParticipationEmail = async (userEmail, listing) => {
    try {
        const content = `
            <h2 style="text-align: center;">You're in the Giveaway!</h2>
            <p style="text-align: center;">You have successfully entered the giveaway for <strong>${listing.title}</strong>.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <p>Thank you for participating in this giveaway!</p>
            <p>We'll notify you via email if you are selected as the winner.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('View Giveaway', `${FRONTEND_URL}/auction/${listing._id}`, 'primary')}
            </div>
            
            <p>Good luck!</p>
        `;

        const html = baseTemplate(content, 'Giveaway Entry Confirmed');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Giveaway Entry Confirmed - ${listing.title}`,
            html
        });

        console.log(`Giveaway participation email sent to ${userEmail}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send giveaway participation email:`, error);
        return false;
    }
};

// 29. Giveaway winner notification email
const giveawayWinnerEmail = async (winnerEmail, winnerName, listing) => {
    try {
        const content = `
            <h2 style="text-align: center;">🎉 Congratulations! You Won!</h2>
            <p style="text-align: center;">You have been selected as the winner of the giveaway for <strong>${listing.title}</strong>!</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLORS.secondary};">${listing.title}</p>
                ${listing.subTitle ? `<p style="margin: 0 0 16px 0; text-align: center; color: ${BRAND_COLORS.textLight};">${listing.subTitle}</p>` : ''}
                
                ${listing.specifications && listing.specifications.size > 0 ? `
                    <div style="margin: 16px 0 0 0;">
                        <strong style="color: ${BRAND_COLORS.secondary};">Item Details</strong>
                        ${renderSpecifications(listing.specifications)}
                    </div>
                ` : ''}
            `)}
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.success};">
                <p style="margin: 0 0 12px 0;"><strong>What happens next?</strong></p>
                <p style="margin: 0;">Please contact our support team to arrange collection or delivery of your prize.</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Contact Support', `mailto:${SUPPORT_EMAIL}?subject=Giveaway%20Winner%20-%20${listing.title}`, 'primary')}
            </div>
            
            <p>Dear ${winnerName},</p>
            <p>We are delighted to inform you that you have been selected as the winner of the <strong>${listing.title}</strong> giveaway!</p>
            <p>Our team will be in touch with you shortly to arrange the next steps.</p>
            
            <p>Once again, congratulations on your win!</p>
        `;

        const html = baseTemplate(content, '🎉 You Won the Giveaway!');

        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: winnerEmail,
            subject: `🎉 Congratulations! You Won ${listing.title}!`,
            html
        });

        console.log(`Giveaway winner email sent to ${winnerEmail}`);
        return !!info;
    } catch (error) {
        console.error(`Failed to send giveaway winner email:`, error);
        return false;
    }
};

// ============================================
// ACCOUNT APPROVED EMAIL (to user)
// ============================================

const accountApprovedEmail = async (user) => {
    try {
        const content = `
            <h2 style="text-align: center;">✅ Account Approved</h2>
            <p style="text-align: center;">Welcome to ${BRAND_NAME}, ${user.firstName || user.username}!</p>
            
            <p>We are pleased to inform you that your account has been <strong>approved</strong> by our team. You now have full access to all features of ${BRAND_NAME}.</p>
            
            ${createInfoCard(`
                <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: ${BRAND_COLORS.secondary};">Your Approved Account Allows You To:</p>
                
                <div style="margin: 12px 0 0 0;">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid ${BRAND_COLORS.grayBorder};">
                        <span style="font-size: 20px;">🏷️</span>
                        <span style="color: ${BRAND_COLORS.text};">Bid on auctions and compete for items</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0;">
                        <span style="font-size: 20px;">📤</span>
                        <span style="color: ${BRAND_COLORS.text};">Upload your own auctions and start selling</span>
                    </div>
                </div>
            `)}
            
            <p>You can now log in to your account and start exploring all the features ${BRAND_NAME} has to offer.</p>
            
            <div style="text-align: center; margin: 25px 0;">
                ${createButton('Go to Dashboard', `${FRONTEND_URL}/${user?.userType || 'bidder'}/dashboard`, 'primary')}
            </div>
            
            <div style="background: ${BRAND_COLORS.grayBg}; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid ${BRAND_COLORS.grayBorder};">
                <p style="margin: 0 0 12px 0; font-weight: bold; color: ${BRAND_COLORS.secondary};">📞 Need Assistance?</p>
                <p style="margin: 0 0 8px 0; color: ${BRAND_COLORS.text};">If you have any questions or need any assistance at any stage, just reach out to us:</p>
                
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid ${BRAND_COLORS.grayBorder};">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 4px 0;">
                        <span style="font-weight: 600; color: ${BRAND_COLORS.secondary}; min-width: 50px;">Email:</span>
                        <a href="mailto:admin@rexbid.ie" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">admin@rexbid.ie</a>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 4px 0;">
                        <span style="font-weight: 600; color: ${BRAND_COLORS.secondary}; min-width: 50px;">Phone:</span>
                        <span style="color: ${BRAND_COLORS.text};">087 203 9257 (Darren)</span>
                    </div>
                </div>
            </div>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.success};">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                    <strong>🎉 Welcome aboard!</strong> We're excited to have you as part of the ${BRAND_NAME} community.
                </p>
            </div>
        `;

        const html = baseTemplate(content, 'Account Approved');
        
        const info = await transporter.sendMail({
            from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Account Approved - Welcome to ${BRAND_NAME}!`,
            html
        });

        console.log(`✅ Account approval email sent to ${user.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send account approval email:`, error);
        return false;
    }
};

export {
    contactEmail, //done
    contactConfirmationEmail, //done
    welcomeEmail, //done
    newUserRegistrationEmail, //done
    resetPasswordEmail, //done
    auctionSubmittedForApprovalEmail, //done
    auctionApprovedEmail, // done
    auctionListedEmail, //done
    newAuctionNotificationEmail, //done
    sendBulkAuctionNotifications, //done
    bidConfirmationEmail, //done
    newBidNotificationEmail, //done
    offerConfirmationEmail, //done
    newOfferNotificationEmail, //done
    outbidNotificationEmail, //done
    sendOutbidNotifications, //done
    sendOfferOutbidNotifications, //no need to do as offers cannot be outbid
    auctionEndingSoonEmail, //done
    sendAuctionWonEmail, //done
    sendAuctionEndedSellerEmail, //done
    auctionWonAdminEmail, //done
    auctionEndedAdminEmail, //done
    offerAcceptedEmail, //done
    offerRejectedEmail, //done
    offerCanceledEmail, //done
    newCommentSellerEmail, //done
    newCommentBidderEmail, //done
    flaggedCommentAdminEmail, //done
    paymentCompletedEmail, //done
    paymentSuccessEmail, //done
    paymentCompletedSellerEmail, //done
    payoutInitiatedEmail, //22
    payoutCompletedEmail, //23
    payoutFailedEmail, //24
    giveawayParticipationEmail,
    giveawayWinnerEmail,
    accountApprovedEmail,
};