import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const SellerAgreement = () => {
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Seller Agreement</h1>
                    <p className="text-gray-600 mb-6">BidNordic | Last Updated: {formattedDate}</p>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <p className="text-green-800 font-semibold mb-2">IMPORTANT – PLEASE READ CAREFULLY</p>
                        <p className="text-green-700 text-sm">
                            This Seller Agreement governs all listings and sales made through BidNordic.
                            By listing equipment on our platform, you agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>BidNordic</strong> ("we", "our", "us") and you, the seller ("Seller"),
                                enter into this Seller Agreement governing all equipment listings and sales made through our platform.
                            </p>
                            <p className="text-gray-700">
                                By creating a listing, you agree to be bound by this Agreement.
                            </p>
                        </div>

                        {/* Section 1 - Eligibility */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>BidNordic is open to both trade sellers and private individuals</li>
                                <li>Trade sellers include dealers, rental companies, fleet operators, and contractors</li>
                                <li>All sellers must register and maintain accurate account information</li>
                                <li>We reserve the right to verify identity and eligibility</li>
                                <li>Sellers must be at least 18 years of age</li>
                            </ul>
                        </div>

                        {/* Section 2 - Seller Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Seller Fees</h2>
                            <p className="text-gray-700 mb-3">BidNordic offers two fee models for sellers:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li><strong>Commission-based:</strong> A percentage of the final sale price</li>
                                <li><strong>Fixed fee:</strong> A predetermined flat fee per sale</li>
                            </ul>
                            <p className="text-gray-700 mb-2">Important notes:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Fee model is agreed upon during account setup or listing creation</li>
                                <li>No listing fees – you only pay when your item sells</li>
                                <li>All fees are clearly displayed before listing</li>
                                <li>Fees are non-negotiable and deducted from sale proceeds</li>
                                <li>All fees are in NOK and include applicable VAT</li>
                            </ul>
                        </div>

                        {/* Section 3 - Seller Responsibilities */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Seller Responsibilities</h2>
                            <p className="text-gray-700 mb-2">Sellers are solely responsible for:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Creating accurate and complete equipment listings</li>
                                <li>Providing clear, honest photographs</li>
                                <li>Ensuring all descriptions are truthful and not misleading</li>
                                <li>Responding to buyer questions in a timely manner</li>
                                <li>Managing their own listings without additional services from BidNordic</li>
                                <li>Complying with all applicable Swedish laws and regulations</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                BidNordic does not provide photography, inspection, or listing preparation services.
                            </p>
                        </div>

                        {/* Section 4 - Listing Accuracy */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Listing Accuracy</h2>
                            <p className="text-gray-700 mb-2">Sellers must ensure:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>Descriptions accurately reflect the equipment's condition, age, and specifications</li>
                                <li>Photos show the actual item for sale, including any defects</li>
                                <li>All material facts that could affect a buyer's decision are disclosed</li>
                            </ul>
                            <div className="bg-yellow-50 p-4 rounded">
                                <p className="text-red-600 font-semibold mb-2">Consequences of Misleading Listings:</p>
                                <ul className="text-red-700 space-y-1 list-disc pl-5">
                                    <li>Auction suspension</li>
                                    <li>Account suspension or permanent ban</li>
                                    <li>Liability for any losses incurred by buyers</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 - Listing Withdrawal */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Listing Withdrawal</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sellers may withdraw listings at any time before bids or offers are received</li>
                                <li><strong>Withdrawal is not permitted during an active auction</strong> once bids have been placed</li>
                                <li>For "Make an Offer" listings, withdrawal is not permitted once an offer is received</li>
                                <li>For Buy Now listings, withdrawal is not permitted once the item is purchased</li>
                                <li>Unauthorized withdrawal during active bidding may result in account suspension</li>
                            </ul>
                        </div>

                        {/* Section 6 - Contract Formation */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contract Formation</h2>
                            <p className="text-gray-700 mb-3">A legally binding contract is formed when:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>A buyer wins an auction (highest bid at closing)</li>
                                <li>A buyer's offer is accepted by the seller</li>
                                <li>A buyer completes a Buy Now purchase</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold mb-2">Seller's Right to Reject Offers:</p>
                                <p className="text-gray-700">
                                    For "Make an Offer" listings, sellers have the right to accept or reject any offer.
                                    No contract is formed until the seller explicitly accepts an offer.
                                </p>
                            </div>
                        </div>

                        {/* Section 7 - Payment to Sellers */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payment to Sellers</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>BidNordic collects full payment from buyers</li>
                                <li>Seller fees are deducted from the sale proceeds</li>
                                <li>Payment to sellers is processed as soon as possible after:</li>
                                <ul className="pl-5 mt-1 space-y-1">
                                    <li>• Buyer's payment has fully cleared</li>
                                    <li>• All transaction conditions are satisfied</li>
                                    <li>• No disputes or concerns are pending</li>
                                </ul>
                                <li>Payments are made via bank transfer to the seller's registered account</li>
                                <li>All payments are in NOK</li>
                            </ul>
                        </div>

                        {/* Section 8 - Transfer of Equipment */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Transfer of Equipment</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sellers must make equipment available for collection or delivery promptly after sale</li>
                                <li>Sellers must cooperate with buyers to arrange collection or delivery</li>
                                <li>Title and ownership transfer only after full payment is received by BidNordic</li>
                                <li>Risk transfers to buyer upon collection or delivery</li>
                            </ul>
                        </div>

                        {/* Section 9 - Seller Default */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Seller Default</h2>
                            <p className="text-gray-700 mb-2">If a seller fails to transfer equipment after a sale:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>BidNordic will attempt to mediate and resolve the issue</li>
                                <li>We will work with both parties to find a fair solution</li>
                                <li>If resolution is not possible, the sale may be cancelled</li>
                                <li>Buyer will receive a full refund</li>
                            </ul>
                            <p className="text-gray-700 mb-2">Consequences for seller default may include:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Account suspension or permanent ban</li>
                                <li>Liability for any losses incurred</li>
                                <li>Legal action if warranted</li>
                            </ul>
                        </div>

                        {/* Section 10 - Equipment Not as Described */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Equipment Not as Described</h2>
                            <p className="text-gray-700 mb-2">
                                If a buyer claims equipment is significantly not as described:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>BidNordic will investigate the claim</li>
                                <li>We may request evidence from both parties</li>
                                <li>If the listing was misleading, seller may be liable for:</li>
                                <ul className="pl-5 mt-1 space-y-1">
                                    <li>• Partial or full refund to buyer</li>
                                    <li>• Return shipping costs</li>
                                    <li>• Account suspension or ban</li>
                                </ul>
                            </ul>
                        </div>

                        {/* Section 11 - Prohibited Conduct */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Prohibited Conduct</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Misleading or fraudulent listings</li>
                                <li>Shill bidding (bidding on your own items)</li>
                                <li>Off-platform transactions to avoid fees</li>
                                <li>Failing to complete sales without valid reason</li>
                                <li>Abusive communication with buyers</li>
                                <li>Listing illegal or stolen equipment</li>
                            </ul>
                        </div>

                        {/* Section 12 - Limitation of Liability */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Limitation of Liability</h2>
                            <p className="text-gray-700">
                                To the extent permitted by Swedish law, BidNordic's total liability to sellers is limited to
                                the fees paid for the specific transaction in question. We are not liable for indirect or
                                consequential losses including lost profits. This does not limit liability for fraud, death,
                                or personal injury caused by negligence.
                            </p>
                        </div>

                        {/* Section 13 - Governing Law */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of Norway</li>
                                <li>Any disputes shall be resolved by the courts of Norway</li>
                                <li>BidNordic is located in {address}</li>
                            </ul>
                        </div>

                        {/* Section 14 - Changes to Agreement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Changes to This Agreement</h2>
                            <p className="text-gray-700">
                                We may update this Agreement from time to time. The "Last Updated" date indicates the most
                                recent version. Material changes will be communicated via email or platform notice.
                                Continued selling after changes constitutes acceptance.
                            </p>
                        </div>

                        {/* Section 15 - Entire Agreement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Entire Agreement</h2>
                            <p className="text-gray-700">
                                This Seller Agreement, together with our Terms of Use and Privacy Policy, constitutes the
                                entire agreement between you and BidNordic regarding your listings and sales on our platform.
                            </p>
                        </div>

                        {/* Acceptance & Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceptance & Contact</h2>
                            <p className="text-gray-700 mb-4">
                                By listing equipment on BidNordic, you acknowledge that you have read, understood, and agree
                                to this Seller Agreement.
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">BidNordic</p>
                                <p className="text-gray-700 text-sm mb-1">{address}</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Email: <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    Phone: <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Seller Agreement was last updated on {formattedDate}. It forms an integral part of
                                the contract for every equipment listing made through BidNordic.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/terms-of-use"
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Terms of Use
                            </Link>
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

export default SellerAgreement;