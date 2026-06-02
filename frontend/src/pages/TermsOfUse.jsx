import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const TermsOfUse = () => {
    const formattedDate = "1 June 2026";

    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>

                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Terms of Use
                    </h1>

                    <p className="text-gray-600 mb-6">
                        RexBid | Last Updated: {formattedDate}
                    </p>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-800 font-semibold mb-2">
                            IMPORTANT – PLEASE READ
                        </p>

                        <p className="text-red-700 text-sm">
                            These Terms govern your use of RexBid. By registering or using our platform,
                            you agree to these Terms. All listings are sold on a "sold as seen" basis
                            unless otherwise stated by the seller.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">

                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>RexBid</strong> ("we", "our", "us") operates an online marketplace
                                for machinery, agricultural equipment, vehicles, trailers, and commercial stock.
                                These Terms of Use ("Terms") govern your access to and use of our platform and services.
                            </p>

                            <p className="text-gray-700">
                                By registering for, accessing, or using the platform, you agree to be bound by these Terms.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                1. Platform Access
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>RexBid is open to businesses and private buyers</li>
                                <li>Users must provide accurate account information</li>
                                <li>We may suspend or restrict accounts where necessary</li>
                                <li>Users must comply with all applicable Irish and EU laws</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                2. Account Registration
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Registration is free unless otherwise stated</li>
                                <li>You are responsible for maintaining account security</li>
                                <li>Accounts must not be shared or transferred</li>
                                <li>We may suspend accounts for misuse, fraud, or unpaid fees</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                3. Our Role
                            </h2>

                            <p className="text-gray-700 mb-3">
                                RexBid operates as an online marketplace connecting buyers and sellers.
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>Sellers are responsible for their own listings and descriptions</li>
                                <li>Buyers are responsible for reviewing listings before bidding</li>
                                <li>RexBid may assist with communication and payment processing</li>
                            </ul>

                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold">
                                    RexBid acts as a marketplace platform and may not be the direct owner of listed items.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                4. Listings & Bidding
                            </h2>

                            <div className="bg-red-50 p-4 rounded mb-3">
                                <p className="text-red-700 font-semibold mb-2">
                                    LEGALLY BINDING BIDS
                                </p>

                                <ul className="text-red-700 space-y-1 list-disc pl-5">
                                    <li>All bids placed on RexBid are legally binding</li>
                                    <li>Bid retractions may not be permitted</li>
                                    <li>Winning bidders are expected to complete payment promptly</li>
                                    <li>Failure to complete payment may result in account suspension</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                5. Seller Fees
                            </h2>

                            <p className="text-gray-700">
                                RexBid charges a 3% seller commission on successful sales.
                                Featured listings may incur an additional 3% promotional fee.
                                Fees are communicated before listings are published.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                6. Payments
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Payments may be made directly to the seller by bank transfer or cash</li>
                                <li>In some cases, registered payment cards may be charged</li>
                                <li>Items will not be released until payment has been confirmed</li>
                                <li>Listings may use GBP or EUR depending on location</li>
                            </ul>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                7. Collection & Delivery
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Collection arrangements are made directly with the seller</li>
                                <li>Delivery availability depends on the individual listing</li>
                                <li>Buyers are responsible for transport unless otherwise agreed</li>
                                <li>Risk transfers to the buyer upon collection or delivery</li>
                            </ul>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                8. Sold As Seen
                            </h2>

                            <div className="bg-yellow-50 p-4 rounded mb-3">
                                <p className="text-red-600 font-bold text-center mb-2">
                                    ALL ITEMS ARE SOLD:
                                </p>

                                <div className="text-center space-y-1">
                                    <p className="text-red-600">As listed / sold as seen</p>
                                    <p className="text-red-600">Without guarantees unless stated</p>
                                    <p className="text-red-600">Subject to seller descriptions</p>
                                </div>
                            </div>

                            <p className="text-gray-700">
                                Buyers should carefully review all listing details and request additional
                                information where required before placing bids.
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                9. Inspections & Returns
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Inspection availability depends on the seller</li>
                                <li>Returns are not automatically accepted</li>
                                <li>Disputes are reviewed on a case-by-case basis</li>
                                <li>All completed sales are generally considered final</li>
                            </ul>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                10. Title & Risk
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Ownership transfers after full payment is received</li>
                                <li>Risk transfers upon collection or delivery</li>
                                <li>Buyers are responsible for insurance after collection</li>
                            </ul>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                11. Default & Enforcement
                            </h2>

                            <p className="text-gray-700 mb-2">
                                If payment is not completed, RexBid may:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Cancel the transaction</li>
                                <li>Relist the item</li>
                                <li>Suspend or terminate accounts</li>
                                <li>Recover losses or unpaid fees where permitted</li>
                            </ul>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                12. Limitation of Liability
                            </h2>

                            <p className="text-gray-700">
                                To the extent permitted by Irish law, RexBid is not responsible
                                for indirect losses, business interruption, or damages arising from
                                the use of the platform. Liability is limited to the extent permitted by law.
                            </p>
                        </div>

                        {/* Section 13 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                13. Governing Law
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>These Terms are governed by the laws of Ireland</li>
                                <li>Disputes are subject to the courts of Ireland</li>
                                <li>RexBid operates across Northern Ireland and the Republic of Ireland</li>
                            </ul>
                        </div>

                        {/* Section 14 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                14. Changes to These Terms
                            </h2>

                            <p className="text-gray-700">
                                We may update these Terms from time to time.
                                Continued use of the platform after updates constitutes acceptance of the revised Terms.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Contact Information
                            </h2>

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
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        {email}
                                    </a>
                                </p>

                                <p className="text-gray-700 text-sm">
                                    Phone:{" "}
                                    <a
                                        href={`tel:${phone}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {phone}
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                These Terms were last updated on {formattedDate}.
                                If you have questions, please contact us at {email}.
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