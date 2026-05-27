import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const SellerAgreement = () => {
    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString('en-IE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>

                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Seller Agreement
                    </h1>

                    <p className="text-gray-600 mb-6">
                        RexBid | Last Updated: {formattedDate}
                    </p>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <p className="text-green-800 font-semibold mb-2">
                            IMPORTANT – PLEASE READ CAREFULLY
                        </p>

                        <p className="text-green-700 text-sm">
                            This Seller Agreement governs all listings and sales made through RexBid.
                            By listing items on our platform, you agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">

                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>RexBid</strong> ("we", "our", "us") and you, the seller ("Seller"),
                                enter into this Seller Agreement governing all listings and sales made through our platform.
                            </p>

                            <p className="text-gray-700">
                                By creating a listing on RexBid, you agree to this Agreement.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                1. Eligibility
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>RexBid is open to businesses and private sellers</li>
                                <li>Sellers must be at least 18 years old</li>
                                <li>All account information must be accurate and up to date</li>
                                <li>We may verify seller identity where required</li>
                                <li>Sellers must comply with Irish and EU laws</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                2. Seller Fees
                            </h2>

                            <p className="text-gray-700 mb-3">
                                RexBid charges seller commission fees on successful sales:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>
                                    <strong>Standard Listing:</strong> 3% seller commission
                                </li>

                                <li>
                                    <strong>Featured Listing:</strong> Additional 3% promotional fee
                                </li>
                            </ul>

                            <p className="text-gray-700 mb-2">
                                Important notes:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>No fees apply unless the item sells</li>
                                <li>Fees are displayed before publishing listings</li>
                                <li>Sellers are responsible for applicable taxes and VAT</li>
                                <li>Listings may use GBP or EUR depending on region</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                3. Seller Responsibilities
                            </h2>

                            <p className="text-gray-700 mb-2">
                                Sellers are responsible for:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Creating accurate and honest listings</li>
                                <li>Uploading clear and genuine photographs</li>
                                <li>Disclosing known faults or defects</li>
                                <li>Responding to buyer questions promptly</li>
                                <li>Ensuring they legally own the listed item</li>
                                <li>Complying with all applicable regulations</li>
                            </ul>

                            <p className="text-gray-600 text-sm mt-3">
                                RexBid does not provide inspection or photography services unless stated otherwise.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                4. Listing Accuracy
                            </h2>

                            <p className="text-gray-700 mb-2">
                                Sellers must ensure:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>Descriptions accurately reflect the item condition</li>
                                <li>Photos represent the actual listed item</li>
                                <li>Important information is not hidden or misleading</li>
                            </ul>

                            <div className="bg-yellow-50 p-4 rounded">
                                <p className="text-red-600 font-semibold mb-2">
                                    Consequences of Misleading Listings:
                                </p>

                                <ul className="text-red-700 space-y-1 list-disc pl-5">
                                    <li>Listing removal</li>
                                    <li>Account suspension or permanent ban</li>
                                    <li>Liability for buyer losses where applicable</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                5. Listing Withdrawal
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Listings may be removed before bidding begins</li>
                                <li>Active listings with bids should not be withdrawn</li>
                                <li>Withdrawal during active bidding may result in account penalties</li>
                                <li>RexBid may remove listings that breach platform rules</li>
                            </ul>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                6. Contract Formation
                            </h2>

                            <p className="text-gray-700 mb-3">
                                A legally binding agreement is formed when:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>A buyer places the winning bid</li>
                                <li>A seller accepts an offer</li>
                            </ul>

                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold mb-2">
                                    Seller Rights
                                </p>

                                <p className="text-gray-700">
                                    Sellers may review and accept offers where applicable.
                                    Once accepted, the transaction becomes binding.
                                </p>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                7. Seller Payments
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Buyers may pay sellers directly depending on the listing</li>
                                <li>Sellers remain responsible for paying RexBid commission fees</li>
                                <li>Commission invoices must be paid within the stated timeframe</li>
                                <li>Payments may be processed in GBP or EUR</li>
                            </ul>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                8. Transfer of Items
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sellers must arrange collection or delivery promptly after payment</li>
                                <li>Sellers should cooperate with buyers during handover</li>
                                <li>Ownership transfers after full payment is received</li>
                                <li>Risk transfers upon collection or delivery</li>
                            </ul>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                9. Seller Default
                            </h2>

                            <p className="text-gray-700 mb-2">
                                If a seller fails to complete a transaction:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>RexBid may investigate the matter</li>
                                <li>The transaction may be cancelled</li>
                                <li>The buyer may receive a refund where applicable</li>
                                <li>The seller account may be suspended</li>
                            </ul>

                            <p className="text-gray-700 mb-2">
                                Additional consequences may include:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Permanent account restrictions</li>
                                <li>Recovery of unpaid fees or losses</li>
                                <li>Legal action where necessary</li>
                            </ul>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                10. Items Not as Described
                            </h2>

                            <p className="text-gray-700 mb-2">
                                If a buyer claims an item was significantly different from the listing:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>RexBid may review evidence from both parties</li>
                                <li>Sellers may be required to resolve disputes directly</li>
                                <li>Misleading listings may result in penalties or removal</li>
                            </ul>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                11. Prohibited Conduct
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Fraudulent or misleading listings</li>
                                <li>Fake bidding or price manipulation</li>
                                <li>Off-platform deals intended to avoid fees</li>
                                <li>Listing stolen or illegal items</li>
                                <li>Abusive or threatening behaviour</li>
                            </ul>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                12. Limitation of Liability
                            </h2>

                            <p className="text-gray-700">
                                To the extent permitted by Irish law, RexBid is not liable for indirect,
                                incidental, or consequential losses arising from use of the platform.
                                Liability is limited to the amount of fees paid for the transaction in question.
                            </p>
                        </div>

                        {/* Section 13 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                13. Governing Law
                            </h2>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of Ireland</li>
                                <li>Disputes are subject to the courts of Ireland</li>
                                <li>RexBid operates across Northern Ireland and the Republic of Ireland</li>
                            </ul>
                        </div>

                        {/* Section 14 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                14. Changes to This Agreement
                            </h2>

                            <p className="text-gray-700">
                                We may update this Agreement from time to time.
                                Continued use of RexBid after updates constitutes acceptance of the revised Agreement.
                            </p>
                        </div>

                        {/* Section 15 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                15. Entire Agreement
                            </h2>

                            <p className="text-gray-700">
                                This Seller Agreement, together with our Terms of Use and Privacy Policy,
                                forms the complete agreement between sellers and RexBid.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Acceptance & Contact
                            </h2>

                            <p className="text-gray-700 mb-4">
                                By listing items on RexBid, you confirm that you have read,
                                understood, and agreed to this Seller Agreement.
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
                                This Seller Agreement was last updated on {formattedDate}.
                                It applies to all listings created through RexBid.
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