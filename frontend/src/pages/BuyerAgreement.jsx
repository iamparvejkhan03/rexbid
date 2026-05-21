import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const BuyerAgreement = () => {
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Buyer Agreement</h1>
                    <p className="text-gray-600 mb-6">BidNordic | Last Updated: {formattedDate}</p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">IMPORTANT – PLEASE READ CAREFULLY</p>
                        <p className="text-blue-700 text-sm">
                            This Buyer Agreement governs all purchases made through BidNordic. 
                            By placing a bid, making an offer, or using Buy Now, you agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>BidNordic</strong> ("we", "our", "us") and you, the buyer ("Buyer"), 
                                enter into this Buyer Agreement governing all purchases made through our platform.
                            </p>
                            <p className="text-gray-700">
                                By placing a bid, making an offer, or using Buy Now, you agree to be bound by this Agreement.
                            </p>
                        </div>

                        {/* Section 1 - Eligibility */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>BidNordic is open to both trade professionals and private buyers</li>
                                <li>All buyers must register and maintain accurate account information</li>
                                <li>We reserve the right to verify identity and eligibility</li>
                                <li>Buyers must be at least 18 years of age</li>
                            </ul>
                        </div>

                        {/* Section 2 - Binding Contract */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Binding Contract</h2>
                            <p className="text-gray-700 mb-3">A legally binding contract is formed when:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>You win an auction (highest bid at closing)</li>
                                <li>Your offer is accepted by the seller</li>
                                <li>You complete a Buy Now purchase</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-red-600 font-semibold text-sm">
                                    All bids, offers, and Buy Now actions are legally binding. Bid retractions are not permitted.
                                </p>
                            </div>
                        </div>

                        {/* Section 3 - Buyer Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Buyer Fees</h2>
                            <p className="text-gray-700">
                                A minimal buyer fee applies to successful purchases. The fee amount is clearly displayed 
                                before you bid, make an offer, or complete a Buy Now purchase. All fees are in NOK and 
                                are non-refundable except as required by applicable law.
                            </p>
                        </div>

                        {/* Section 4 - Equipment Condition */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Equipment Condition</h2>
                            <p className="text-gray-700 mb-3">All equipment is sold:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>As seen / "i befintligt skick"</li>
                                <li>Without any warranty, express or implied</li>
                                <li>Without consumer protection rights (for trade buyers)</li>
                            </ul>
                            <p className="text-gray-600 text-sm">
                                Descriptions, photographs, and specifications are provided for guidance only and do not 
                                form part of any contractual warranty.
                            </p>
                        </div>

                        {/* Section 5 - Inspections */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Inspections</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>On-site inspections are not available before bidding</li>
                                <li>If you have questions about a listing, please contact us before bidding</li>
                                <li>We are happy to provide additional information or photos upon request</li>
                                <li>Failure to ask questions before bidding is at the buyer's sole risk</li>
                            </ul>
                        </div>

                        {/* Section 6 - Concerns After Purchase */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Concerns After Purchase</h2>
                            <p className="text-gray-700 mb-3">
                                If you have concerns after winning an auction or completing a purchase:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Contact us immediately at {email}</li>
                                <li>We will review your concerns on a case-by-case basis</li>
                                <li>Returns are not automatic but may be considered in exceptional circumstances</li>
                                <li>All decisions are made in good faith and are final</li>
                            </ul>
                        </div>

                        {/* Section 7 - Payment */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payment</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Bank transfer is the primary payment method</li>
                                <li>Payment terms vary by listing – check each auction or sale for specific deadlines</li>
                                <li>All payments must be made in NOK</li>
                                <li>Equipment will not be released until full payment clears</li>
                                <li>Title and ownership pass only after full payment is received</li>
                            </ul>
                        </div>

                        {/* Section 8 - Collection & Delivery */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Collection & Delivery</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Collection is available by appointment only – please contact us at least 24 hours in advance</li>
                                <li>Delivery can be arranged across Norway at the buyer's expense</li>
                                <li>Delivery quotes are provided before dispatch</li>
                                <li>Risk of loss or damage transfers to the buyer upon collection or delivery</li>
                                <li>Buyers are responsible for insurance from the moment of collection/delivery</li>
                            </ul>
                        </div>

                        {/* Section 9 - Default & Enforcement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Default & Enforcement</h2>
                            <p className="text-gray-700 mb-2">If payment is not completed within the required timeframe, we may:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Cancel the sale and relist the equipment</li>
                                <li>Seek recovery of any losses or costs incurred</li>
                                <li>Suspend or permanently terminate the buyer's account</li>
                                <li>Report to relevant authorities if fraud is suspected</li>
                            </ul>
                        </div>

                        {/* Section 10 - Limitation of Liability */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
                            <p className="text-gray-700">
                                To the extent permitted by Swedish law, BidNordic's total liability is limited to the 
                                purchase price of the equipment in question. We are not liable for indirect or consequential 
                                losses including but not limited to lost profits or business interruption. 
                                This does not limit liability for fraud, death, or personal injury caused by negligence.
                            </p>
                        </div>

                        {/* Section 11 - Governing Law */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of Norway</li>
                                <li>Any disputes shall be resolved by the courts of Norway</li>
                                <li>BidNordic is located in {address}</li>
                            </ul>
                        </div>

                        {/* Section 12 - Entire Agreement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Entire Agreement</h2>
                            <p className="text-gray-700">
                                This Buyer Agreement, together with our Terms of Use and Privacy Policy, constitutes the 
                                entire agreement between you and BidNordic regarding your purchases on our platform.
                            </p>
                        </div>

                        {/* Acceptance & Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceptance & Contact</h2>
                            <p className="text-gray-700 mb-4">
                                By using BidNordic, you acknowledge that you have read, understood, and agree to this Buyer Agreement.
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
                                This Buyer Agreement was last updated on {formattedDate}. It forms an integral part of 
                the contract for every equipment purchase made through BidNordic.
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
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default BuyerAgreement;