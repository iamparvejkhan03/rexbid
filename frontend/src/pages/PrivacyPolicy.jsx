import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const PrivacyPolicy = () => {
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
                    <p className="text-gray-600 mb-6">RexBid | Last Updated: {formattedDate}</p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">IRISH MARKETPLACE</p>
                        <p className="text-blue-700 text-sm">
                            RexBid operates across Northern Ireland and the Republic of Ireland.
                            This policy explains how we collect, use, and protect your information
                            in accordance with Irish and EU data protection laws.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">

                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>RexBid</strong> ("we", "our", "us") is committed to protecting
                                and respecting your privacy. This Privacy Policy explains how we collect,
                                use, and safeguard your information when you use our machinery and vehicle
                                marketplace platform.
                            </p>

                            <p className="text-gray-700">
                                By registering for, accessing, or using the platform, you agree to this Privacy Policy.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>

                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Personal Information</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>Full name, business name, and contact details</li>
                                <li>Business address and company information</li>
                                <li>Email address and telephone number</li>
                                <li>Payment and billing details</li>
                                <li>Identification documents where required for verification</li>
                            </ul>

                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Platform & Transaction Data</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>Account credentials and login information</li>
                                <li>Listings, bids, account activity, and transaction history</li>
                                <li>Communication records between users and support</li>
                                <li>Payment and commission records</li>
                            </ul>

                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Automatically Collected Data</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>IP address, device type, and browser information</li>
                                <li>Usage data including pages visited and time spent</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>

                            <p className="text-gray-700 mb-3">
                                We process your information for:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Platform operation and account management</li>
                                <li>Verifying user identity and account security</li>
                                <li>Managing listings, bids, and transactions</li>
                                <li>Processing payments and seller commissions</li>
                                <li>Sending service updates and transaction notifications</li>
                                <li>Preventing fraud and maintaining platform security</li>
                                <li>Complying with Irish and EU legal obligations</li>
                                <li>Improving platform performance and user experience</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                3. Legal Basis for Processing (GDPR)
                            </h2>

                            <p className="text-gray-700 mb-3">
                                Under the General Data Protection Regulation (GDPR), we process information based on:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>
                                    <strong>Contractual Necessity:</strong> To provide our marketplace services
                                </li>
                                <li>
                                    <strong>Legitimate Interests:</strong> To operate and improve the platform
                                </li>
                                <li>
                                    <strong>Legal Obligation:</strong> To comply with Irish and EU laws
                                </li>
                                <li>
                                    <strong>Consent:</strong> Where consent is legally required
                                </li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>

                            <p className="text-gray-700 mb-3">
                                We may share your information with:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Payment processors and technology providers</li>
                                <li>Other users where necessary to complete transactions</li>
                                <li>Legal authorities where required by Irish or EU law</li>
                                <li>Professional advisers and business partners</li>
                            </ul>

                            <p className="text-gray-600 text-sm mt-3">
                                We do not sell your personal information to third parties.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>

                            <p className="text-gray-700 mb-3">
                                We implement security measures including:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>SSL/TLS encryption for secure data transmission</li>
                                <li>Secure hosting infrastructure and access controls</li>
                                <li>Authentication and account protection measures</li>
                                <li>Regular security monitoring and updates</li>
                            </ul>

                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-600 text-sm">
                                    While we work to protect your information, no online platform or
                                    internet transmission can be guaranteed to be completely secure.
                                </p>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>

                            <p className="text-gray-700">
                                We use cookies and similar technologies to improve platform functionality,
                                analyse usage, and enhance user experience. You can manage cookies through
                                your browser settings.
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights (GDPR)</h2>

                            <p className="text-gray-700 mb-3">
                                Under GDPR, you have the right to:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your data in certain circumstances</li>
                                <li>Restrict or object to processing</li>
                                <li>Request data portability</li>
                                <li>Withdraw consent where applicable</li>
                            </ul>

                            <p className="text-gray-600 text-sm mt-3">
                                To exercise your rights, contact us at {email}. We may need to verify your identity before processing requests.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Data Retention</h2>

                            <p className="text-gray-700 mb-3">
                                We retain information as necessary for:
                            </p>

                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Maintaining active accounts and transactions</li>
                                <li>Accounting and tax obligations under Irish law</li>
                                <li>Dispute resolution and fraud prevention</li>
                                <li>Business and operational purposes</li>
                            </ul>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. International Transfers</h2>

                            <p className="text-gray-700">
                                Your information is primarily processed within the EU/EEA.
                                Where data is transferred outside the EU/EEA, appropriate safeguards
                                will be used in accordance with GDPR requirements.
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Third-Party Links</h2>

                            <p className="text-gray-700">
                                Our platform may contain links to third-party websites or services.
                                This Privacy Policy applies only to RexBid.
                            </p>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Policy Updates</h2>

                            <p className="text-gray-700">
                                We may update this Privacy Policy from time to time.
                                Changes will be posted on this page with an updated revision date.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                12. Contact Us
                            </h2>

                            <p className="text-gray-700 mb-4">
                                If you have questions about this Privacy Policy or your personal data, contact us:
                            </p>

                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">RexBid</p>

                                <p className="text-gray-700 text-sm mb-1">{address}</p>

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

                            <p className="text-gray-600 text-sm mt-4">
                                You also have the right to lodge a complaint with the Data Protection Commission (DPC) in Ireland.
                            </p>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Privacy Policy is governed by the laws of Ireland.
                                Any disputes will be subject to the jurisdiction of the courts of Ireland.
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

export default PrivacyPolicy;