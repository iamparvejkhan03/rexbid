import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const TermsOfUse = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Use</h1>
                    <p className="text-gray-600 mb-6">BidNordic | Last Updated: {formattedDate}</p>
                    
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-800 font-semibold mb-2">IMPORTANT – PLEASE READ</p>
                        <p className="text-red-700 text-sm">
                            These Terms govern your use of BidNordic. By registering or using our platform, 
                            you confirm your agreement to these Terms. All equipment is sold on a "sold as seen" 
                            trade basis without warranty unless otherwise stated.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>BidNordic</strong> ("we", "our", "us") operates an online marketplace for heavy 
                                equipment and industrial machinery. These Terms of Use ("Terms") govern your access to and use 
                                of our website, platform, and services.
                            </p>
                            <p className="text-gray-700">
                                By registering for, accessing, or using the Platform, you agree to be bound by these Terms.
                            </p>
                        </div>

                        {/* Section 1 - Platform Access */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Platform Access</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>BidNordic is open to both trade professionals and private buyers</li>
                                <li>All users must register and maintain accurate account information</li>
                                <li>We reserve the right to refuse or terminate access at our discretion</li>
                                <li>Users must comply with all applicable Swedish and EU laws</li>
                            </ul>
                        </div>

                        {/* Section 2 - Account Registration */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Account Registration</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Registration is free</li>
                                <li>You must provide accurate and complete information</li>
                                <li>You are responsible for maintaining account security</li>
                                <li>We may suspend or terminate accounts for misuse or non-payment</li>
                                <li>Account sharing or transferring is prohibited without consent</li>
                            </ul>
                        </div>

                        {/* Section 3 - Our Role */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Our Role</h2>
                            <p className="text-gray-700 mb-3">BidNordic may act as:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li><strong>Principal:</strong> Selling equipment we own directly</li>
                                <li><strong>Intermediary:</strong> Facilitating sales between third-party sellers and buyers</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold">
                                    In all cases, BidNordic manages the transaction and issues the invoice.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 - Transactions */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Auctions, Offers & Buy Now</h2>
                            <div className="bg-red-50 p-4 rounded mb-3">
                                <p className="text-red-700 font-semibold mb-2">LEGALLY BINDING COMMITMENTS</p>
                                <ul className="text-red-700 space-y-1 list-disc pl-5">
                                    <li>All bids, offers, and Buy Now purchases are legally binding contracts</li>
                                    <li>Bid retractions are not permitted</li>
                                    <li>Failure to complete payment constitutes a breach of contract</li>
                                    <li>Giveaway entries are subject to separate terms displayed with each promotion</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 - Buyer Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Buyer Fees</h2>
                            <p className="text-gray-700">
                                A minimal buyer fee applies to successful purchases. The fee amount is clearly displayed 
                                before you bid, make an offer, or complete a Buy Now purchase. All fees are in NOK unless 
                                otherwise stated.
                            </p>
                        </div>

                        {/* Section 6 - Seller Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Seller Fees</h2>
                            <p className="text-gray-700">
                                Sellers may be charged commission-based or fixed fees. Fee structures are agreed upon 
                                during the onboarding process. Sellers are responsible for managing their own listings, 
                                including descriptions and images.
                            </p>
                        </div>

                        {/* Section 7 - Payments */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payments</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Bank transfer is the primary payment method</li>
                                <li>Payment terms vary by listing – check each auction or sale for deadlines</li>
                                <li>Equipment will not be released until payment clears in full</li>
                                <li>All payments must be made in NOK</li>
                            </ul>
                        </div>

                        {/* Section 8 - Collection & Delivery */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Collection & Delivery</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Collection is available by appointment only</li>
                                <li>Please contact us at least 24 hours in advance to arrange collection</li>
                                <li>Delivery can be arranged across Norway at additional cost</li>
                                <li>Quotes for delivery are provided before dispatch</li>
                                <li>Risk transfers to buyer upon collection or delivery</li>
                            </ul>
                        </div>

                        {/* Section 9 - Sold As Seen */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Sold As Seen – No Warranty</h2>
                            <div className="bg-yellow-50 p-4 rounded mb-3">
                                <p className="text-red-600 font-bold text-center mb-2">ALL EQUIPMENT IS SOLD:</p>
                                <div className="text-center space-y-1">
                                    <p className="text-red-600">As seen / "i befintligt skick"</p>
                                    <p className="text-red-600">Without any warranty</p>
                                    <p className="text-red-600">Without consumer rights</p>
                                </div>
                            </div>
                            <p className="text-gray-700">
                                Equipment descriptions are provided for guidance only. Buyers are encouraged to ask questions 
                                before bidding or purchasing. We are here to help with any inquiries.
                            </p>
                        </div>

                        {/* Section 10 - Inspections & Returns */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Inspections & Returns</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>On-site inspections are not available before bidding</li>
                                <li>If you have concerns after winning, please contact us immediately</li>
                                <li>Returns are not automatically accepted – we review concerns case by case</li>
                                <li>All sales are final unless otherwise agreed in writing</li>
                            </ul>
                        </div>

                        {/* Section 11 - Title & Risk */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Title & Risk</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Legal title and ownership pass only when full payment is received</li>
                                <li>Risk of loss or damage transfers to buyer upon collection or delivery</li>
                                <li>Buyers are responsible for insurance from the moment of collection/delivery</li>
                            </ul>
                        </div>

                        {/* Section 12 - Default & Enforcement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Default & Enforcement</h2>
                            <p className="text-gray-700 mb-2">If payment is not completed, we may:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Cancel the sale and relist the equipment</li>
                                <li>Seek recovery of any losses or costs incurred</li>
                                <li>Suspend or permanently terminate the user's account</li>
                                <li>Report to relevant authorities if fraud is suspected</li>
                            </ul>
                        </div>

                        {/* Section 13 - Limitation of Liability */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Limitation of Liability</h2>
                            <p className="text-gray-700">
                                To the extent permitted by Swedish law, BidNordic's total liability is limited to the 
                                purchase price of the equipment in question. We are not liable for indirect or consequential 
                                losses. This does not limit liability for fraud, death, or personal injury caused by negligence.
                            </p>
                        </div>

                        {/* Section 14 - Governing Law */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>These Terms are governed by the laws of Norway</li>
                                <li>Disputes shall be resolved by the courts of Norway</li>
                                <li>BidNordic is located in {address}</li>
                            </ul>
                        </div>

                        {/* Section 15 - Changes to Terms */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Changes to These Terms</h2>
                            <p className="text-gray-700">
                                We may update these Terms from time to time. The "Last Updated" date indicates the most 
                                recent version. Material changes will be communicated via email or platform notice. 
                                Continued use after changes constitutes acceptance.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">BidNordic</p>
                                <p className="text-gray-700 text-sm mb-1">{address}</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Email: <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    Phone: <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                These Terms were last updated on {formattedDate}. If you have questions about these Terms, 
                                please contact us at {email}.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link 
                                to="/privacy-policy" 
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link 
                                to="/buyer-agreement" 
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Buyer Agreement
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default TermsOfUse;