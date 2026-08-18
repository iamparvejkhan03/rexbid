import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const BuyerAgreement = () => {
    const formattedDate = "1 June 2026";

    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>

                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Buyer Agreement
                    </h1>

                    <p className="text-gray-600 mb-6">
                        RexBid | Last Updated: {formattedDate}
                    </p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">
                            IMPORTANT – PLEASE READ CAREFULLY
                        </p>

                        <p className="text-blue-700 text-sm">
                            This Buyer Agreement governs all purchases and bids made through RexBid.
                            By placing a bid or submitting an offer, you agree to this Agreement.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">

                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>RexBid</strong> ("we", "our", "us") and you, the buyer ("Buyer"),
                                enter into this Buyer Agreement governing all purchases and transactions made through our platform.
                            </p>

                            <p className="text-gray-700">
                                By placing a bid or submitting an offer, you agree to be bound by this Agreement.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                1. Eligibility
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>RexBid is open to businesses and private buyers</li>
                                <li>Buyers must be at least 18 years old</li>
                                <li>All account information must be accurate and current</li>
                                <li>We may verify buyer identity where required</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                2. Binding Agreement
                            </h2>

                            <p className="text-gray-700 mb-3">
                                A legally binding agreement is formed when:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>You place the winning bid</li>
                                <li>Your offer is accepted by the seller</li>
                            </ul>

                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-red-600 font-semibold text-sm">
                                    All bids and accepted offers are legally binding. Bid withdrawals may not be permitted.
                                </p>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                3. Payments
                            </h2>

                            <p className="text-gray-700 mb-3">
                                Payment methods may vary depending on the listing.
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Payment may be processed through registered card payment</li>
                                <li>Some sellers may accept direct bank transfer or cash payment</li>
                                <li>Payment deadlines are shown on each listing</li>
                                <li>Items will not be released until payment is confirmed</li>
                                <li>Transactions may use GBP or EUR depending on region</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                4. Item Condition
                            </h2>

                            <p className="text-gray-700 mb-3">
                                All items are sold:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>As seen</li>
                                <li>Without guarantees unless stated otherwise</li>
                                <li>Based on seller-provided descriptions and photos</li>
                            </ul>

                            <p className="text-gray-600 text-sm">
                                Buyers are encouraged to review listings carefully before bidding.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                5. Inspections
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Inspection availability depends on the seller and listing</li>
                                <li>Additional photos or details may be requested before bidding</li>
                                <li>Buyers should ask questions before placing bids</li>
                            </ul>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                6. Buyer Concerns
                            </h2>

                            <p className="text-gray-700 mb-3">
                                If you experience an issue after a purchase:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Contact RexBid as soon as possible</li>
                                <li>We may review disputes between buyers and sellers</li>
                                <li>Resolutions are handled case by case</li>
                                <li>Refunds or returns are not guaranteed</li>
                            </ul>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                7. Collection & Delivery
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Collection details are arranged after payment</li>
                                <li>Delivery may be available depending on the listing</li>
                                <li>Buyers are responsible for transport arrangements unless stated otherwise</li>
                                <li>Risk transfers upon collection or delivery</li>
                            </ul>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                8. Failure to Pay
                            </h2>

                            <p className="text-gray-700 mb-2">
                                If payment is not completed within the required timeframe, RexBid may:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Cancel the transaction</li>
                                <li>Relist the item</li>
                                <li>Suspend or permanently restrict the buyer account</li>
                                <li>Recover any outstanding losses or fees</li>
                            </ul>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                9. Limitation of Liability
                            </h2>

                            <p className="text-gray-700">
                                To the extent permitted by Irish law, RexBid is not liable for indirect,
                                incidental, or consequential losses arising from use of the platform.
                                Liability is limited to the value of the transaction in question.
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                10. Governing Law
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of Ireland</li>
                                <li>Disputes are subject to the courts of Ireland</li>
                                <li>RexBid operates across Northern Ireland and the Republic of Ireland</li>
                            </ul>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                11. Entire Agreement
                            </h2>

                            <p className="text-gray-700">
                                This Buyer Agreement, together with our Terms of Use and Privacy Policy,
                                forms the complete agreement between buyers and RexBid.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Acceptance & Contact
                            </h2>

                            <p className="text-gray-700 mb-4">
                                By using RexBid, you confirm that you have read,
                                understood, and agreed to this Buyer Agreement.
                            </p>

                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">
                                    RexBid
                                </p>

                                <p className="text-gray-700 text-sm mb-1">
                                    {address}
                                </p>

                                <p className="text-gray-700 text-sm mb-1">
                                    Email:{" "}
                                    <a
                                        href={`mailto:${email}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {email}
                                    </a>
                                </p>

                                <p className="text-gray-700 text-sm">
                                    Phone:{" "}
                                    <Link to={`tel:${otherData?.phoneCode}${otherData?.phone}`} className="hover:text-[#D19F3E] transition">
                                        {otherData?.phoneCode} {otherData?.formatPhone(otherData?.phone)}
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Buyer Agreement was last updated on {formattedDate}.
                                It applies to all purchases and bids made through RexBid.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">

                            <Link
                                to="/terms-conditions"
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Terms & Conditions
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