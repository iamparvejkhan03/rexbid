import nodemailer from "nodemailer";
import Commission from "../models/commission.model.js";

const transporter = nodemailer.createTransport({
  host: "smtp.domeneshop.no",
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

// Helper function to format specifications dynamically
const formatSpecifications = (specifications) => {
  if (!specifications) return [];
  
  const specs = specifications instanceof Map 
    ? Object.fromEntries(specifications) 
    : specifications;
  
  if (!specs || Object.keys(specs).length === 0) return [];
  
  // Define which fields to show and how to format them
  const importantFields = [
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'brand', label: 'Brand' },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'year', label: 'Year' },
    { key: 'modelYear', label: 'Model Year' },
    { key: 'serialNumber', label: 'Serial Number' },
    { key: 'vin', label: 'VIN' },
    { key: 'condition', label: 'Condition' },
    { key: 'hours', label: 'Hours', suffix: ' h' },
    { key: 'mileage', label: 'Mileage', suffix: ' km' },
    { key: 'weight', label: 'Weight', suffix: ' kg' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'power', label: 'Power', suffix: ' kW' },
    { key: 'engine', label: 'Engine' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'driveType', label: 'Drive Type' },
    { key: 'tireSize', label: 'Tire Size' },
    { key: 'size', label: 'Size' },
    { key: 'dimensions', label: 'Dimensions' },
    { key: 'color', label: 'Color' },
    { key: 'location', label: 'Location' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' }
  ];
  
  // Return only fields that exist in the specifications
  return importantFields
    .filter(field => specs[field.key] !== undefined && specs[field.key] !== null && specs[field.key] !== '')
    .map(field => ({
      label: field.label,
      value: field.suffix ? `${specs[field.key]}${field.suffix}` : specs[field.key]
    }));
};

const formatNOK = (amount) => {
    if (!amount && amount !== 0) return "0 kr";
    return `${Number(amount).toLocaleString("nb-NO")} kr`;
};

// Helper to get time remaining
const getTimeRemaining = (endDate) => {
  if (!endDate) return 'Time not available';
  
  const remaining = new Date(endDate) - new Date();
  if (remaining <= 0) return 'Auction Ended';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Helper to render specifications as HTML
const renderSpecifications = (specifications) => {
  const specs = formatSpecifications(specifications);
  if (specs.length === 0) return '';
  
  let html = '<div class="specs-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">';
  
  specs.forEach(spec => {
    html += `
      <div class="spec-item" style="background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center;">
        <div class="spec-label" style="color: #666; font-size: 14px; margin-bottom: 5px;">${spec.label}</div>
        <div class="spec-value" style="font-weight: bold; color: #1e2d3b; font-size: 16px;">${spec.value}</div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
};

// Helper to render specifications as table rows
const renderSpecificationsRows = (specifications) => {
  const specs = formatSpecifications(specifications);
  if (specs.length === 0) return '';
  
  let html = '';
  specs.forEach(spec => {
    html += `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; color: #666; font-weight: bold;">${spec.label}:</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e9ecef; color: #1e2d3b;">${spec.value}</td>
      </tr>
    `;
  });
  
  return html;
};

const contactEmail = async (
  name,
  email,
  phone,
  userType = "Bidder",
  message
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: `${process.env.EMAIL_USER}`,
      subject: `New Contact Query - ${name}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .title { color: #1e2d3b; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 2px solid #edcd1f; }
                        .field { margin-bottom: 18px; padding: 12px 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #edcd1f; }
                        .label { font-weight: bold; color: #1e2d3b; display: block; margin-bottom: 5px; font-size: 14px; }
                        .value { color: #333; font-size: 15px; }
                        .message-box { background: #f8f9fa; padding: 18px; border-radius: 6px; margin-top: 5px; border: 1px solid #e9ecef; font-size: 15px; line-height: 1.5; }
                        .user-type-badge { 
                            display: inline-block; 
                            background: #edcd1f; 
                            color: #1e2d3b; 
                            padding: 4px 12px; 
                            border-radius: 20px; 
                            font-size: 13px; 
                            font-weight: bold; 
                            margin-left: 8px;
                        }
                        .contact-link { color: #1e2d3b; text-decoration: none; font-weight: bold; }
                        .contact-link:hover { color: #edcd1f; text-decoration: underline; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <h2 class="title">New Contact Form Submission</h2>
                            
                            <div class="field">
                                <span class="label">Full Name:</span>
                                <span class="value">${name}</span>
                            </div>
                            
                            <div class="field">
                                <span class="label">Email Address:</span>
                                <span class="value">
                                    <a href="mailto:${email}" class="contact-link">${email}</a>
                                </span>
                            </div>
                            
                            <div class="field">
                                <span class="label">Phone Number:</span>
                                <span class="value">
                                    <a href="tel:${phone}" class="contact-link">${phone}</a>
                                </span>
                            </div>
                            
                            <div class="field">
                                <span class="label">User Type:</span>
                                <span class="value">
                                    ${userType}
                                    <span class="user-type-badge">${userType}</span>
                                </span>
                            </div>
                            
                            <div class="field">
                                <span class="label">Message:</span>
                                <div class="message-box">${message}</div>
                            </div>
                            
                            <div style="margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 6px; border: 1px dashed #1e2d3b;">
                                <p style="margin: 0; color: #1e2d3b; font-size: 14px;">
                                    <strong>📞 Recommended Action:</strong> Respond within 24 hours for best customer engagement.
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This email was sent from the contact form on <span class="highlight">BidNordic</span> website.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Nordic Online Auctions</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    return !!info;
  } catch (error) {
    throw new Error(error);
  }
};

const contactConfirmationEmail = async (name, email) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank You for Contacting BidNordic`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .logo { max-width: 180px; height: auto; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .title { color: #1e2d3b; font-size: 24px; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 2px solid #edcd1f; text-align: center; }
                        .message-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #edcd1f; }
                        .greeting { font-size: 18px; color: #1e2d3b; margin-bottom: 15px; }
                        .message-text { color: #333; font-size: 15px; line-height: 1.6; margin-bottom: 15px; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .cta-box { background: #1e2d3b; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #edcd1f; font-size: 18px; margin-bottom: 10px; }
                        .cta-text { font-size: 14px; margin-bottom: 15px; opacity: 0.9; }
                        .contact-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; font-size: 14px; }
                        .contact-info strong { color: #1e2d3b; }
                        .signature { margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef; }
                        .signature p { margin: 5px 0; color: #1e2d3b; }
                        .signature strong { color: #edcd1f; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <h2 class="title">Thank You for Contacting Us</h2>
                            
                            <div class="message-box">
                                <p class="greeting">Dear <span class="highlight">${name}</span>,</p>
                                
                                <p class="message-text">
                                    Thank you for reaching out to <span class="highlight">BidNordic</span>. We have successfully received your inquiry and appreciate you taking the time to contact us.
                                </p>
                                
                                <p class="message-text">
                                    Our dedicated team is currently reviewing your message and will get back to you within <span class="highlight">24-48 hours</span>.
                                </p>
                                
                                <p class="message-text">
                                    We're committed to providing you with the best possible service and look forward to assisting you with your auction needs.
                                </p>
                            </div>
                            
                            <div class="cta-box">
                                <div class="cta-title">📞 Need Immediate Assistance?</div>
                                <div class="cta-text">
                                    If your inquiry requires urgent attention, please don't hesitate to call our support team directly for faster service.
                                </div>
                            </div>
                            
                            <div class="contact-info">
                                <p><strong>Phone Support:</strong> Available Monday-Friday, 9:00 AM - 6:00 PM CET</p>
                                <p><strong>Email Support:</strong> ${process.env.EMAIL_USER || "admin@bidnordic.com"}</p>
                            </div>
                            
                            <div class="signature">
                                <p>Best regards,</p>
                                <p><strong>The BidNordic Team</strong></p>
                                <p>Nordic Online Auctions</p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated confirmation email. Please do not reply to this message.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Your next great find is just a bid away!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    return !!info;
  } catch (error) {
    throw new Error(error);
  }
};

// For bid
const bidConfirmationEmail = async (
  userEmail,
  userName,
  auction,
  amount,
  currentBid
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Bid Confirmation - ${auction.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .title { color: #1e2d3b; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 2px solid #edcd1f; }
                        .bid-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #edcd1f; }
                        .bid-amount { font-size: 32px; font-weight: bold; color: #1e2d3b; margin: 15px 0; }
                        .bid-amount span { color: #28a745; }
                        .item-name { font-size: 22px; color: #1e2d3b; margin-bottom: 10px; }
                        .details-box { background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
                        .detail-row:last-child { border-bottom: none; }
                        .detail-label { color: #666; font-size: 15px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 15px; }
                        .auction-id { background: #1e2d3b; color: #ffffff; padding: 8px 15px; border-radius: 20px; display: inline-block; font-size: 14px; margin: 10px 0; }
                        .status-indicator { 
                            display: inline-block; 
                            padding: 6px 15px; 
                            border-radius: 20px; 
                            font-size: 14px; 
                            font-weight: bold; 
                            margin: 5px 0;
                        }
                        .active { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                        .winning { background: #cce5ff; color: #004085; border: 1px solid #b8daff; }
                        .outbid { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                        .next-steps { background: #edcd1f; color: #1e2d3b; padding: 20px; border-radius: 8px; margin: 25px 0; font-weight: bold; text-align: center; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .cta-button { 
                            background: #1e2d3b; 
                            color: #ffffff !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 14px;
                            margin: 10px 0;
                        }
                        .time-remaining { 
                            background: #fff3cd; 
                            padding: 15px; 
                            border-radius: 6px; 
                            margin: 15px 0; 
                            border: 1px solid #ffeaa7;
                            text-align: center;
                        }
                        .time-value { 
                            font-size: 20px; 
                            font-weight: bold; 
                            color: #856404;
                            margin: 5px 0;
                        }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <h2 class="title">Your Bid Has Been Confirmed</h2>
                            
                            <div class="bid-box">
                                <div class="item-name">${auction.title}</div>
                                
                                <div class="bid-amount">
                                    Bid Amount: <span>${formatNOK(amount)}</span>
                                </div>
                                
                                <div class="status-indicator ${amount >= currentBid ? "winning" : "outbid"}">
                                    ${amount >= currentBid ? "🏆 CURRENT WINNING BID" : "⚠️ YOU HAVE BEEN OUTBID"}
                                </div>
                                
                                <div class="details-box">
                                    <div class="detail-row">
                                        <span class="detail-label">Your Bid Amount:</span>
                                        <span class="detail-value">${formatNOK(amount)}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Current Highest Bid:</span>
                                        <span class="detail-value">${formatNOK(currentBid)}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Your Position:</span>
                                        <span class="detail-value">${amount >= currentBid ? "Leading" : "Not Leading"}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Auction End Date:</span>
                                        <span class="detail-value">${auction.endDate ? new Date(auction.endDate).toLocaleDateString("nb-NO", {
                                          weekday: "long",
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        }) : 'Not set'}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Auction End Time:</span>
                                        <span class="detail-value">${auction.endDate ? new Date(auction.endDate).toLocaleTimeString("nb-NO", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }) : 'Not set'}</span>
                                    </div>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="time-remaining">
                                    <div>Time Remaining:</div>
                                    <div class="time-value">
                                        ${getTimeRemaining(auction.endDate)}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="next-steps">
                                🎯 What Happens Next?<br>
                                <div style="font-size: 14px; margin-top: 10px; font-weight: normal;">
                                    ${amount >= currentBid ? "You are currently the highest bidder! Monitor the auction to maintain your position." : "Your bid is below the current highest bid. Consider placing a higher bid to become the leader."}
                                </div>
                            </div>
                            
                            <p>Dear <span class="highlight">${userName}</span>,</p>
                            <p>Thank you for placing your bid on <strong>${auction.title}</strong> on BidNordic.</p>
                            <p>We'll notify you immediately if you are outbid or when the auction ends.</p>
                            
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">
                                    VIEW AUCTION DETAILS
                                </a>
                            </div>
                            
                            <p><strong>Important:</strong> Remember that auctions on BidNordic use automatic extension. If a bid is placed in the last 2 minutes, the auction extends by 2 minutes to ensure fair bidding.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated confirmation from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Happy Bidding! Your next great find awaits.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    return !!info;
  } catch (error) {
    throw new Error(`Failed to send bid confirmation: ${error.message}`);
  }
};

// For offer
const offerConfirmationEmail = async (
  userEmail,
  userName,
  auction,
  offerAmount,
  listingPrice,
  offerId
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Offer Submitted - ${auction.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .title { color: #1e2d3b; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 2px solid #edcd1f; }
                        .offer-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #edcd1f; }
                        .offer-amount { font-size: 32px; font-weight: bold; color: #1e2d3b; margin: 15px 0; }
                        .offer-amount span { color: #edcd1f; }
                        .item-name { font-size: 22px; color: #1e2d3b; margin-bottom: 10px; }
                        .details-box { background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
                        .detail-label { color: #666; }
                        .detail-value { font-weight: bold; color: #1e2d3b; }
                        .offer-id { background: #1e2d3b; color: #ffffff; padding: 8px 15px; border-radius: 20px; display: inline-block; font-size: 14px; margin: 10px 0; }
                        .next-steps { background: #edcd1f; color: #1e2d3b; padding: 20px; border-radius: 8px; margin: 25px 0; font-weight: bold; text-align: center; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .contact-info { margin-top: 20px; font-size: 14px; color: #666; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <h2 class="title">Your Offer Has Been Submitted</h2>
                            
                            <div class="offer-box">
                                <div class="item-name">${auction.title}</div>
                                
                                <div class="offer-amount">
                                    <span>${formatNOK(offerAmount)}</span>
                                </div>
                                
                                <div class="offer-id">
                                    Offer ID: ${offerId}
                                </div>
                                
                                <div class="details-box">
                                    <div class="detail-row">
                                        <span class="detail-label">Your Offer Amount:</span>
                                        <span class="detail-value">${formatNOK(offerAmount)}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Listing Price:</span>
                                        <span class="detail-value">${formatNOK(listingPrice)}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Offer Difference:</span>
                                        <span class="detail-value">${formatNOK(offerAmount - listingPrice)}</span>
                                    </div>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="next-steps">
                                🎯 What Happens Next?<br>
                                <div style="font-size: 14px; margin-top: 10px; font-weight: normal;">
                                    The seller has 48 hours to respond to your offer. We'll notify you immediately when they respond.
                                </div>
                            </div>
                            
                            <p>Dear <span class="highlight">${userName}</span>,</p>
                            <p>Thank you for submitting your offer for the <strong>${auction.title}</strong> on BidNordic.</p>
                            <p>We have notified the seller of your offer and they have 48 hours to respond.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated confirmation from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Your next great find is just an offer away!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    return !!info;
  } catch (error) {
    throw new Error(`Failed to send offer confirmation: ${error.message}`);
  }
};

// For bid only
const outbidNotificationEmail = async (
  userEmail,
  userName,
  auction,
  newBid,
  auctionUrl,
  yourPreviousBid
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🚨 You've Been Outbid - ${auction.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .alert-banner { background: #f8d7da; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px solid #f5c6cb; text-align: center; }
                        .alert-title { color: #721c24; font-size: 24px; font-weight: bold; margin: 0 0 15px 0; }
                        .alert-subtitle { color: #721c24; font-size: 16px; margin: 0; }
                        .bid-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
                        .bid-amount { font-size: 32px; font-weight: bold; color: #1e2d3b; margin: 15px 0; }
                        .bid-amount span { color: #dc3545; }
                        .item-name { font-size: 22px; color: #1e2d3b; margin-bottom: 10px; text-align: center; }
                        .comparison-box { background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef; margin: 20px 0; }
                        .comparison-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
                        .comparison-row:last-child { border-bottom: none; }
                        .comparison-label { color: #666; font-size: 15px; }
                        .comparison-value { font-weight: bold; font-size: 15px; }
                        .your-bid { color: #6c757d; }
                        .new-bid { color: #dc3545; }
                        .difference { color: #721c24; }
                        .time-box { background: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffeaa7; text-align: center; }
                        .time-label { color: #856404; font-size: 14px; margin-bottom: 5px; }
                        .time-value { color: #856404; font-size: 18px; font-weight: bold; }
                        .cta-section { text-align: center; padding: 25px; background: #f8f9fa; border-radius: 8px; margin: 25px 0; }
                        .cta-title { color: #1e2d3b; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #dc3545; 
                            color: #ffffff !important; 
                            padding: 15px 35px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .cta-button:hover { 
                            background: #c82333; 
                        }
                        .secondary-button { 
                            background: #1e2d3b; 
                            color: #ffffff !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 14px;
                            margin: 5px;
                        }
                        .tip-box { background: #d1ecf1; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #bee5eb; }
                        .tip-title { color: #0c5460; font-size: 16px; margin-bottom: 10px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #dc3545; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="alert-banner">
                                <div class="alert-title">🚨 YOU'VE BEEN OUTBID!</div>
                                <div class="alert-subtitle">Another bidder has placed a higher bid on an item you were bidding on.</div>
                            </div>
                            
                            <div class="bid-box">
                                <div class="item-name">${auction.title}</div>
                                
                                <div class="bid-amount">
                                    New Highest Bid: <span>${formatNOK(newBid)}</span>
                                </div>
                                
                                <div class="comparison-box">
                                    <div class="comparison-row">
                                        <span class="comparison-label">Your Previous Bid:</span>
                                        <span class="comparison-value your-bid">${formatNOK(yourPreviousBid || 0)}</span>
                                    </div>
                                    <div class="comparison-row">
                                        <span class="comparison-label">New Highest Bid:</span>
                                        <span class="comparison-value new-bid">${formatNOK(newBid)}</span>
                                    </div>
                                    <div class="comparison-row">
                                        <span class="comparison-label">Difference:</span>
                                        <span class="comparison-value difference">${formatNOK(newBid - (yourPreviousBid || 0))}</span>
                                    </div>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="time-box">
                                    <div class="time-label">Auction Ends In:</div>
                                    <div class="time-value">
                                        ${getTimeRemaining(auction.endDate)}
                                    </div>
                                    <div class="time-label">
                                        ${auction.endDate ? new Date(auction.endDate).toLocaleDateString('nb-NO', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="cta-section">
                                <div class="cta-title">Don't Let This One Get Away!</div>
                                <p>Place a new bid to regain your position in the auction.</p>
                                
                                <div style="margin: 20px 0;">
                                    <a href="${auctionUrl}" class="cta-button">PLACE NEW BID NOW</a>
                                </div>
                                
                                <div>
                                    <a href="${process.env.FRONTEND_URL}/dashboard/bids" class="secondary-button">VIEW ALL YOUR BIDS</a>
                                    <a href="${process.env.FRONTEND_URL}/auctions" class="secondary-button">BROWSE OTHER AUCTIONS</a>
                                </div>
                            </div>
                            
                            <div class="tip-box">
                                <div class="tip-title">💡 Quick Tip:</div>
                                <p>For a better chance to win, consider placing a bid that's significantly higher than the current bid. Remember, auctions on BidNordic use automatic extension - if a bid is placed in the last 2 minutes, the auction extends by 2 minutes.</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${userName}</span>,</p>
                            <p>This is an automated notification to let you know that another bidder has placed a higher bid on <strong>${auction.title}</strong>.</p>
                            <p><strong>Act quickly!</strong> This auction is getting competitive. The sooner you place your next bid, the better your chances of winning.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">You're receiving this email because you placed a bid on ${auction.title}.</p>
                            <p class="footer-text">This is an automated notification from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Need help? Contact support at ${process.env.EMAIL_USER || 'admin@bidnordic.com'}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    return !!info;
  } catch (error) {
    throw new Error(`Failed to send outbid notification: ${error.message}`);
  }
};

const DEBOUNCE_DELAY = 5000; // 5 seconds
const lastNotificationTimes = new Map(); // Store last notification time per auction

const sendOutbidNotifications = async (
  auction,
  previousHighestBidder,
  previousBidders,
  currentBidderId,
  newBidAmount
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
          user.username || `${user.firstName} ${user.lastName}`,
          auction,
          newBidAmount,
          auctionUrl,
          null // Your previous bid - would need to fetch this
        );
      } catch (error) {
        console.error(
          `❌ Failed to send outbid notification to ${user.email}:`,
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

const sendAuctionWonEmail = async (auction) => {
  try {
    // Safety check - ensure winner is populated and has email
    if (
      !auction?.winner ||
      typeof auction?.winner === "string" ||
      !auction?.winner.email
    ) {
      console.error(
        "Winner not populated or missing email for auction:",
        auction?._id
      );
      return false;
    }

    const finalPrice = auction?.finalPrice || auction?.currentPrice || 0;
    const commissionAmount = auction?.commissionAmount || 0;
    const totalAmount = finalPrice + commissionAmount;
    
    let commissionDisplay = '';
    
    if (auction.commissionType === 'fixed') {
      commissionDisplay = `Fixed Fee: ${formatNOK(commissionAmount)}`;
    } else if (auction.commissionType === 'percentage') {
      commissionDisplay = `${auction.commissionValue}% Fee: ${formatNOK(commissionAmount)}`;
    }

    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: auction?.winner?.email,
      subject: `Invoice - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { background: #1e2d3b; padding: 20px; text-align: left; color: white; }
                        .company-name { font-size: 24px; font-weight: bold; color: #edcd1f; margin: 0 0 5px 0; }
                        .company-address { font-size: 12px; line-height: 1.4; margin: 5px 0; opacity: 0.9; }
                        .contact-info { font-size: 12px; margin: 5px 0; }
                        
                        .invoice-header { background: #2c3e50; color: white; padding: 15px 20px; text-align: center; }
                        .invoice-title { font-size: 28px; font-weight: bold; margin: 0; }
                        
                        .winner-section { background: #d4edda; padding: 25px; margin: 20px; border-radius: 8px; border: 2px solid #c3e6cb; text-align: center; }
                        .winner-title { font-size: 24px; font-weight: bold; color: #155724; margin-bottom: 10px; }
                        .winning-price { font-size: 36px; font-weight: bold; color: #1e2d3b; margin: 15px 0; }
                        .winning-price span { color: #28a745; }
                        
                        .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .item-table th { background: #1e2d3b; color: white; padding: 12px; text-align: left; font-weight: bold; }
                        .item-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
                        .item-table tr:nth-child(even) { background: #f9f9f9; }
                        .ref-no { font-weight: bold; color: #1e2d3b; }
                        .amount { font-weight: bold; color: #155724; }
                        
                        .specs-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                        .specs-table td { padding: 8px 12px; border-bottom: 1px solid #e9ecef; }
                        .specs-table td:first-child { font-weight: bold; color: #666; width: 40%; }
                        .specs-table td:last-child { color: #1e2d3b; }
                        
                        .payment-details { background: #e3f2fd; padding: 20px; margin: 20px; border-radius: 8px; border: 1px solid #bbdefb; }
                        .payment-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .bank-details { background: white; padding: 15px; border-radius: 6px; margin-top: 10px; }
                        .detail-row { margin: 8px 0; }
                        .detail-label { font-weight: bold; min-width: 150px; display: inline-block; }
                        
                        .collection-info { background: #fff3cd; padding: 20px; margin: 20px; border-radius: 8px; border: 1px solid #ffeaa7; }
                        .collection-title { color: #856404; font-size: 18px; margin-bottom: 10px; font-weight: bold; }
                        
                        .cta-section { text-align: center; padding: 25px; background: #f8f9fa; border-top: 1px solid #e9ecef; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .support-link { color: #edcd1f; text-decoration: none; }
                        
                        .footer { background: #1e2d3b; color: white; padding: 15px; text-align: center; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <!-- Company Header -->
                        <div class="header">
                            <div class="company-name">BidNordic</div>
                            <div class="company-address">
                                Norway
                            </div>
                            <div class="contact-info">
                                Web: https://www.bidnordic.com | Email: admin@bidnordic.com
                            </div>
                        </div>
                        
                        <!-- Invoice Title -->
                        <div class="invoice-header">
                            <div class="invoice-title">INVOICE</div>
                        </div>
                        
                        <!-- Invoice Details -->
                        <div style="padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #e9ecef;">
                            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                <div><strong>Invoice No:</strong> ${auction?.transactionId || `INV-${auction?._id?.toString()?.toUpperCase()}`}</div>
                                <div><strong>Date:</strong> ${new Date().toLocaleDateString("nb-NO", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                <div><strong>Payment Due:</strong> ${new Date(
                                  Date.now() + 7 * 24 * 60 * 60 * 1000
                                ).toLocaleDateString("nb-NO", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}</div>
                                <div><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">PENDING</span></div>
                            </div>
                        </div>
                        
                        <!-- Winner Announcement -->
                        <div class="winner-section">
                            <div class="winner-title">🎉 CONGRATULATIONS! YOU WON THE AUCTION</div>
                            <p>You are the winning bidder for this item. Please complete payment within 7 days.</p>
                            <div class="winning-price">
                                ${formatNOK(totalAmount)}
                            </div>
                        </div>
                        
                        <!-- Item Details Table -->
                        <table class="item-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="ref-no">${auction?._id?.toString().toUpperCase()}</td>
                                    <td>
                                        <strong>${auction.title}</strong><br>
                                        ${auction.subTitle ? `<small>${auction.subTitle}</small><br>` : ''}
                                        
                                        ${auction.specifications ? `
                                        <table class="specs-table">
                                            ${renderSpecificationsRows(auction.specifications)}
                                        </table>
                                        ` : ''}
                                    </td>
                                    <td class="amount">${formatNOK(finalPrice)}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="text-align: right; font-weight: bold;">${commissionDisplay}:</td>
                                    <td class="amount">${formatNOK(commissionAmount)}</td>
                                </tr>
                                <tr style="border-top: 2px solid #1e2d3b;">
                                    <td colspan="2" style="text-align: right; font-weight: bold; font-size: 16px;">TOTAL AMOUNT DUE:</td>
                                    <td style="font-weight: bold; font-size: 20px; color: #1e2d3b;">${formatNOK(totalAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <!-- Payment Details -->
                        <div class="payment-details">
                            <div class="payment-title">💰 PAYMENT DETAILS</div>
                            <p>Please transfer the total amount to the following account:</p>
                            <div class="bank-details">
                                <div class="detail-row">
                                    <span class="detail-label">Account name:</span> BidNordic AB
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Bank:</span> Swedbank
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Clearing number:</span> 1234-5678
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Account Number:</span> 9876543210
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">IBAN:</span> SE12345678901234567890
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">BIC/SWIFT:</span> SWEDSESS
                                </div>
                            </div>
                        </div>
                        
                        <!-- Collection Information -->
                        <div class="collection-info">
                            <div class="collection-title">📦 ITEM COLLECTION</div>
                            <p><strong>Important Information:</strong> Once your payment has been received and confirmed, you will receive a separate email containing the seller's contact details and the item location. You can then contact the seller directly to arrange collection or discuss delivery options.</p>
                            <p style="margin-top: 10px; font-size: 14px; color: #856404;">
                                ⚡ Please allow 24-48 hours for payment processing and verification before receiving the seller's details.
                            </p>
                        </div>
                        
                        <!-- Call to Action -->
                        <div class="cta-section">
                            <p>Once payment is confirmed, our team will contact you within 24-48 hours.</p>
                            <p>
                                <a href="mailto:admin@bidnordic.com?subject=Payment%20Confirmation%20-%20${auction?.title}" class="cta-button">CONFIRM PAYMENT</a>
                            </p>
                            <p style="font-size: 12px; color: #666;">
                                Questions? Contact <a href="mailto:admin@bidnordic.com" class="support-link">admin@bidnordic.com</a>
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <div class="footer-company">
                                BidNordic © ${new Date().getFullYear()}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(
      `✅ Auction won invoice email sent to ${auction?.winner?.email}`
    );
    return !!info;
  } catch (error) {
    console.error(
      `❌ Failed to send auction won invoice email for auction ${auction._id}:`,
      error
    );
    return false;
  }
};

const sendAuctionEndedSellerEmail = async (auction) => {
  try {
    // Safety check - ensure seller is populated and has email
    if (
      !auction?.seller ||
      typeof auction?.seller === "string" ||
      !auction?.seller?.email
    ) {
      console.error("Seller not populated or missing email for auction:", auction?._id);
      return false;
    }

    const statusMessage =
      auction?.status === "sold" || auction?.status === "sold_buy_now"
        ? `Sold for ${formatNOK(auction?.finalPrice || 0)}`
        : "Listing ended without sale";

    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: auction?.seller?.email,
      subject: `Your Listing Has Ended - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .status-box { 
                            background: ${auction.status === "sold" || auction.status === "sold_buy_now" ? "#d4edda" : "#fff3cd"}; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid ${auction.status === "sold" || auction.status === "sold_buy_now" ? "#c3e6cb" : "#ffeaa7"};
                            text-align: center;
                        }
                        .status-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: ${auction.status === "sold" || auction.status === "sold_buy_now" ? "#155724" : "#856404"};
                            margin-bottom: 10px;
                        }
                        .item-info { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-name { font-size: 22px; color: #1e2d3b; margin-bottom: 10px; }
                        .final-price { 
                            font-size: 32px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .final-price span { color: #edcd1f; }
                        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .buyer-box { background: #edcd1f; color: #1e2d3b; padding: 20px; border-radius: 8px; margin: 25px 0; }
                        .buyer-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
                        .buyer-info { font-size: 15px; }
                        .next-steps { background: #1e2d3b; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; }
                        .next-title { color: #edcd1f; font-size: 18px; margin-bottom: 15px; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .contact-link { color: #1e2d3b; text-decoration: none; font-weight: bold; }
                        .contact-link:hover { color: #edcd1f; text-decoration: underline; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="status-box">
                                <div class="status-title">${auction.status === "sold" || auction.status === "sold_buy_now" ? "✅ ITEM SOLD!" : "📅 LISTING ENDED"}</div>
                                <div style="font-size: 18px;">${statusMessage}</div>
                            </div>
                            
                            <div class="item-info">
                                <div class="item-name">${auction?.title}</div>
                                ${auction?.finalPrice ? `
                                <div class="final-price">
                                    <span>${formatNOK(auction?.finalPrice)}</span>
                                </div>
                                ` : ""}
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            ${(auction?.status === "sold" || auction?.status === "sold_buy_now") && auction?.winner ? `
                            <div class="buyer-box">
                                <div class="buyer-title">🎉 Congratulations! Your item has been sold.</div>
                                <!-- Buyer Information -->
                                <div class="buyer-info">
                                    <div style="background: #e8f4fd; padding: 15px; margin: 15px 20px; border-radius: 6px; border: 1px solid #b8daff; color: #004085;">
                                        <p style="margin: 0 0 8px 0;"><strong>📋 Buyer details will be shared after payment confirmation</strong></p>
                                        <p style="margin: 0 0 5px 0; font-size: 14px;">Once the buyer's payment is received, you'll get an email with their contact information to arrange collection.</p>
                                        <p style="margin: 8px 0 0 0; font-size: 13px;"><strong>Status:</strong> ⏳ Awaiting payment</p>
                                    </div>
                                </div>
                            </div>
                            ` : `
                            <div class="buyer-box">
                                <div class="buyer-title">⚠️ No Sale This Time</div>
                                <div class="buyer-info">
                                    <p>Your listing ended without a sale. You can relist the item or adjust the price from your dashboard.</p>
                                </div>
                            </div>
                            `}
                            
                            <div class="details-grid">
                                <div class="detail-item">
                                    <div class="detail-label">Final Status</div>
                                    <div class="detail-value">${auction?.status.toUpperCase()}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Original Price</div>
                                    <div class="detail-value">${formatNOK(auction?.buyNowPrice || auction?.startPrice || 0)}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Total Offers</div>
                                    <div class="detail-value">${auction?.offers?.length || 0}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Total Views</div>
                                    <div class="detail-value">${auction?.views || 0}</div>
                                </div>
                            </div>
                            
                            ${auction?.status === "sold" || auction?.status === "sold_buy_now" ? `
                            <div class="next-steps">
                                <div class="next-title">📝 Next Steps</div>
                                <p>1. Contact the buyer within 24 hours</p>
                                <p>2. Complete the sale agreement</p>
                                <p>3. Arrange item collection/delivery</p>
                            </div>
                            ` : `
                            <div class="next-steps">
                                <div class="next-title">🔄 Next Steps</div>
                                <p>1. Review your listing and pricing</p>
                                <p>2. Consider relisting with adjusted price</p>
                                <p>3. Add more photos or description details</p>
                                <p>4. Try our featured listing option for more visibility</p>
                            </div>
                            `}
                            
                            <p>Dear <span class="highlight">${auction?.seller?.firstName || auction?.seller?.username}</span>,</p>
                            <p>Your listing for the <strong>${auction?.title}</strong> on BidNordic has ended.</p>
                            <p>For any questions about the sale process or assistance, please contact our support team.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Need help? Contact support at ${process.env.EMAIL_USER || "admin@bidnordic.com"}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });
    return !!info;
  } catch (error) {
    console.error(
      `❌ Failed to send listing ended email to seller for auction ${auction?._id}:`,
      error
    );
    return false;
  }
};

const auctionListedEmail = async (auction, seller) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: `✅ Your Listing is Live on BidNordic: ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .confirmation-box { 
                            background: #d4edda; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #c3e6cb;
                            text-align: center;
                        }
                        .confirmation-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #155724;
                            margin-bottom: 10px;
                        }
                        .item-details { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { font-size: 24px; color: #1e2d3b; margin-bottom: 15px; text-align: center; }
                        .price-tag { 
                            font-size: 32px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .price-tag span { color: #edcd1f; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .listing-options { display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
                        .option-badge { 
                            background: #1e2d3b; 
                            color: #ffffff; 
                            padding: 6px 12px; 
                            border-radius: 20px; 
                            font-size: 12px; 
                            font-weight: bold; 
                        }
                        .tips-box { background: #fff3cd; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .tips-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .tip-item { margin-bottom: 10px; padding-left: 20px; position: relative; }
                        .tip-item:before { content: "✓"; position: absolute; left: 0; color: #edcd1f; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 20px 0;
                        }
                        .listing-url { 
                            background: #1e2d3b; 
                            color: #ffffff; 
                            padding: 15px; 
                            border-radius: 6px; 
                            margin: 20px 0;
                            word-break: break-all;
                            font-size: 14px;
                        }
                        .notifications-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="confirmation-box">
                                <div class="confirmation-title">📦 YOUR LISTING IS NOW LIVE!</div>
                                <p style="font-size: 18px; color: #155724;">Your item is now available on BidNordic</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller?.firstName || seller?.username}</span>,</p>
                            <p>Great news! Your listing is now active and visible to thousands of potential buyers on BidNordic.</p>
                            
                            <div class="item-details">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="listing-options">
                                    ${auction?.auctionType ? `<span class="option-badge">${auction.auctionType.toUpperCase()}</span>` : ""}
                                    ${auction?.allowOffers ? `<span class="option-badge" style="background: #edcd1f; color: #1e2d3b;">OFFERS ALLOWED</span>` : ""}
                                    ${auction?.buyNowPrice ? `<span class="option-badge" style="background: #28a745;">BUY NOW AVAILABLE</span>` : ""}
                                </div>
                                
                                <div class="price-tag">
                                    <span>${formatNOK(auction?.startPrice)}</span>
                                </div>
                                ${auction?.buyNowPrice ? `<p style="text-align: center; color: #28a745;">Buy Now: ${formatNOK(auction.buyNowPrice)}</p>` : ''}
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="tips-box">
                                <div class="tips-title">💡 Tips for a Successful Sale</div>
                                <div class="tip-item">Respond quickly to buyer inquiries (within 4 hours)</div>
                                <div class="tip-item">Share your listing on social media for more visibility</div>
                                <div class="tip-item">Keep your phone handy for buyer calls</div>
                                <div class="tip-item">Be prepared to negotiate with serious buyers</div>
                                <div class="tip-item">Update your listing with additional photos if needed</div>
                            </div>
                            
                            <div class="listing-url">
                                <strong>Your Listing URL:</strong><br>
                                <a href="${process.env.FRONTEND_URL}/auction/${auction?._id}" style="color: #edcd1f; text-decoration: none;">
                                    ${process.env.FRONTEND_URL}/auction/${auction?._id}
                                </a>
                            </div>
                            
                            <p style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction?._id}" class="cta-button">View Your Live Listing</a>
                            </p>
                            
                            <div class="notifications-box">
                                <p><strong>📱 What happens next?</strong></p>
                                <p>• We'll notify you when you receive offers</p>
                                <p>• You'll get alerts for buyer questions</p>
                                <p>• We'll remind you when offers are about to expire</p>
                                <p>• You'll be notified when a buyer wants to proceed</p>
                            </div>
                            
                            <p>We wish you a quick and successful sale!</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated confirmation from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Need assistance? Contact our seller support team.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Item listed email sent to seller ${seller?.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send item listed email:`, error);
    return false;
  }
};

const auctionEndingSoonEmail = async (
  userEmail,
  userName,
  auction,
  timeRemaining
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `⏰ Listing Expires Soon: ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .alert-box { 
                            background: #fff3e0; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #edcd1f;
                            text-align: center;
                        }
                        .alert-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .timer-box { 
                            background: #dc3545; 
                            color: #ffffff; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 25px 0;
                            text-align: center;
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .item-info { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { font-size: 24px; color: #1e2d3b; margin-bottom: 15px; text-align: center; }
                        .price-tag { 
                            font-size: 32px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .price-tag span { color: #edcd1f; }
                        .listing-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 20px 0;
                        }
                        .urgency-box { background: #f8d7da; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f5c6cb; }
                        .urgency-title { color: #721c24; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .buy-now-box { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; text-align: center; }
                        .buy-now-title { color: #155724; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .buy-now-price { font-size: 28px; font-weight: bold; color: #155724; margin: 10px 0; }
                        .offer-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; text-align: center; }
                        .offer-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="alert-box">
                                <div class="alert-title">⏰ LISTING EXPIRING SOON</div>
                                <p style="font-size: 18px; color: #1e2d3b;">Time is running out to get this item!</p>
                            </div>
                            
                            <div class="timer-box">
                                ⏰ ${timeRemaining} REMAINING
                            </div>
                            
                            <div class="item-info">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="price-tag">
                                    <span>${formatNOK(auction?.startPrice || auction?.buyNowPrice || 0)}</span>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="listing-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Current Offers/Bids</div>
                                        <div class="detail-value">${auction?.offers?.length || auction?.bids?.length || 0}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Listing Type</div>
                                        <div class="detail-value">${auction?.auctionType}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Views</div>
                                        <div class="detail-value">${auction?.views || 0}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <p>Dear <span class="highlight">${userName}</span>,</p>
                            <p>The listing for the <strong>${auction?.title}</strong> is about to expire. Once the timer runs out, this item will no longer be available for purchase.</p>
                            
                            <div class="urgency-box">
                                <div class="urgency-title">⚠️ ACT NOW BEFORE IT'S GONE</div>
                                <p>• This listing has ${auction?.offers?.length || 0} other offers</p>
                                <p>• Once expired, the listing will be removed</p>
                                <p>• The seller may not relist this item</p>
                                <p>• Other buyers are actively interested</p>
                            </div>
                            
                            ${auction?.auctionType === "buy_now" && auction?.buyNowPrice ? `
                            <div class="buy-now-box">
                                <div class="buy-now-title">💰 BUY NOW OPTION</div>
                                <div class="buy-now-price">${formatNOK(auction?.buyNowPrice)}</div>
                                <p>Secure this item immediately with Buy Now before the listing expires.</p>
                                <p style="margin: 15px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">BUY NOW</a>
                                </p>
                            </div>
                            ` : ""}
                            
                            ${auction?.allowOffers ? `
                            <div class="offer-box">
                                <div class="offer-title">💬 MAKE AN OFFER</div>
                                <p>Submit your best offer before the listing expires. The seller has limited time to respond.</p>
                                <p style="margin: 15px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">MAKE AN OFFER</a>
                                </p>
                            </div>
                            ` : ""}
                            
                            <p style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">VIEW LISTING NOW</a>
                            </p>
                            
                            <p><em>This is your final chance to secure this item before it's gone forever!</em></p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">You're receiving this email because you showed interest in this item.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Don't miss out - act before time runs out!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send listing expiring soon email:`, error);
    return false;
  }
};

const paymentSuccessEmail = async (user, auction, paymentAmount) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Payment Confirmed - ${auction.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .confirmation { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
                        .payment-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .amount { font-size: 24px; font-weight: bold; color: #155724; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="confirmation">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            <div class="brand-name">BidNordic</div>
                            <h2>✅ Payment Successful</h2>
                            <p>Your payment has been processed successfully</p>
                        </div>
                        
                        <p>Dear <strong>${user.firstName || user.username}</strong>,</p>
                        
                        <div class="payment-details">
                            <h4>Payment Details:</h4>
                            <p><strong>Item:</strong> ${auction.title}</p>
                            <p class="amount">${formatNOK(auction?.commissionAmount || 0)}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>

                        ${auction.status === "sold" || auction.status === "sold_buy_now" ? `
                            <p>Congratulations on being the highest bidder and winning this auction! Now, you can reach out to ${auction.seller?.firstName || auction.seller?.username} on the following details and follow up to arrange payment and transfer details.</p>

                            ${auction.seller ? `<p><strong>Seller:</strong> ${auction.seller?.firstName || auction.seller?.username}</p>` : ""}

                            ${auction.seller ? `<p><strong>E-mail:</strong> ${auction.seller?.email}</p>` : ""}

                            ${auction.seller ? `<p><strong>Phone:</strong> ${auction.seller?.phone || 'Not provided'}</p>` : ""}
                        ` : ``}                        
                        <p>You can check your order and contact the seller from your dashboard.</p>
                        
                        <p>Thank you for your purchase!</p>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Payment success email sent to ${user.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send payment success email:`, error);
    return false;
  }
};

const paymentCompletedEmail = async (user, auction, paymentAmount) => {
  try {
    const finalPrice = auction?.finalPrice || auction?.currentPrice || 0;
    const commissionAmount = auction?.commissionAmount || 0;
    const totalAmount = finalPrice + commissionAmount;
    
    let commissionDisplay = '';
    if (auction.commissionType === 'fixed') {
      commissionDisplay = `Fixed Fee (${formatNOK(commissionAmount)})`;
    } else if (auction.commissionType === 'percentage') {
      commissionDisplay = `${auction.commissionValue}% Fee (${formatNOK(commissionAmount)})`;
    }

    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: user?.email,
      subject: `✅ Payment Confirmed - ${auction?.title}`,
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
                        .confirmation-box { 
                            background: #d4edda; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #c3e6cb;
                            text-align: center;
                        }
                        .confirmation-title { 
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
                        .item-title { font-size: 22px; color: #1e2d3b; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .amount-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                        .amount-row.total { border-bottom: none; font-weight: bold; font-size: 18px; margin-top: 10px; color: #1e2d3b; }
                        .amount-label { color: #666; }
                        .amount-value { font-weight: bold; }
                        .commission-note { background: #e8f4fd; padding: 10px; border-radius: 4px; margin: 15px 0; font-size: 14px; color: #004085; text-align: center; }
                        .seller-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .seller-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; display: flex; align-items: center; gap: 8px; }
                        .contact-details { background: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0; }
                        .contact-link { color: #1e2d3b; text-decoration: none; font-weight: bold; }
                        .contact-link:hover { color: #edcd1f; text-decoration: underline; }
                        .next-steps { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .steps-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; display: flex; align-items: center; gap: 8px; }
                        .dashboard-box { background: #edcd1f; color: #1e2d3b; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .dashboard-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
                        .cta-button { 
                            background: #1e2d3b; 
                            color: #ffffff !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="confirmation-box">
                                <div class="confirmation-title">✅ PAYMENT CONFIRMED</div>
                                <p style="font-size: 18px; color: #155724;">Thank you for your payment, ${user?.firstName || user?.username}!</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${user?.firstName || user?.username}</span>,</p>
                            <p>Great news! Your payment has been successfully processed and confirmed. We've now shared your contact details with the seller so they can reach out to arrange collection/delivery of your item.</p>
                            
                            <div class="payment-summary">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666; margin-bottom: 20px;">${auction.subTitle}</p>` : ''}
                                
                                <div class="amount-row">
                                    <span class="amount-label">Item Price:</span>
                                    <span class="amount-value">${formatNOK(finalPrice)}</span>
                                </div>
                                <div class="amount-row">
                                    <span class="amount-label">${auction.commissionType === 'fixed' ? 'Platform Fee (Fixed)' : 'Platform Fee (Percentage)'}:</span>
                                    <span class="amount-value">${formatNOK(commissionAmount)}</span>
                                </div>
                                <div class="commission-note">
                                    ⚡ ${auction.commissionType === 'fixed' 
                                        ? `A fixed fee of ${formatNOK(auction.commissionValue)} applies to this purchase.` 
                                        : `A ${auction.commissionValue}% platform fee (${formatNOK(commissionAmount)}) applies to this purchase.`}
                                </div>
                                <div class="amount-row total">
                                    <span class="amount-label">Total Amount Paid:</span>
                                    <span class="amount-value">${formatNOK(totalAmount)}</span>
                                </div>
                            </div>
                            
                            <div class="seller-info">
                                <div class="seller-title">
                                    <span>📞 SELLER INFORMATION</span>
                                </div>
                                <p>Your payment has been confirmed. Below are the seller's contact details so you can coordinate the collection/delivery of your item.</p>
                                
                                ${auction?.seller ? `
                                <div class="contact-details">
                                    <p><strong>Seller Name:</strong> ${auction?.seller?.firstName || auction?.seller?.username}</p>
                                    ${auction?.seller?.email ? `<p><strong>Email:</strong> <a href="mailto:${auction?.seller?.email}" class="contact-link">${auction?.seller?.email}</a></p>` : ""}
                                    ${auction?.seller?.phone ? `<p><strong>Phone:</strong> <a href="tel:${auction?.seller?.phone}" class="contact-link">${auction?.seller?.phone}</a></p>` : ""}
                                    ${auction?.location ? `<p><strong>Item Location:</strong> ${auction?.location}</p>` : ""}
                                </div>
                                ` : ""}
                                
                                <p style="margin-top: 15px; font-size: 14px;"><strong>Next Step:</strong> Please contact the seller within 48 hours to arrange collection or delivery of your item.</p>
                            </div>
                            
                            <div class="next-steps">
                                <div class="steps-title">
                                    <span>📋 WHAT HAPPENS NEXT</span>
                                </div>
                                <p>1. <strong>Contact the seller</strong> using the details provided above</p>
                                <p>2. <strong>Arrange collection/delivery</strong> - Agree on a convenient time and method</p>
                                <p>3. <strong>Inspect your item</strong> upon collection/delivery</p>
                                <p>4. <strong>Complete the transaction</strong> by signing any necessary documentation</p>
                            </div>
                            
                            <div class="dashboard-box">
                                <div class="dashboard-title">📋 MANAGE YOUR PURCHASE</div>
                                <p>You can view all your won items, download invoices, and track the collection process from your dashboard.</p>
                                <p style="margin: 15px 0;">
                                    <a href="${process.env.FRONTEND_URL}/dashboard/auctions/won" class="cta-button">GO TO MY WINS</a>
                                </p>
                            </div>
                            
                            <p style="margin-top: 25px;">If you have any questions or encounter any issues when contacting the seller, please don't hesitate to reach out to our support team. We're here to help!</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This payment confirmation was sent by BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Need assistance? Contact us at ${process.env.EMAIL_USER || "support@bidnordic.com"}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Payment completed email sent to buyer ${user?.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send payment completed email:`, error);
    return false;
  }
};

const paymentCompletedSellerEmail = async (seller, auction, buyer) => {
  try {
    const finalPrice = auction?.finalPrice || auction?.currentPrice || 0;

    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: seller?.email,
      subject: `💰 Payment Received - ${auction?.title}`,
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
                        .item-title { font-size: 22px; color: #1e2d3b; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .amount-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e9ecef; }
                        .amount-row.total { border-bottom: none; font-weight: bold; font-size: 20px; margin-top: 10px; color: #1e2d3b; }
                        .amount-label { color: #666; }
                        .amount-value { font-weight: bold; }
                        .buyer-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .buyer-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; display: flex; align-items: center; gap: 8px; }
                        .contact-details { background: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0; }
                        .contact-link { color: #1e2d3b; text-decoration: none; font-weight: bold; }
                        .contact-link:hover { color: #edcd1f; text-decoration: underline; }
                        .next-steps { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .steps-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; display: flex; align-items: center; gap: 8px; }
                        .dashboard-box { background: #edcd1f; color: #1e2d3b; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .dashboard-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
                        .cta-button { 
                            background: #1e2d3b; 
                            color: #ffffff !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="success-box">
                                <div class="success-title">💰 PAYMENT RECEIVED</div>
                                <p style="font-size: 18px; color: #155724;">Great news, ${seller?.firstName || seller?.username}!</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller?.firstName || seller?.username}</span>,</p>
                            <p>We're pleased to inform you that the buyer has successfully completed payment for your item. The funds have been received and confirmed by our platform.</p>
                            
                            <div class="payment-summary">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666; margin-bottom: 20px;">${auction.subTitle}</p>` : ''}
                                
                                <div class="amount-row total">
                                    <span class="amount-label">Final Sale Price:</span>
                                    <span class="amount-value">${formatNOK(finalPrice)}</span>
                                </div>
                                
                                <p style="margin-top: 15px; font-size: 14px; color: #666; text-align: center;">
                                    *Platform fees will be processed separately. View your dashboard for detailed payout information.
                                </p>
                            </div>
                            
                            <div class="buyer-info">
                                <div class="buyer-title">
                                    <span>👤 BUYER INFORMATION</span>
                                </div>
                                <p>The buyer is now ready to coordinate collection/delivery. Here are their contact details:</p>
                                
                                ${buyer ? `
                                <div class="contact-details">
                                    <p><strong>Buyer Name:</strong> ${buyer?.firstName || buyer?.username} ${buyer?.lastName || ''}</p>
                                    ${buyer?.email ? `<p><strong>Email:</strong> <a href="mailto:${buyer?.email}" class="contact-link">${buyer?.email}</a></p>` : ""}
                                    ${buyer?.phone ? `<p><strong>Phone:</strong> <a href="tel:${buyer?.phone}" class="contact-link">${buyer?.phone}</a></p>` : ""}
                                    ${buyer?.address ? `<p><strong>Address:</strong> ${buyer?.address?.street ? `${buyer?.address?.street}, ` : ''}${buyer?.address?.city || ''} ${buyer?.address?.postCode || ''} ${buyer?.address?.country || ''}</p>` : ""}
                                </div>
                                ` : ""}
                                
                                <p style="margin-top: 15px; font-size: 14px;"><strong>Next Step:</strong> Please reach out to the buyer within 24-48 hours to arrange collection or delivery of the item.</p>
                            </div>
                            
                            <div class="next-steps">
                                <div class="steps-title">
                                    <span>📋 YOUR NEXT STEPS</span>
                                </div>
                                <p>1. <strong>Contact the buyer</strong> using the details provided above</p>
                                <p>2. <strong>Arrange collection/delivery</strong> - Agree on a convenient time and method</p>
                                <p>3. <strong>Prepare the item</strong> for handover with any relevant documentation</p>
                                <p>4. <strong>Complete the handover</strong> and have the buyer sign any necessary documentation</p>
                            </div>
                            
                            <div class="dashboard-box">
                                <div class="dashboard-title">📋 MANAGE YOUR SALE</div>
                                <p>You can view all your sold items, track payouts, and manage the collection process from your dashboard.</p>
                                <p style="margin: 15px 0;">
                                    <a href="${process.env.FRONTEND_URL}/dashboard/auctions/sold" class="cta-button">VIEW SOLD ITEMS</a>
                                </p>
                            </div>
                            
                            <p style="margin-top: 25px;">If you encounter any issues when contacting the buyer or need assistance with the handover process, please reach out to our support team. We're here to help ensure a smooth transaction!</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This payment confirmation was sent by BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Need assistance? Contact us at ${process.env.EMAIL_USER || "support@bidnordic.com"}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Payment completed email sent to seller ${seller?.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send payment completed email to seller:`, error);
    return false;
  }
};

const welcomeEmail = async (user) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `👋 Welcome to BidNordic!`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .welcome-box { 
                            background: #e3f2fd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            text-align: center;
                            border: 2px solid #bbdefb;
                        }
                        .welcome-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .user-greeting { 
                            font-size: 20px; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .user-greeting span { color: #edcd1f; }
                        .features-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .features-title { color: #1e2d3b; font-size: 20px; margin-bottom: 20px; text-align: center; }
                        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .feature-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .feature-icon { font-size: 24px; margin-bottom: 10px; }
                        .feature-text { font-weight: bold; color: #1e2d3b; font-size: 15px; }
                        .cta-box { background: #edcd1f; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #1e2d3b; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #1e2d3b; 
                            color: #ffffff !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .account-info { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .info-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="welcome-box">
                                <div class="welcome-title">👋 WELCOME TO BIDNORDIC!</div>
                                <p style="font-size: 18px; color: #1e2d3b;">Your premier destination for online auctions in the Nordics</p>
                            </div>
                            
                            <div class="user-greeting">
                                Hello <span>${user.firstName || user.username}</span>!
                            </div>
                            
                            <p>We're thrilled to welcome you to BidNordic, where you'll discover exceptional items and great deals across multiple categories. Your account has been successfully created.</p>
                            
                            <div class="features-box">
                                <div class="features-title">🎯 GET STARTED TODAY</div>
                                <div class="features-grid">
                                    <div class="feature-item">
                                        <div class="feature-icon">🔍</div>
                                        <div class="feature-text">Browse Items</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">💰</div>
                                        <div class="feature-text">Place Bids</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">📝</div>
                                        <div class="feature-text">Make Offers</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">🚀</div>
                                        <div class="feature-text">Buy Now</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">⭐</div>
                                        <div class="feature-text">Watchlist</div>
                                    </div>
                                    <div class="feature-item">
                                        <div class="feature-icon">📱</div>
                                        <div class="feature-text">Mobile Friendly</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="account-info">
                                <div class="info-title">✅ ACCOUNT DETAILS</div>
                                <p><strong>Name:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Account Type:</strong> ${user.userType || "Bidder"}</p>
                                <p><strong>Member Since:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>
                            
                            <div class="cta-box">
                                <div class="cta-title">🚀 READY TO EXPLORE?</div>
                                <p>Start browsing our diverse selection of items or complete your profile to get the most out of your BidNordic experience.</p>
                                <p style="margin: 15px 0;">
                                    <a href="${process.env.FRONTEND_URL}/${user?.userType}/profile" class="cta-button">GO TO PROFILE</a>
                                </p>
                                <p style="margin: 15px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auctions" class="cta-button" style="background: #ffffff; color: #1e2d3b !important; border: 2px solid #1e2d3b;">BROWSE AUCTIONS</a>
                                </p>
                            </div>
                            
                            <p>Need help getting started? Check out our FAQ section or contact our support team - we're here to help!</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">Welcome to the BidNordic community - where your next great find awaits!</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Questions? Contact us at ${process.env.EMAIL_USER || "admin@bidnordic.com"}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Welcome email sent to ${user.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send welcome email:`, error);
    return false;
  }
};

const resetPasswordEmail = async (email, url) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔒 Reset Your BidNordic Password`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .security-box { 
                            background: #fff3e0; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #edcd1f;
                            text-align: center;
                        }
                        .security-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .instruction-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 20px 0;
                        }
                        .url-box { 
                            background: #1e2d3b; 
                            color: #ffffff; 
                            padding: 15px; 
                            border-radius: 6px; 
                            margin: 20px 0; 
                            word-break: break-all; 
                            font-family: monospace;
                            font-size: 14px;
                        }
                        .expiry-box { background: #f8d7da; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f5c6cb; }
                        .expiry-title { color: #721c24; font-size: 16px; margin-bottom: 10px; font-weight: bold; }
                        .security-tips { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .tips-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .warning-box { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffeaa7; text-align: center; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="security-box">
                                <div class="security-title">🔒 PASSWORD RESET REQUEST</div>
                                <p style="font-size: 18px; color: #1e2d3b;">We received a request to reset your BidNordic password</p>
                            </div>
                            
                            <div class="instruction-box">
                                <p>To reset your password, please click the button below. This link will expire in <span class="highlight">1 hour</span> for security purposes.</p>
                                
                                <p style="text-align: center; margin: 25px 0;">
                                    <a href="${url}" class="cta-button">RESET PASSWORD NOW</a>
                                </p>
                                
                                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                                <div class="url-box">${url}</div>
                            </div>
                            
                            <div class="expiry-box">
                                <div class="expiry-title">⏰ LINK EXPIRES IN 1 HOUR</div>
                                <p>For your security, this password reset link will automatically expire in 1 hour. If it expires, you can request a new reset link from our website.</p>
                            </div>
                            
                            <div class="warning-box">
                                <p><strong>⚠️ IMPORTANT SECURITY NOTICE</strong></p>
                                <p>If you did <strong>NOT</strong> request this password reset, please ignore this email. Your account remains secure.</p>
                            </div>
                            
                            <div class="security-tips">
                                <div class="tips-title">🔐 CREATE A SECURE PASSWORD</div>
                                <p>When creating your new password, we recommend:</p>
                                <p>• Use at least 8 characters</p>
                                <p>• Include uppercase and lowercase letters</p>
                                <p>• Add numbers and special characters</p>
                                <p>• Avoid using personal information</p>
                                <p>• Don't reuse passwords from other websites</p>
                            </div>
                            
                            <p>After resetting your password, you can log in to your BidNordic account and continue browsing our diverse selection of items.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated security email from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">If you need further assistance, contact our support team.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });
    return !!info;
  } catch (error) {
    throw new Error(`Failed to send reset password email: ${error.message}`);
  }
};

//For admin
const newUserRegistrationEmail = async (adminEmail, user) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `👤 New User Registration - ${user.userType || "Bidder"}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .notification-box { 
                            background: #e3f2fd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #bbdefb;
                            text-align: center;
                        }
                        .notification-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .user-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .user-title { color: #1e2d3b; font-size: 20px; margin-bottom: 20px; text-align: center; }
                        .user-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .user-type-badge { 
                            background: ${(user.userType || "bidder") === "seller" ? "#edcd1f" : "#1e2d3b"}; 
                            color: ${(user.userType || "bidder") === "seller" ? "#1e2d3b" : "#ffffff"}; 
                            padding: 6px 15px; 
                            border-radius: 20px; 
                            font-size: 13px; 
                            font-weight: bold; 
                            display: inline-block;
                        }
                        .stats-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .stats-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .admin-actions { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .actions-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="notification-box">
                                <div class="notification-title">👤 NEW USER REGISTRATION</div>
                                <p style="font-size: 18px; color: #1e2d3b;">A new user has joined BidNordic</p>
                            </div>
                            
                            <p><strong>Hello Admin,</strong></p>
                            <p>A new user has successfully registered on BidNordic. Here are the user details:</p>
                            
                            <div class="user-card">
                                <div class="user-title">USER INFORMATION</div>
                                
                                <div class="user-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Full Name</div>
                                        <div class="detail-value">${user.firstName || ""} ${user.lastName || ""}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Username</div>
                                        <div class="detail-value">${user.username}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Email Address</div>
                                        <div class="detail-value">${user.email}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Account Type</div>
                                        <div class="detail-value">
                                            ${(user.userType || "bidder").charAt(0).toUpperCase() + (user.userType || "bidder").slice(1)}
                                            <span class="user-type-badge">${(user.userType || "bidder").toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Phone Number</div>
                                        <div class="detail-value">${user.phone || "Not provided"}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Country</div>
                                        <div class="detail-value">${user.countryName || "Not provided"}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Registration Date</div>
                                        <div class="detail-value">${new Date(user.createdAt || new Date()).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="admin-actions">
                                <div class="actions-title">⚡ ADMIN ACTIONS</div>
                                <p>You can review this user's account, verify their details, or take necessary actions from the admin panel.</p>
                                <p style="text-align: center;">
                                    <a href="${process.env.FRONTEND_URL}/admin/users" class="cta-button" style="background: #1e2d3b; color: #ffffff !important;">GO TO USER MANAGEMENT</a>
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic Admin System.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">You're receiving this email because you're an administrator.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ New user registration email sent to admin for ${user.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send new user registration email:`, error);
    return false;
  }
};

const auctionWonAdminEmail = async (adminEmail, auction, buyer) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🏆 Item Sold - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
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
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 22px; margin-bottom: 20px; text-align: center; }
                        .sale-amount { 
                            font-size: 36px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .sale-amount span { color: #edcd1f; }
                        .item-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .buyer-card { background: #e3f2fd; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .buyer-title { color: #0d47a1; font-size: 20px; margin-bottom: 20px; text-align: center; }
                        .buyer-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .seller-card { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .seller-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .sale-type-badge { 
                            background: #edcd1f; 
                            color: #1e2d3b; 
                            padding: 6px 15px; 
                            border-radius: 20px; 
                            font-size: 13px; 
                            font-weight: bold; 
                            display: inline-block;
                        }
                        .admin-actions { background: #1e2d3b; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; }
                        .actions-title { color: #edcd1f; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            margin: 5px;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="success-box">
                                <div class="success-title">🏆 ITEM SOLD!</div>
                                <p style="font-size: 18px; color: #155724;">An item has been successfully sold on BidNordic</p>
                            </div>
                            
                            <p><strong>Hello Admin,</strong></p>
                            <p>An auction listing has been successfully completed with a buyer. Here are the transaction details:</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666; margin-bottom: 15px;">${auction.subTitle}</p>` : ''}
                                
                                <div class="sale-amount">
                                    <span>${formatNOK(auction?.finalPrice || auction?.startPrice || auction?.buyNowPrice || 0)}</span>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="item-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Sale Type</div>
                                        <div class="detail-value">
                                            ${auction?.auctionType}
                                            <span class="sale-type-badge">${auction?.auctionType?.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Categories</div>
                                        <div class="detail-value">${auction?.categories?.join(', ') || 'N/A'}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Total Offers/Bids</div>
                                        <div class="detail-value">${auction?.offers?.length || auction?.bids?.length || 0}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Sale Date</div>
                                        <div class="detail-value">${new Date().toLocaleString()}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Sale Status</div>
                                        <div class="detail-value" style="color: #28a745;">COMPLETED</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Payment</div>
                                        <div class="detail-value">${auction?.paymentStatus || "Pending"}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="buyer-card">
                                <div class="buyer-title">👤 BUYER INFORMATION</div>
                                <div class="buyer-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Buyer Name</div>
                                        <div class="detail-value">${buyer?.firstName || buyer?.username}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Username</div>
                                        <div class="detail-value">${buyer?.username}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Email Address</div>
                                        <div class="detail-value">${buyer?.email}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Phone Number</div>
                                        <div class="detail-value">${buyer?.phone || "Not provided"}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="seller-card">
                                <div class="seller-title">🏪 SELLER INFORMATION</div>
                                <p><strong>Seller:</strong> ${auction?.seller?.firstName || auction?.seller?.username || "N/A"}</p>
                                <p><strong>Email:</strong> ${auction?.seller?.email || "N/A"}</p>
                                ${auction?.seller?.phone ? `<p><strong>Phone:</strong> ${auction?.seller?.phone}</p>` : ""}
                            </div>
                            
                            <div class="admin-actions">
                                <div class="actions-title">⚡ ADMIN ACTIONS</div>
                                <p>You can review this sale, generate invoices, or manage the transaction from the admin panel.</p>
                                <p style="text-align: center; margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/admin/auctions/all" class="cta-button">VIEW IN ADMIN</a>
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic Sales System.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">You're receiving this email because you're an administrator.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Listing sold admin email sent for auction ${auction._id}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send listing sold admin email:`, error);
    return false;
  }
};

const auctionEndedAdminEmail = async (adminEmail, auction) => {
  try {
    const getStatusDetails = (status) => {
      const statusConfig = {
        sold: {
          subject: "🏆 Item Sold",
          headerColor: "#d4edda",
          headerText: "Item Successfully Sold",
          statusBadge: "SOLD",
          badgeColor: "#28a745",
          summary: "This auction listing has ended successfully with a buyer.",
        },
        sold_buy_now: {
          subject: "🏆 Item Sold (Buy Now)",
          headerColor: "#d4edda",
          headerText: "Item Successfully Sold via Buy Now",
          statusBadge: "SOLD",
          badgeColor: "#28a745",
          summary: "This item was purchased immediately via Buy Now.",
        },
        expired: {
          subject: "📅 Listing Expired",
          headerColor: "#e2e3e5",
          headerText: "Item Listing Expired",
          statusBadge: "EXPIRED",
          badgeColor: "#6c757d",
          summary: "This listing has expired without a sale.",
        },
        cancelled: {
          subject: "❌ Listing Cancelled",
          headerColor: "#f8d7da",
          headerText: "Item Listing Cancelled",
          statusBadge: "CANCELLED",
          badgeColor: "#dc3545",
          summary: "This listing was cancelled before completion.",
        },
        reserve_not_met: {
          subject: "⚠️ Reserve Not Met",
          headerColor: "#fff3cd",
          headerText: "Reserve Price Not Met",
          statusBadge: "RESERVE NOT MET",
          badgeColor: "#ffc107",
          summary: "The auction ended but the reserve price was not met.",
        }
      };
      return statusConfig[status] || statusConfig["expired"];
    };

    const statusDetails = getStatusDetails(auction.status);

    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `${statusDetails.subject} - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .status-box { 
                            background: ${statusDetails.headerColor}; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid ${statusDetails.badgeColor};
                            text-align: center;
                        }
                        .status-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: ${auction.status === "sold" || auction.status === "sold_buy_now" ? "#155724" : "#1e2d3b"};
                            margin-bottom: 10px;
                        }
                        .status-badge { 
                            background: ${statusDetails.badgeColor}; 
                            color: #ffffff;
                            padding: 8px 20px; 
                            border-radius: 20px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 24px; margin-bottom: 20px; text-align: center; }
                        .sale-price { 
                            font-size: 36px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .sale-price span { color: #edcd1f; }
                        .item-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .stats-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .stats-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .seller-card { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .seller-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .buyer-card { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .buyer-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .action-alert { background: #f8d7da; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f5c6cb; }
                        .action-title { color: #721c24; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            margin: 5px;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="status-box">
                                <div class="status-title">${statusDetails.headerText}</div>
                                <p style="font-size: 18px;">${statusDetails.summary}</p>
                                <div class="status-badge">${statusDetails.statusBadge}</div>
                            </div>
                            
                            <p><strong>Hello Admin,</strong></p>
                            <p>An auction listing on BidNordic has ended. Here are the details:</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666; margin-bottom: 15px;">${auction.subTitle}</p>` : ''}
                                
                                ${auction?.finalPrice ? `
                                <div class="sale-price">
                                    <span>${formatNOK(auction?.finalPrice)}</span>
                                </div>
                                ` : ""}
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="item-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Listing Type</div>
                                        <div class="detail-value">${auction?.auctionType}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Categories</div>
                                        <div class="detail-value">${auction?.categories?.join(', ') || 'N/A'}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Original Price</div>
                                        <div class="detail-value">${formatNOK(auction?.startPrice || auction?.buyNowPrice || 0)}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Final Status</div>
                                        <div class="detail-value">${auction?.status.toUpperCase()}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Ended On</div>
                                        <div class="detail-value">${new Date().toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stats-box">
                                <div class="stats-title">📊 LISTING STATISTICS</div>
                                <p>• <strong>Total Offers/Bids:</strong> ${auction?.offers?.length || auction?.bids?.length || 0}</p>
                                <p>• <strong>Total Views:</strong> ${auction?.views || 0}</p>
                                <p>• <strong>Listing Duration:</strong> ${Math.ceil(
                                  (auction?.endDate
                                    ? new Date(auction.endDate) -
                                      new Date(auction.createdAt)
                                    : 0) /
                                    (1000 * 60 * 60 * 24)
                                )} days</p>
                                <p>• <strong>Listing ID:</strong> ${auction?._id}</p>
                            </div>
                            
                            ${auction?.seller ? `
                            <div class="seller-card">
                                <div class="seller-title">🏪 SELLER INFORMATION</div>
                                <p><strong>Seller:</strong> ${auction?.seller?.firstName || auction?.seller?.username}</p>
                                <p><strong>Email:</strong> ${auction?.seller?.email}</p>
                                ${auction?.seller?.phone ? `<p><strong>Phone:</strong> ${auction?.seller?.phone}</p>` : ""}
                            </div>
                            ` : ""}
                            
                            ${auction.winner && (auction.status === "sold" || auction.status === "sold_buy_now") ? `
                            <div class="buyer-card">
                                <div class="buyer-title">👤 BUYER INFORMATION</div>
                                <p><strong>Buyer:</strong> ${auction?.winner?.firstName || auction?.winner?.username}</p>
                                <p><strong>Email:</strong> ${auction?.winner?.email}</p>
                                ${auction?.winner?.phone ? `<p><strong>Phone:</strong> ${auction?.winner?.phone}</p>` : ""}
                            </div>
                            ` : ""}
                            
                            ${auction?.status !== "sold" && auction?.status !== "sold_buy_now" ? `
                            <div class="action-alert">
                                <div class="action-title">⚠️ ADMIN ACTION MAY BE REQUIRED</div>
                                <p>This listing ended without a sale. Consider:</p>
                                <p>• Contacting the seller about relisting options</p>
                                <p>• Reviewing pricing strategy</p>
                                <p>• Analyzing market demand for similar items</p>
                            </div>
                            ` : ""}
                            
                            <p style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/admin/auctions/all" class="cta-button" style="background: #1e2d3b; color: #ffffff !important;">VIEW ALL LISTINGS</a>
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic Admin System.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">You're receiving this email because you're an administrator.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(
      `✅ Listing ended admin email sent for auction ${auction?._id} (Status: ${auction?.status})`
    );
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send listing ended admin email:`, error);
    return false;
  }
};

const flaggedCommentAdminEmail = async (
  adminEmail,
  reason,
  comment,
  auction,
  reportedByUser
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🚩 Flagged Comment - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .alert-box { 
                            background: #fff3e0; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #edcd1f;
                            text-align: center;
                        }
                        .alert-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .flag-badge { 
                            background: #dc3545; 
                            color: #ffffff;
                            padding: 8px 20px; 
                            border-radius: 20px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .reason-box { background: #f8d7da; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f5c6cb; }
                        .reason-title { color: #721c24; font-size: 16px; margin-bottom: 10px; font-weight: bold; }
                        .item-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 20px; margin-bottom: 15px; text-align: center; }
                        .comment-card { background: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #dc3545; }
                        .comment-title { color: #dc3545; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .comment-text { 
                            background: #f8f9fa; 
                            padding: 20px; 
                            border-radius: 6px; 
                            margin: 15px 0; 
                            border-left: 4px solid #dc3545;
                            font-style: italic;
                            line-height: 1.5;
                        }
                        .comment-meta { color: #666; font-size: 14px; margin-top: 10px; }
                        .user-card { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .user-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .user-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .reporter-card { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .reporter-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .admin-actions { background: #1e2d3b; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; }
                        .actions-title { color: #edcd1f; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            margin: 5px;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="alert-box">
                                <div class="alert-title">🚩 COMMENT FLAGGED FOR REVIEW</div>
                                <p style="font-size: 18px; color: #1e2d3b;">A user has reported inappropriate content</p>
                                <div class="flag-badge">FLAGGED CONTENT</div>
                            </div>
                            
                            <div class="reason-box">
                                <div class="reason-title">⚠️ REPORT REASON</div>
                                <p>${reason}</p>
                            </div>
                            
                            <p><strong>Hello Admin,</strong></p>
                            <p>A comment on an auction listing has been flagged by a community member and requires your review.</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                <div class="detail-item" style="text-align: center; background: transparent; border: none;">
                                    <div class="detail-label">Auction Listing</div>
                                    <div class="detail-value">${formatNOK(auction?.startPrice || auction?.startPrice || 0)}</div>
                                </div>
                            </div>
                            
                            <div class="comment-card">
                                <div class="comment-title">💬 FLAGGED COMMENT</div>
                                <div class="comment-text">
                                    "${comment?.content}"
                                </div>
                                <div class="comment-meta">
                                    Posted: ${new Date(comment.createdAt).toLocaleString()}
                                    ${comment?.updatedAt && comment?.updatedAt !== comment?.createdAt ? ` | Last Edited: ${new Date(comment?.updatedAt).toLocaleString()}` : ""}
                                </div>
                            </div>
                            
                            <div class="user-card">
                                <div class="user-title">👤 COMMENT AUTHOR</div>
                                <div class="user-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Name</div>
                                        <div class="detail-value">${comment?.user?.firstName || comment?.userName || "N/A"} ${comment?.user?.lastName || ""}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Username</div>
                                        <div class="detail-value">${comment?.user?.username || comment?.userName || "N/A"}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Email</div>
                                        <div class="detail-value">${comment?.user?.email || "N/A"}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Account Type</div>
                                        <div class="detail-value">${comment?.user?.userType || "N/A"}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="reporter-card">
                                <div class="reporter-title">👤 REPORTED BY</div>
                                <div class="user-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Name</div>
                                        <div class="detail-value">${reportedByUser?.firstName} ${reportedByUser?.lastName}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Username</div>
                                        <div class="detail-value">${reportedByUser?.username}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Email</div>
                                        <div class="detail-value">${reportedByUser?.email}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Account Type</div>
                                        <div class="detail-value">${reportedByUser?.userType}</div>
                                    </div>
                                </div>
                                <div class="comment-meta" style="text-align: center; margin-top: 15px;">
                                    Reported at: ${new Date().toLocaleString()}
                                </div>
                            </div>
                            
                            <div class="admin-actions">
                                <div class="actions-title">⚡ ADMIN ACTIONS REQUIRED</div>
                                <p>Review this comment and take appropriate action:</p>
                                <p style="text-align: center; margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/admin/comments" class="cta-button">REVIEW COMMENTS</a>
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic Moderation System.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">You're receiving this email because you're a moderator/administrator.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(
      `✅ Flagged comment email sent to admin for comment ${comment._id}`
    );
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send flagged comment email:`, error);
    return false;
  }
};

// Comment emails
const newCommentSellerEmail = async (seller, auction, comment, commentAuthor) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: seller?.email,
      subject: `💬 New Comment on Your Listing: ${auction.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .notification-box { 
                            background: #e3f2fd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #bbdefb;
                            text-align: center;
                        }
                        .notification-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 24px; margin-bottom: 15px; text-align: center; }
                        .price-tag { 
                            font-size: 28px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 10px 0;
                            text-align: center;
                        }
                        .price-tag span { color: #edcd1f; }
                        .comment-card { background: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #1e2d3b; }
                        .comment-title { color: #1e2d3b; font-size: 20px; margin-bottom: 15px; text-align: center; }
                        .author-badge { 
                            background: #edcd1f; 
                            color: #1e2d3b; 
                            padding: 6px 15px; 
                            border-radius: 20px; 
                            font-size: 13px; 
                            font-weight: bold; 
                            display: inline-block;
                            margin-left: 10px;
                        }
                        .comment-text { 
                            background: #f8f9fa; 
                            padding: 20px; 
                            border-radius: 6px; 
                            margin: 15px 0; 
                            border-left: 4px solid #1e2d3b;
                            font-style: italic;
                            line-height: 1.5;
                        }
                        .comment-meta { color: #666; font-size: 14px; text-align: center; margin-top: 15px; }
                        .benefits-box { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .benefits-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-box { background: #1e2d3b; color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #edcd1f; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="notification-box">
                                <div class="notification-title">💬 NEW COMMENT ON YOUR LISTING</div>
                                <p style="font-size: 18px; color: #1e2d3b;">Someone has commented on your auction listing</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller?.firstName || seller?.username}</span>,</p>
                            <p>A potential buyer has posted a comment on your auction listing. Engaging with comments can help build trust and answer questions.</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                <div class="price-tag">
                                    <span>${formatNOK(auction?.startPrice)}</span>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="comment-card">
                                <div class="comment-title">💬 NEW COMMENT RECEIVED</div>
                                <p style="text-align: center; margin-bottom: 15px;">
                                    <strong>From:</strong> ${commentAuthor?.firstName || commentAuthor?.username}
                                    <span class="author-badge">${(commentAuthor?.userType || "User").toUpperCase()}</span>
                                </p>
                                <div class="comment-text">
                                    "${comment?.content}"
                                </div>
                                <div class="comment-meta">
                                    Posted: ${new Date(comment?.createdAt).toLocaleString()}
                                </div>
                            </div>
                            
                            <div class="benefits-box">
                                <div class="benefits-title">✅ WHY RESPONDING MATTERS</div>
                                <p>• Active engagement increases your listing's visibility</p>
                                <p>• Responding builds trust with potential buyers</p>
                                <p>• Quick answers can lead to faster sales</p>
                                <p>• Professional responses improve your seller reputation</p>
                            </div>
                            
                            <div class="cta-box">
                                <div class="cta-title">📱 RESPOND TO THE COMMENT</div>
                                <p>Reply to this comment to provide additional information or answer questions. Your response will be visible to all potential buyers.</p>
                                <p style="margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auction/${auction?._id}" class="cta-button">VIEW & RESPOND TO COMMENT</a>
                                </p>
                            </div>
                            
                            <p>Keep the conversation going! Your responses help create a transparent and trustworthy buying experience for potential customers.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">You're receiving this email because you're the seller of this auction listing.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ New comment email sent to seller ${seller.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send new comment email to seller:`, error);
    return false;
  }
};

const newCommentBidderEmail = async (buyer, auction, comment, commentAuthor) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: buyer?.email,
      subject: `💬 New Activity on Auction: ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .activity-box { 
                            background: #e3f2fd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #bbdefb;
                            text-align: center;
                        }
                        .activity-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 24px; margin-bottom: 15px; text-align: center; }
                        .price-tag { 
                            font-size: 28px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 10px 0;
                            text-align: center;
                        }
                        .price-tag span { color: #edcd1f; }
                        .comment-card { background: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #1e2d3b; }
                        .comment-title { color: #1e2d3b; font-size: 20px; margin-bottom: 15px; text-align: center; }
                        .author-badge { 
                            background: #edcd1f; 
                            color: #1e2d3b; 
                            padding: 6px 15px; 
                            border-radius: 20px; 
                            font-size: 13px; 
                            font-weight: bold; 
                            display: inline-block;
                            margin-left: 10px;
                        }
                        .comment-text { 
                            background: #f8f9fa; 
                            padding: 20px; 
                            border-radius: 6px; 
                            margin: 15px 0; 
                            border-left: 4px solid #1e2d3b;
                            font-style: italic;
                            line-height: 1.5;
                        }
                        .comment-meta { color: #666; font-size: 14px; text-align: center; margin-top: 15px; }
                        .benefits-box { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .benefits-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .urgency-box { 
                            background: #fff3cd; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 25px 0; 
                            border: 2px solid #ffc107;
                            text-align: center;
                        }
                        .urgency-title { color: #856404; font-size: 20px; margin-bottom: 10px; font-weight: bold; }
                        .cta-box { background: #1e2d3b; color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #edcd1f; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="activity-box">
                                <div class="activity-title">💬 NEW ACTIVITY ON AUCTION</div>
                                <p style="font-size: 18px; color: #1e2d3b;">There's new discussion on an auction you're interested in</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${buyer?.firstName || buyer?.username}</span>,</p>
                            <p>There's new activity on an auction you've shown interest in. Staying informed can help you make better purchasing decisions.</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                <div class="price-tag">
                                    <span>${formatNOK(auction?.startPrice)}</span>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="comment-card">
                                <div class="comment-title">💬 NEW COMMENT ADDED</div>
                                <p style="text-align: center; margin-bottom: 15px;">
                                    <strong>From:</strong> ${commentAuthor?.firstName || commentAuthor?.username}
                                    <span class="author-badge">${(commentAuthor?.userType || "User").toUpperCase()}</span>
                                </p>
                                <div class="comment-text">
                                    "${comment?.content}"
                                </div>
                                <div class="comment-meta">
                                    Posted: ${new Date(comment?.createdAt).toLocaleString()}
                                </div>
                            </div>
                            
                            <div class="benefits-box">
                                <div class="benefits-title">✅ WHY CHECK THE COMMENTS?</div>
                                <p>• Get answers to questions from other potential buyers</p>
                                <p>• Learn more about the item's condition and history</p>
                                <p>• Understand shipping, delivery, and payment details</p>
                                <p>• Gauge seller responsiveness and professionalism</p>
                            </div>
                            
                            ${auction?.endDate && new Date(auction?.endDate) - new Date() < 24 * 60 * 60 * 1000 ? `
                            <div class="urgency-box">
                                <div class="urgency-title">⏰ AUCTION ENDING SOON!</div>
                                <p>This auction is ending in less than 24 hours. Don't miss your chance!</p>
                            </div>
                            ` : ""}
                            
                            <div class="cta-box">
                                <div class="cta-title">🎯 TAKE ACTION NOW</div>
                                <p>Stay engaged with the auction community and make informed purchasing decisions!</p>
                                <p style="margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auction/${auction?._id}" class="cta-button">VIEW AUCTION & COMMENTS</a>
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">You're receiving this email because you've shown interest in this auction.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ New comment email sent to buyer ${buyer.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send new comment email to buyer:`, error);
    return false;
  }
};

const auctionSubmittedForApprovalEmail = async (adminEmail, auction, seller) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `📝 New Listing for Approval - ${auction.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .approval-box { 
                            background: #fff3cd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #ffc107;
                            text-align: center;
                        }
                        .approval-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #1e2d3b;
                            margin-bottom: 10px;
                        }
                        .status-badge { 
                            background: #ffc107; 
                            color: #1e2d3b;
                            padding: 8px 20px; 
                            border-radius: 20px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 24px; margin-bottom: 20px; text-align: center; }
                        .pricing-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .price-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .price-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .price-value { font-weight: bold; color: #1e2d3b; font-size: 18px; }
                        .item-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .seller-card { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .seller-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .checklist-box { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .checklist-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .admin-actions { background: #1e2d3b; color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; }
                        .actions-title { color: #edcd1f; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            margin: 5px;
                        }
                        .description-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e9ecef; }
                        .description-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .priority-box { background: #f8d7da; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f5c6cb; }
                        .priority-title { color: #721c24; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .listing-options { display: flex; justify-content: center; gap: 15px; margin: 15px 0; }
                        .option-badge { 
                            background: #1e2d3b; 
                            color: #ffffff; 
                            padding: 6px 12px; 
                            border-radius: 20px; 
                            font-size: 12px; 
                            font-weight: bold; 
                        }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="approval-box">
                                <div class="approval-title">📝 NEW LISTING AWAITING APPROVAL</div>
                                <p style="font-size: 18px; color: #1e2d3b;">A seller has submitted a new listing for review</p>
                                <div class="status-badge">AWAITING ADMIN APPROVAL</div>
                            </div>
                            
                            <p><strong>Hello Admin,</strong></p>
                            <p>A new auction listing has been submitted and requires your approval before it can go live.</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="listing-options">
                                    ${auction?.auctionType ? `<span class="option-badge">${auction.auctionType.toUpperCase()}</span>` : ""}
                                    ${auction?.allowOffers ? `<span class="option-badge" style="background: #edcd1f; color: #1e2d3b;">OFFERS ALLOWED</span>` : ""}
                                    ${auction?.buyNowPrice ? `<span class="option-badge" style="background: #28a745;">BUY NOW @ ${formatNOK(auction.buyNowPrice)}</span>` : ""}
                                </div>
                                
                                <div class="pricing-details">
                                    <div class="price-item">
                                        <div class="price-label">Starting Price</div>
                                        <div class="price-value">${formatNOK(auction.startPrice)}</div>
                                    </div>
                                    ${auction.buyNowPrice ? `
                                    <div class="price-item">
                                        <div class="price-label">Buy Now Price</div>
                                        <div class="price-value" style="color: #28a745;">${formatNOK(auction.buyNowPrice)}</div>
                                    </div>
                                    ` : ""}
                                </div>
                                
                                <div class="item-specs">
                                    <div class="detail-item">
                                        <div class="spec-label">Categories</div>
                                        <div class="spec-value">${auction?.categories?.join(', ') || 'N/A'}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="spec-label">Location</div>
                                        <div class="spec-value">${auction?.location || 'Not specified'}</div>
                                    </div>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Specifications</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            ${auction.description ? `
                            <div class="description-box">
                                <div class="description-title">📝 ITEM DESCRIPTION</div>
                                <p>${auction.description.substring(0, 200)}${auction.description.length > 200 ? "..." : ""}</p>
                            </div>
                            ` : ""}
                            
                            <div class="seller-card">
                                <div class="seller-title">👤 SELLER INFORMATION</div>
                                <div class="item-specs">
                                    <div class="detail-item">
                                        <div class="spec-label">Seller Name</div>
                                        <div class="spec-value">${seller.firstName || seller.username} ${seller.lastName || ""}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="spec-label">Username</div>
                                        <div class="spec-value">${seller.username}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="spec-label">Email</div>
                                        <div class="spec-value">${seller.email}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="spec-label">Phone</div>
                                        <div class="spec-value">${seller.phone || 'Not provided'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="checklist-box">
                                <div class="checklist-title">✅ APPROVAL CHECKLIST</div>
                                <p>• Verify listing information accuracy</p>
                                <p>• Check photo quality and quantity</p>
                                <p>• Review pricing appropriateness</p>
                                <p>• Confirm item condition classification</p>
                                <p>• Ensure seller compliance with terms</p>
                                <p>• Validate listing type and options</p>
                            </div>
                            
                            ${auction.startPrice > 50000 ? `
                            <div class="priority-box">
                                <div class="priority-title">⚠️ PRIORITY REVIEW RECOMMENDED</div>
                                <p>This listing may require additional attention due to high value (${formatNOK(auction.startPrice)})</p>
                                ${auction.buyNowPrice ? "<p>• Buy Now option available</p>" : ""}
                                ${auction.allowOffers ? "<p>• Offers enabled</p>" : ""}
                            </div>
                            ` : ""}
                            
                            <div class="admin-actions">
                                <div class="actions-title">⚡ ADMIN ACTIONS REQUIRED</div>
                                <p>Please review this listing within 24 hours to ensure timely activation.</p>
                                <p style="text-align: center; margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/admin/auctions/all" class="cta-button">REVIEW LISTINGS</a>
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic Listing Approval System.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">You're receiving this email because you're an administrator.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(
      `✅ Listing submission email sent to admin for auction ${auction._id}`
    );
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send listing submission email:`, error);
    return false;
  }
};

const auctionApprovedEmail = async (seller, auction) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: `✅ Your Listing is Live: ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .approved-box { 
                            background: #d4edda; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #c3e6cb;
                            text-align: center;
                        }
                        .approved-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #155724;
                            margin-bottom: 10px;
                        }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 24px; margin-bottom: 15px; text-align: center; }
                        .listing-options { display: flex; justify-content: center; gap: 15px; margin: 15px 0; flex-wrap: wrap; }
                        .option-badge { 
                            background: #1e2d3b; 
                            color: #ffffff; 
                            padding: 6px 12px; 
                            border-radius: 20px; 
                            font-size: 12px; 
                            font-weight: bold; 
                        }
                        .pricing-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .price-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .price-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .price-value { font-weight: bold; color: #1e2d3b; font-size: 20px; }
                        .cta-box { background: #edcd1f; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #1e2d3b; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #1e2d3b; 
                            color: #ffffff !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .next-steps { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .steps-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .listing-url { 
                            background: #f8f9fa; 
                            color: #1e2d3b; 
                            padding: 15px; 
                            border-radius: 6px; 
                            margin: 20px 0;
                            word-break: break-all;
                            text-align: center;
                            font-size: 14px;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="approved-box">
                                <div class="approved-title">✅ LISTING APPROVED & LIVE!</div>
                                <p style="font-size: 18px; color: #155724;">Your item is now visible to thousands of potential buyers</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller?.firstName || seller?.username}</span>,</p>
                            <p>Great news! Your listing has been approved and is now live on BidNordic.</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="listing-options">
                                    ${auction?.auctionType ? `<span class="option-badge">${auction?.auctionType.toUpperCase()}</span>` : ""}
                                    ${auction?.allowOffers ? `<span class="option-badge" style="background: #edcd1f; color: #1e2d3b;">OFFERS ALLOWED</span>` : ""}
                                    ${auction?.buyNowPrice ? `<span class="option-badge" style="background: #28a745;">BUY NOW AVAILABLE</span>` : ""}
                                </div>
                                
                                <div class="pricing-details">
                                    <div class="price-item">
                                        <div class="price-label">Listing Price</div>
                                        <div class="price-value">${formatNOK(auction?.startPrice)}</div>
                                    </div>
                                    ${auction?.buyNowPrice ? `
                                    <div class="price-item">
                                        <div class="price-label">Buy Now Price</div>
                                        <div class="price-value" style="color: #28a745;">${formatNOK(auction?.buyNowPrice)}</div>
                                    </div>
                                    ` : ""}
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="listing-url">
                                <strong>Your Listing URL:</strong><br>
                                <a href="${process.env.FRONTEND_URL}/auction/${auction?._id}" style="color: #edcd1f; text-decoration: none; font-weight: bold;">
                                    ${process.env.FRONTEND_URL}/auction/${auction?._id}
                                </a>
                            </div>
                            
                            <div class="next-steps">
                                <div class="steps-title">🚀 NEXT STEPS FOR SUCCESS</div>
                                <p>• Share your listing URL on social media and with contacts</p>
                                <p>• Respond promptly to buyer questions and offers</p>
                                <p>• Monitor your listing's views and engagement</p>
                                <p>• Be prepared to negotiate with serious buyers</p>
                            </div>
                            
                            <div class="cta-box">
                                <div class="cta-title">📱 VIEW YOUR LIVE LISTING</div>
                                <p>Check out how your item appears to potential buyers and start managing inquiries.</p>
                                <p style="margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auction/${auction?._id}" class="cta-button">VIEW YOUR LIVE LISTING</a>
                                </p>
                            </div>
                            
                            <p>Your item is now searchable and visible to our entire buyer community. We wish you a quick and successful sale!</p>
                            
                            <p>For any questions about the selling process or if you need assistance, our seller support team is here to help.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Need assistance? Contact our seller support team.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Listing approved email sent to seller ${seller.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send listing approved email:`, error);
    return false;
  }
};

const newAuctionNotificationEmail = async (buyer, auction, seller) => {
  try {
    // Determine listing status and appropriate wording
    const isLive = auction?.status === "active" || auction?.status === "approved";
    const listingStatus = isLive ? "Live Now" : "Coming Soon";
    const statusColor = isLive ? "#28a745" : "#17a2b8";

    // Determine available actions based on listing type
    let primaryAction = "View Details";
    let primaryColor = "#1e2d3b";

    if (isLive) {
      if (auction.auctionType === "buy_now" && auction?.buyNowPrice) {
        primaryAction = "Buy Now";
        primaryColor = "#28a745";
      } else if (auction.allowOffers) {
        primaryAction = "Make Offer";
        primaryColor = "#edcd1f";
      } else {
        primaryAction = "View Details";
      }
    }

    const timeInfo = auction?.endDate
      ? `Ends: ${new Date(auction.endDate).toLocaleString()}`
      : "No end date set";

    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: buyer.email,
      subject: `🎯 New Auction: ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 30px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 18px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 30px; }
                        .listing-badge { 
                            background: ${statusColor}; 
                            color: #ffffff;
                            padding: 10px 25px; 
                            border-radius: 25px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 15px 0;
                        }
                        .item-card { 
                            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                            padding: 30px; 
                            border-radius: 12px; 
                            margin: 25px 0; 
                            border: 2px solid #edcd1f;
                        }
                        .item-title { 
                            color: #1e2d3b; 
                            font-size: 28px; 
                            margin-bottom: 15px; 
                            text-align: center;
                            font-weight: bold;
                        }
                        .price-section { text-align: center; margin: 20px 0; }
                        .listing-price { 
                            font-size: 36px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 10px 0;
                        }
                        .listing-price span { color: #edcd1f; }
                        .buy-now-price { 
                            font-size: 28px; 
                            font-weight: bold; 
                            color: #28a745; 
                            margin: 10px 0;
                        }
                        .item-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
                        .detail-box { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; text-align: center; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 8px; display: block; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 18px; }
                        .listing-options { display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
                        .option-badge { 
                            background: #1e2d3b; 
                            color: #ffffff; 
                            padding: 8px 16px; 
                            border-radius: 20px; 
                            font-size: 13px; 
                            font-weight: bold; 
                        }
                        .action-buttons { display: flex; justify-content: center; margin: 30px 0; }
                        .action-button { 
                            background: ${primaryColor}; 
                            color: ${primaryColor === "#edcd1f" ? "#1e2d3b" : "#ffffff"} !important; 
                            padding: 16px 32px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            text-align: center;
                            min-width: 200px;
                        }
                        .urgency-box { 
                            background: #fff3cd; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 25px 0; 
                            border: 2px solid #ffc107;
                            text-align: center;
                        }
                        .urgency-title { color: #856404; font-size: 20px; margin-bottom: 10px; font-weight: bold; }
                        .seller-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .seller-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .time-box { 
                            background: #f8f9fa; 
                            color: #1e2d3b; 
                            padding: 15px; 
                            border-radius: 8px; 
                            margin: 20px 0;
                            text-align: center;
                            font-weight: bold;
                        }
                        .description-preview { 
                            background: #ffffff; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 25px 0; 
                            border: 1px solid #e9ecef;
                        }
                        .description-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 25px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e9ecef; margin-top: 30px; }
                        .footer-text { margin: 8px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                            <div class="listing-badge">${listingStatus}</div>
                        </div>
                        
                        <div class="content">
                            <p>Dear <span class="highlight">${buyer?.firstName || buyer?.username}</span>,</p>
                            <p>We're excited to let you know about a new auction listing on BidNordic that matches your interests!</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="listing-options">
                                    ${auction?.auctionType ? `<span class="option-badge">${auction?.auctionType?.toUpperCase()}</span>` : ""}
                                    ${auction?.allowOffers ? `<span class="option-badge" style="background: #edcd1f; color: #1e2d3b;">OFFERS ALLOWED</span>` : ""}
                                    ${auction?.buyNowPrice ? `<span class="option-badge" style="background: #28a745;">BUY NOW AVAILABLE</span>` : ""}
                                </div>
                                
                                <div class="price-section">
                                    <div class="listing-price">
                                        <span>${formatNOK(auction?.startPrice)}</span>
                                    </div>
                                    ${auction?.buyNowPrice ? `
                                    <div class="buy-now-price">
                                        Buy Now: ${formatNOK(auction?.buyNowPrice)}
                                    </div>
                                    ` : ""}
                                </div>
                                
                                <div class="item-details">
                                    <div class="detail-box">
                                        <div class="detail-label">Categories</div>
                                        <div class="detail-value">${auction?.categories?.join(', ') || 'N/A'}</div>
                                    </div>
                                    <div class="detail-box">
                                        <div class="detail-label">Location</div>
                                        <div class="detail-value">${auction?.location || 'Not specified'}</div>
                                    </div>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Specifications</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            ${auction?.description ? `
                            <div class="description-preview">
                                <div class="description-title">📝 ITEM DESCRIPTION</div>
                                <p>${auction?.description.substring(0, 200)}${auction?.description.length > 200 ? "..." : ""}</p>
                            </div>
                            ` : ""}
                            
                            ${isLive ? `
                            <div class="urgency-box">
                                <div class="urgency-title">🎯 AVAILABLE NOW!</div>
                                <p>This item is ready for bidding. ${auction?.buyNowPrice ? "Use Buy Now to secure it immediately or place a bid." : auction?.allowOffers ? "Make an offer to start negotiations." : "Place a bid to compete for this item."}</p>
                            </div>
                            ` : `
                            <div class="urgency-box">
                                <div class="urgency-title">📅 COMING SOON!</div>
                                <p>This item will be available shortly. Save it to your watchlist to get notified when it goes live.</p>
                            </div>
                            `}
                            
                            ${auction?.endDate ? `
                            <div class="time-box">
                                ⏰ ${timeInfo}
                            </div>
                            ` : ""}
                            
                            <div class="seller-info">
                                <div class="seller-title">👤 SELLER INFORMATION</div>
                                <p><strong>Seller:</strong> ${seller?.username}</p>
                                <p>Check the seller's profile for ratings and reviews from previous buyers.</p>
                            </div>
                            
                            <div class="action-buttons">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction?._id}" class="action-button">
                                    ${primaryAction}
                                </a>
                            </div>
                            
                            <p><strong>Why this item might be perfect for you:</strong></p>
                            <ul>
                                <li>Matches your saved preferences and search criteria</li>
                                <li>Competitively priced in the current market</li>
                                <li>From a verified seller on BidNordic</li>
                                <li>${auction?.buyNowPrice ? "Available for immediate purchase with Buy Now" : auction?.allowOffers ? "Open to offers and negotiations" : "Available for bidding"}</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">You're receiving this email because you're a registered buyer on BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. Nordic Online Auctions.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(
      `✅ New listing notification sent to buyer ${buyer?.email} for auction ${auction?._id}`
    );
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send new listing notification:`, error);
    return false;
  }
};

// Bulk notification function for multiple bidders
const sendBulkAuctionNotifications = async (buyers, auction, seller) => {
  try {
    const notificationPromises = buyers?.map(async (buyer) => {
      try {
        // Check if buyer has notifications enabled for new listings
        if (buyer?.preferences) {
          await newAuctionNotificationEmail(buyer, auction, seller);
          return { success: true, email: buyer.email };
        }
        return {
          success: false,
          email: buyer?.email,
          reason: "Notifications disabled",
        };
      } catch (error) {
        console.error(
          `❌ Failed to send notification to ${buyer?.email}:`,
          error.message
        );
        return { success: false, email: buyer?.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(notificationPromises);

    // Log summary
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
      `📧 Bulk listing notifications completed: ${successful} successful, ${failed} skipped/failed, ${errors} errors`
    );

    return {
      total: buyers.length,
      successful,
      failed,
      errors,
    };
  } catch (error) {
    console.error("❌ Error in bulk listing notifications:", error);
    throw error;
  }
};

const newBidNotificationEmail = async (seller, auction, bidAmount, bidder) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: `💰 New Bid Received - ${auction.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .notification-box { 
                            background: #d4edda; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #c3e6cb;
                            text-align: center;
                        }
                        .notification-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #155724;
                            margin-bottom: 10px;
                        }
                        .bid-amount { 
                            font-size: 36px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .bid-amount span { color: #28a745; }
                        .auction-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .detail-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                        .detail-label { color: #666; font-weight: bold; }
                        .detail-value { color: #1e2d3b; font-weight: bold; }
                        .bidder-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .bidder-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .tips-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .tips-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="notification-box">
                                <div class="notification-title">💰 NEW BID RECEIVED</div>
                                <p style="font-size: 18px; color: #155724;">Your auction is gaining interest</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller.firstName || seller.username}</span>,</p>
                            <p>Great news! Your auction has received a new bid.</p>
                            
                            <div class="bid-amount">
                                <span>${formatNOK(bidAmount)}</span>
                            </div>
                            
                            <div class="auction-details">
                                <div class="detail-item">
                                    <span class="detail-label">Current Price:</span>
                                    <span class="detail-value">${formatNOK(auction.currentPrice || 0)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Total Bids:</span>
                                    <span class="detail-value">${(auction.bidCount || 0).toLocaleString()}</span>
                                </div>
                                ${auction.endDate ? `
                                <div class="detail-item">
                                    <span class="detail-label">Time Remaining:</span>
                                    <span class="detail-value">${getTimeRemaining(auction.endDate)}</span>
                                </div>
                                ` : ""}
                            </div>
                            
                            ${auction.specifications ? `
                            <div class="specs-section">
                                <div class="specs-title">📋 Item Details</div>
                                ${renderSpecifications(auction.specifications)}
                            </div>
                            ` : ''}
                            
                            ${bidder ? `
                            <div class="bidder-info">
                                <div class="bidder-title">👤 BIDDER INFORMATION</div>
                                <p><strong>Bidder:</strong> ${bidder.username}</p>
                                ${bidder.rating ? `<p><strong>Bidder Rating:</strong> ${bidder.rating}/5 ⭐</p>` : ""}
                            </div>
                            ` : ""}
                            
                            <div class="tips-box">
                                <div class="tips-title">💡 TIPS FOR SUCCESS</div>
                                <p>• Respond promptly to bidder questions</p>
                                <p>• Share your auction on social media for more visibility</p>
                                <p>• Monitor your auction's progress regularly</p>
                                <p>• Consider adjusting your reserve price if needed</p>
                            </div>
                            
                            <p style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/seller/auctions/${auction._id}" class="cta-button">VIEW AUCTION DETAILS</a>
                            </p>
                            
                            <p>Your auction is moving in the right direction! Keep up the momentum.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">You're receiving this email because you're the seller of this auction.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ New bid notification sent to seller ${seller.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send new bid notification:`, error);
    return false;
  }
};

// Offer emails
const newOfferNotificationEmail = async (seller, auction, offerAmount, buyer) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: seller?.email,
      subject: `💰 New Offer Received - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .offer-box { 
                            background: #e3f2fd; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #bbdefb;
                            text-align: center;
                        }
                        .offer-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #0d47a1;
                            margin-bottom: 10px;
                        }
                        .offer-amount { 
                            font-size: 36px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .offer-amount span { color: #edcd1f; }
                        .price-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
                        .price-item { background: #ffffff; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }
                        .price-label { color: #666; font-size: 14px; margin-bottom: 10px; }
                        .price-value { font-weight: bold; color: #1e2d3b; font-size: 22px; }
                        .offer-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .buyer-info { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .buyer-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .action-buttons { display: flex; justify-content: center; gap: 15px; margin: 25px 0; flex-wrap: wrap; }
                        .action-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            text-align: center;
                            min-width: 160px;
                        }
                        .secondary-button { 
                            background: #1e2d3b; 
                            color: #ffffff !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 15px;
                            text-align: center;
                            min-width: 160px;
                        }
                        .response-time { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 25px 0; border: 1px solid #ffeaa7; text-align: center; }
                        .response-title { color: #856404; font-size: 16px; margin-bottom: 10px; font-weight: bold; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="offer-box">
                                <div class="offer-title">💰 NEW OFFER RECEIVED</div>
                                <p style="font-size: 18px; color: #0d47a1;">A potential buyer has made an offer on your item</p>
                            </div>
                            
                            <p>Dear <span class="highlight">${seller?.firstName || seller?.username}</span>,</p>
                            <p>Great news! You've received a new offer on your auction listing.</p>
                            
                            <div class="offer-amount">
                                <span>${formatNOK(offerAmount)}</span>
                            </div>
                            
                            <div class="price-comparison">
                                <div class="price-item">
                                    <div class="price-label">Offer Amount</div>
                                    <div class="price-value" style="color: #edcd1f;">${formatNOK(offerAmount)}</div>
                                </div>
                                <div class="price-item">
                                    <div class="price-label">Listing Price</div>
                                    <div class="price-value">${formatNOK(auction?.startPrice || auction?.buyNowPrice || 0)}</div>
                                </div>
                            </div>
                            
                            <div class="offer-details">
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <div class="detail-label">Item</div>
                                        <div class="detail-value">${auction?.title}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Offer Received</div>
                                        <div class="detail-value">${new Date().toLocaleString()}</div>
                                    </div>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                            </div>
                            
                            ${buyer ? `
                            <div class="buyer-info">
                                <div class="buyer-title">👤 BUYER INFORMATION</div>
                                <p><strong>Buyer:</strong> ${buyer?.firstName || buyer?.username}</p>
                            </div>
                            ` : ""}
                            
                            <div class="response-time">
                                <div class="response-title">⏰ RESPOND WITHIN 48 HOURS</div>
                                <p>Offers typically expire after 48 hours. Respond promptly to keep the buyer engaged.</p>
                            </div>
                            
                            <div class="action-buttons">
                                <a href="${process.env.FRONTEND_URL}/seller/offers" class="action-button">REVIEW OFFERS</a>
                            </div>
                            
                            <p><strong>Available Actions:</strong></p>
                            <p>• <strong>Accept</strong> - Complete the sale at the offered price</p>
                            <p>• <strong>Decline</strong> - Politely decline the offer</p>
                            <p>• <strong>Counter</strong> - Propose a different price</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">You're receiving this email because you're the seller of this item.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Respond quickly to maximize your chances of a successful sale!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ New offer notification sent to seller ${seller.email}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send new offer notification:`, error);
    return false;
  }
};

const offerCanceledEmail = async (
  buyerEmail,
  buyerName,
  seller,
  auction,
  offerAmount,
  offerId
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: buyerEmail,
      subject: `❌ Offer Canceled - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .canceled-box { 
                            background: #f8d7da; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #f5c6cb;
                            text-align: center;
                        }
                        .canceled-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #721c24;
                            margin-bottom: 10px;
                        }
                        .canceled-badge { 
                            background: #dc3545; 
                            color: #ffffff;
                            padding: 8px 20px; 
                            border-radius: 20px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 22px; margin-bottom: 15px; text-align: center; }
                        .offer-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .offer-amount { 
                            font-size: 32px; 
                            font-weight: bold; 
                            color: #dc3545; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .offer-amount span { text-decoration: line-through; }
                        .seller-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .seller-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .next-steps { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .steps-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-box { background: #1e2d3b; color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #edcd1f; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .secondary-button { 
                            background: #ffffff; 
                            color: #1e2d3b !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 15px;
                            margin: 10px 5px;
                            border: 2px solid #edcd1f;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="canceled-box">
                                <div class="canceled-title">❌ OFFER CANCELED</div>
                                <p style="font-size: 18px; color: #721c24;">Your offer has been canceled by the seller</p>
                                <div class="canceled-badge">OFFER CANCELED</div>
                            </div>
                            
                            <p>Dear <span class="highlight">${buyerName}</span>,</p>
                            <p>We wanted to inform you that your offer has been canceled by the seller. This could be due to various reasons such as the item being sold to another buyer, the seller changing their mind, or other circumstances.</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="offer-amount">
                                    <span>${formatNOK(offerAmount)}</span>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="offer-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Offer ID</div>
                                        <div class="detail-value">${offerId}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Canceled On</div>
                                        <div class="detail-value">${new Date().toLocaleString()}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Listing Price</div>
                                        <div class="detail-value">${formatNOK(auction?.buyNowPrice || auction?.startPrice || 0)}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Status</div>
                                        <div class="detail-value" style="color: #dc3545;">CANCELED</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="seller-info">
                                <div class="seller-title">🏪 SELLER INFORMATION</div>
                                <p><strong>Seller:</strong> ${seller?.firstName || seller?.username}</p>
                                <p>The seller has chosen to cancel your offer on their item.</p>
                            </div>
                            
                            <div class="next-steps">
                                <div class="steps-title">🔄 NEXT STEPS</div>
                                <p>Don't worry - there are plenty of other great items available!</p>
                                <p>• You can make a new offer on this item if the seller relists it</p>
                                <p>• Browse similar items in the same categories</p>
                                <p>• Use our search filters to find your perfect item</p>
                            </div>
                            
                            <div class="cta-box">
                                <div class="cta-title">🎯 FIND ANOTHER ITEM</div>
                                <p>Continue your search for the perfect item. BidNordic has thousands of auctions waiting for you.</p>
                                <p style="margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auctions" class="cta-button">BROWSE ALL AUCTIONS</a>
                                </p>
                                <div>
                                    <a href="${process.env.FRONTEND_URL}/auctions?category=${auction?.categories?.[0]}" class="secondary-button">SIMILAR ITEMS</a>
                                </div>
                            </div>
                            
                            <p>Thank you for using BidNordic. We're here to help you find your next great find!</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">If you have questions about this cancellation, please contact our support team.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Offer canceled email sent to buyer ${buyerEmail}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send offer canceled email:`, error);
    return false;
  }
};

const offerAcceptedEmail = async (
  buyerEmail,
  buyerName,
  seller,
  auction,
  offerAmount,
  offerId
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: buyerEmail,
      subject: `✅ Offer Accepted - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .accepted-box { 
                            background: #d4edda; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #c3e6cb;
                            text-align: center;
                        }
                        .accepted-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #155724;
                            margin-bottom: 10px;
                        }
                        .accepted-badge { 
                            background: #28a745; 
                            color: #ffffff;
                            padding: 8px 20px; 
                            border-radius: 20px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 24px; margin-bottom: 15px; text-align: center; }
                        .offer-amount { 
                            font-size: 36px; 
                            font-weight: bold; 
                            color: #1e2d3b; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .offer-amount span { color: #28a745; }
                        .deal-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .deal-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .deal-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .deal-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .seller-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .seller-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .contact-box { background: #d4edda; padding: 15px; border-radius: 6px; margin: 15px 0; }
                        .next-steps { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .steps-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-box { background: #1e2d3b; color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #edcd1f; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .secondary-button { 
                            background: #ffffff; 
                            color: #1e2d3b !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 15px;
                            margin: 10px 5px;
                            border: 2px solid #edcd1f;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .contact-link { color: #1e2d3b; text-decoration: none; font-weight: bold; }
                        .contact-link:hover { color: #edcd1f; text-decoration: underline; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="accepted-box">
                                <div class="accepted-title">✅ OFFER ACCEPTED!</div>
                                <p style="font-size: 18px; color: #155724;">Congratulations! The seller has accepted your offer</p>
                                <div class="accepted-badge">DEAL CONFIRMED</div>
                            </div>
                            
                            <p>Dear <span class="highlight">${buyerName}</span>,</p>
                            <p>Great news! The seller has accepted your offer. Your purchase has been confirmed and you're now ready to proceed with the transaction.</p>
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="offer-amount">
                                    <span>${formatNOK(offerAmount)}</span>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="deal-summary">
                                    <div class="deal-item">
                                        <div class="deal-label">Original Price</div>
                                        <div class="deal-value">${formatNOK(auction?.buyNowPrice || auction?.startPrice || 0)}</div>
                                    </div>
                                    <div class="deal-item">
                                        <div class="deal-label">Offer ID</div>
                                        <div class="deal-value">${offerId}</div>
                                    </div>
                                    <div class="deal-item">
                                        <div class="deal-label">Accepted On</div>
                                        <div class="deal-value">${new Date().toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="seller-info">
                                <div class="seller-title">🏪 SELLER CONTACT INFORMATION</div>
                                <p>Contact the seller within 24 hours to arrange payment and item collection/delivery:</p>
                                
                                <div class="contact-box">
                                    <p><strong>Seller:</strong> ${seller?.firstName || seller?.username}</p>
                                    ${seller?.email ? `<p><strong>Email:</strong> <a href="mailto:${seller?.email}" class="contact-link">${seller?.email}</a></p>` : ""}
                                    ${seller?.phone ? `<p><strong>Phone:</strong> <a href="tel:${seller?.phone}" class="contact-link">${seller?.phone}</a></p>` : ""}
                                    ${auction?.location ? `<p><strong>Location:</strong> ${auction?.location}</p>` : ""}
                                </div>
                            </div>
                            
                            <div class="next-steps">
                                <div class="steps-title">📝 NEXT STEPS TO COMPLETE PURCHASE</div>
                                <p>1. <strong>Contact the seller</strong> within 24 hours to arrange payment method</p>
                                <p>2. <strong>Complete payment</strong> as agreed with the seller</p>
                                <p>3. <strong>Schedule collection/delivery</strong> of the item</p>
                                <p>4. <strong>Complete handover</strong> and any required documentation</p>
                            </div>
                            
                            <div class="cta-box">
                                <div class="cta-title">📦 COMPLETE YOUR PURCHASE</div>
                                <p>Access your purchase details, download invoices, and contact the seller from your dashboard.</p>
                                <p style="margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/buyer/offers/accepted" class="cta-button">VIEW PURCHASE</a>
                                </p>
                            </div>
                            
                            <p><strong>Important Reminder:</strong> Make sure to complete the transaction within the agreed timeframe. If you encounter any issues, contact our support team for assistance.</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">Congratulations on your successful purchase! This is an automated confirmation from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">Need assistance? Contact support at ${process.env.EMAIL_USER || "admin@bidnordic.com"}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Offer accepted email sent to buyer ${buyerEmail}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send offer accepted email:`, error);
    return false;
  }
};

const offerRejectedEmail = async (
  buyerEmail,
  buyerName,
  seller,
  auction,
  offerAmount,
  offerId,
  reason
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BidNordic" <${process.env.EMAIL_USER}>`,
      to: buyerEmail,
      subject: `❌ Offer Declined - ${auction?.title}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: #1e2d3b; padding: 25px 20px; text-align: center; }
                        .logo-container { margin-bottom: 15px; }
                        .brand-name { color: #edcd1f; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; }
                        .tagline { color: #ffffff; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9; }
                        .content { padding: 25px; }
                        .rejected-box { 
                            background: #f8d7da; 
                            padding: 25px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            border: 2px solid #f5c6cb;
                            text-align: center;
                        }
                        .rejected-title { 
                            font-size: 26px; 
                            font-weight: bold; 
                            color: #721c24;
                            margin-bottom: 10px;
                        }
                        .rejected-badge { 
                            background: #dc3545; 
                            color: #ffffff;
                            padding: 8px 20px; 
                            border-radius: 20px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .reason-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ffeaa7; }
                        .reason-title { color: #856404; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .item-card { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #edcd1f; }
                        .item-title { color: #1e2d3b; font-size: 22px; margin-bottom: 15px; text-align: center; }
                        .offer-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .detail-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .detail-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .detail-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                        .offer-amount { 
                            font-size: 32px; 
                            font-weight: bold; 
                            color: #dc3545; 
                            margin: 15px 0;
                            text-align: center;
                        }
                        .offer-amount span { text-decoration: line-through; }
                        .seller-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb; }
                        .seller-title { color: #0d47a1; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .next-steps { background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #c3e6cb; }
                        .steps-title { color: #155724; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
                        .cta-box { background: #1e2d3b; color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
                        .cta-title { color: #edcd1f; font-size: 20px; margin-bottom: 15px; font-weight: bold; }
                        .cta-button { 
                            background: #edcd1f; 
                            color: #1e2d3b !important; 
                            padding: 14px 30px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 0;
                        }
                        .secondary-button { 
                            background: #ffffff; 
                            color: #1e2d3b !important; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 15px;
                            margin: 10px 5px;
                            border: 2px solid #edcd1f;
                        }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e9ecef; margin-top: 25px; }
                        .footer-text { margin: 5px 0; }
                        .highlight { color: #edcd1f; font-weight: bold; }
                        .specs-section { margin: 25px 0; }
                        .specs-title { color: #1e2d3b; font-size: 18px; margin-bottom: 15px; font-weight: bold; text-align: center; }
                        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .spec-item { background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; text-align: center; }
                        .spec-label { color: #666; font-size: 14px; margin-bottom: 5px; }
                        .spec-value { font-weight: bold; color: #1e2d3b; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="BidNordic Logo" class="logo">
                            </div>
                            <div class="brand-name">BidNordic</div>
                            <div class="tagline">Nordic Online Auctions</div>
                        </div>
                        
                        <div class="content">
                            <div class="rejected-box">
                                <div class="rejected-title">❌ OFFER DECLINED</div>
                                <p style="font-size: 18px; color: #721c24;">The seller has declined your offer</p>
                                <div class="rejected-badge">OFFER NOT ACCEPTED</div>
                            </div>
                            
                            <p>Dear <span class="highlight">${buyerName}</span>,</p>
                            <p>We wanted to inform you that the seller has decided not to accept your offer on their item. This is a normal part of the negotiation process on BidNordic.</p>
                            
                            ${reason ? `
                            <div class="reason-box">
                                <div class="reason-title">📝 SELLER'S RESPONSE</div>
                                <p>"${reason}"</p>
                            </div>
                            ` : ""}
                            
                            <div class="item-card">
                                <div class="item-title">${auction?.title}</div>
                                ${auction.subTitle ? `<p style="text-align: center; color: #666;">${auction.subTitle}</p>` : ''}
                                
                                <div class="offer-amount">
                                    <span>${formatNOK(offerAmount)}</span>
                                </div>
                                
                                ${auction.specifications ? `
                                <div class="specs-section">
                                    <div class="specs-title">📋 Item Details</div>
                                    ${renderSpecifications(auction.specifications)}
                                </div>
                                ` : ''}
                                
                                <div class="offer-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Offer ID</div>
                                        <div class="detail-value">${offerId}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Declined On</div>
                                        <div class="detail-value">${new Date().toLocaleString()}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Listing Price</div>
                                        <div class="detail-value">${formatNOK(auction?.buyNowPrice || auction?.startPrice || 0)}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Status</div>
                                        <div class="detail-value" style="color: #dc3545;">DECLINED</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="seller-info">
                                <div class="seller-title">🏪 SELLER INFORMATION</div>
                                <p><strong>Seller:</strong> ${seller?.firstName || seller?.username}</p>
                                <p>The seller has chosen to decline your offer at this time. They may be open to a different offer amount or terms.</p>
                            </div>
                            
                            <div class="next-steps">
                                <div class="steps-title">🔄 NEXT STEPS & OPTIONS</div>
                                <p>• <strong>Make a new offer</strong> - Try a different amount or terms</p>
                                <p>• <strong>Browse other items</strong> - Find similar options that might be a better fit</p>
                                <p>• <strong>Use Buy Now option</strong> - If available, purchase immediately at the listed price</p>
                            </div>
                            
                            <div class="cta-box">
                                <div class="cta-title">🎯 KEEP SHOPPING</div>
                                <p>Don't be discouraged - negotiation is part of the auction process. Explore other options or try a different approach.</p>
                                <p style="margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL}/auctions" class="cta-button">BROWSE OTHER AUCTIONS</a>
                                </p>
                                <div>
                                    <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="secondary-button">MAKE NEW OFFER</a>
                                    <a href="${process.env.FRONTEND_URL}/buyer/offers" class="secondary-button">MY OFFERS</a>
                                </div>
                            </div>
                            
                            <p><strong>Remember:</strong> Each seller has their own criteria for accepting offers. Your next offer on a different item might be accepted!</p>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">This is an automated notification from BidNordic.</p>
                            <p class="footer-text">© ${new Date().getFullYear()} BidNordic. All rights reserved.</p>
                            <p class="footer-text">If you have questions about this decision, you can contact the seller directly.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    });

    console.log(`✅ Offer rejected email sent to buyer ${buyerEmail}`);
    return !!info;
  } catch (error) {
    console.error(`❌ Failed to send offer rejected email:`, error);
    return false;
  }
};

// Note: sendOfferOutbidNotifications is not needed as offers cannot be outbid
const sendOfferOutbidNotifications = async () => {
  console.log("sendOfferOutbidNotifications is deprecated - offers cannot be outbid");
  return false;
};

export {
  contactEmail, //tested
  contactConfirmationEmail, //tested
  resetPasswordEmail, //tested
  bidConfirmationEmail, // tested
  offerConfirmationEmail, // tested
  outbidNotificationEmail, // tested
  sendOutbidNotifications, // tested
  sendAuctionWonEmail, // tested
  sendAuctionEndedSellerEmail, // tested
  auctionListedEmail, // tested
  auctionEndingSoonEmail, // tested
  welcomeEmail, // tested
  newUserRegistrationEmail, // tested
  auctionWonAdminEmail, // tested
  auctionEndedAdminEmail, // tested
  flaggedCommentAdminEmail, // tested
  newCommentSellerEmail, // tested
  newCommentBidderEmail, // tested
  auctionSubmittedForApprovalEmail, // tested
  auctionApprovedEmail, // tested
  sendBulkAuctionNotifications, // tested
  newBidNotificationEmail, // tested
  newOfferNotificationEmail, // tested
  newAuctionNotificationEmail, // tested
  sendOfferOutbidNotifications, // Not needed
  paymentCompletedEmail, // tested
  paymentCompletedSellerEmail,
  paymentSuccessEmail, // No need to test now
  offerCanceledEmail, // tested
  offerAcceptedEmail, // tested
  offerRejectedEmail, // tested
};