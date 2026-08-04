import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const TermsConditions = () => {
    const formattedDate = "2 August 2026";

    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>

                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Terms & Conditions
                    </h1>

                    <p className="text-gray-600 mb-6">
                        RexBid | Last Updated: {formattedDate}
                    </p>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-800 font-semibold mb-2">
                            IMPORTANT – PLEASE READ
                        </p>

                        <p className="text-red-700 text-sm">
                            These Terms constitute a legally binding agreement made between a User, whether buyer or seller, and REXBID Limited, concerning a User's registration, access to and use of the Site, and the Services. By accessing the Site, and the Services provided by us, you the User (whether seller or buyer) confirm to us, that you the User have read, understood and agreed to be bound by these Terms, the Privacy Statement and the Cookies Policy. If you the User (whether buyer or seller) do not wish to be bound by these Terms, Privacy Statement and Cookies Policy or if you do not agree with all of these Terms, then you are expressly prohibited from applying to register and to use, the Site and the Services and you must discontinue access and use immediately.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">

                        {/* Who we are and how to contact us */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                Who we are and how to contact us
                            </h2>

                            <p className="text-gray-700 mb-4">
                                We are REXBID Limited trading as Rexid, a limited company (registration number 819231). We are based at Corfeehone, Poles, Co. Cavan H12V6W3. For information, the best way to contact us, is to email admin@rexbid.com.
                            </p>

                            <p className="text-gray-700 mb-4">
                                We provide the Services (as defined below) which can be accessed through our website https://www.rexbid.ie (the "Site").
                            </p>

                            <p className="text-gray-700 mb-4">
                                REXBID Limited allows third party sellers to list and sell by timed auction their products on the Site. While we help facilitate transactions that are carried out on the Site, we are neither the buyer nor the seller of a seller's products. We REXBID Limited provide a timed auction service for sellers and buyers to negotiate and complete transactions.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Accordingly, the contract formed at the completion of a sale of a product is solely between a User buyer and the relevant User seller. We, REXBID Limited are not a party to any such contract, save we act as agent for the seller for the limited purposes set out in clause 13. However as stated in clause 13 below, we do not assume any liability arising out of or in connection with it.
                            </p>

                            <p className="text-gray-700 mb-4">
                                These Terms constitute a legally binding agreement made between a User, whether buyer or seller, and REXBID Limited, concerning a User's registration, access to and use of the Site, and the Services. By accessing the Site, and the Services (defined below) provided by us, you the User (whether seller or buyer) confirm to us, that you the User have read, understood and agreed to be bound by these Terms, the Privacy Statement https://rexbid.ie/privacy-policy and the Cookies Policy.
                            </p>

                            <p className="text-gray-700 mb-4">
                                If you the User (whether buyer or seller) do not wish to be bound by these Terms, Privacy Statement and Cookies Policy or if you do not agree with all of these Terms, then you are expressly prohibited from applying to register and to use, the Site and the Services and you must discontinue access and use immediately.
                            </p>

                            <p className="text-gray-700">
                                These Terms, the Privacy Statement https://rexbid.ie/privacy-policy and or the Cookies Policy may change or be updated from time to time. It remains the User's responsibility to access and check these Terms, the Privacy Statement https://rexbid.ie/privacy-policy and the Cookies Policy wherever you the User access's the Site.
                            </p>
                        </div>

                        {/* Section 1 - Definitions */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                1. Definitions
                            </h2>

                            <p className="text-gray-700 mb-3 font-semibold">
                                1.1 In these Terms, terms in bold have the following meanings:
                            </p>

                            <div className="space-y-2 text-gray-700">
                                <p><strong>agreement</strong> means the agreement formed, when the User accepts these Terms.</p>

                                <p><strong>account</strong> means the electronic account held by us in a User's name and which holds the information submitted by the User when the User is required to register with us in order to use the Services and such other information as allowed or required by us from time to time.</p>

                                <p><strong>account dashboard</strong> means the area on/of the Site, where a seller can create and manage auctions, and where a bidder can view and can track auctions that they are following, and where payments are made and managed.</p>

                                <p><strong>AML Requirements</strong> mean the requirements set out in the Criminal Justice (Money Laundering and Terrorist Financing) Act 2010 as amended ("CJA 2010") from time to time.</p>

                                <p><strong>appropriate technical and organisational measures</strong> has the meaning set out in data protection law.</p>

                                <p><strong>controller</strong> has the meaning set out in data protection law.</p>

                                <p><strong>data protection law</strong> means Regulation EU 2016/679 and the Data Protection Act 2018 as amended and all other legislation and regulatory requirements in force from time to time which apply to either you or us relating to the use of personal data.</p>

                                <p><strong>data subject</strong> has the meaning set out in data protection law.</p>

                                <p><strong>Commission</strong> means the Data Protection Commission.</p>

                                <p><strong>designated payment services provider</strong> means the payment services provider referred to by us on the Site.</p>

                                <p><strong>Company</strong> (referred to as either "the Company", "Rexbid" or "we", "us" or "our" in these User Terms) refers to REXBID Limited, registered in Ireland, registered number 819231 and having its registered office at Corfeehone, Poles, Co. Cavan H12V6W3.</p>

                                <p><strong>consumer</strong> means a natural person acting for purposes that are wholly or mainly outside his or her's trade, business, craft or profession.</p>

                                <p><strong>data protection law</strong> means the Data Protection Act 2018 and the General Data Protection Regulation (EU) 2016/679.</p>

                                <p><strong>Insolvency Event</strong> means in respect of a User, whether a buyer or a seller, that the User is unable to pay its or his or her debts as they fall due or becomes insolvent or an order is made or a resolution is passed for the liquidation, administration, winding-up or dissolution of a User (otherwise than for the purposes of a solvent amalgamation or reconstruction) or a liquidator, administrator, examiner, trustee or similar officer is appointed over all or any substantial part of the assets of the User or the User enters into or proposes any composition or arrangement with its or his or her creditors generally or anything analogous to the foregoing occurs in any applicable jurisdiction.</p>

                                <p><strong>Laws on Sanctions</strong> mean each of EU Sanctions and each of UN Sanctions as apply under the laws of Ireland from time to time.</p>

                                <p><strong>Liabilities</strong> means any liabilities, fines, costs, expenses, damages and losses (including but not limited to any direct, indirect or consequential losses, loss of profit, loss of reputation and any tax liabilities or third party charges such as brokers' fees) and all interest, penalties and legal costs and all other professional costs and expenses.</p>

                                <p><strong>Log-in</strong> means the part of the Site, termed as such which enables a User (whether seller or buyer) who is already registered with us to access the Site and the Services.</p>

                                <p><strong>our systems</strong> means the Site, the accounts, the accounts areas, and the hardware and software that support, operate and underlie the Site.</p>

                                <p><strong>permitted recipients</strong> means you the seller's employees and our employees and the entities Users use in connection with this agreement.</p>

                                <p><strong>personal data</strong> has the meaning set out in data protection law.</p>

                                <p><strong>personal data breach</strong> has the meaning set out in data protection law.</p>

                                <p><strong>policy</strong> means any policy of Rexbid referring to these Terms and published by us on the Site from time to time.</p>

                                <p><strong>processed</strong> has the meaning set out in data protection law.</p>

                                <p><strong>prohibited product</strong> means a product referred to in clause 49.</p>

                                <p><strong>product</strong> means such product as we accept for listing on the Site from time to time.</p>

                                <p><strong>profile</strong> means the part of the Site which allows a User (whether buyer or seller) to create a profile in a form indicated on the Site.</p>

                                <p><strong>Services</strong> mean introductory services that provide a forum allowing a User being a seller or a buyer to come together, the former to list and sell a product by timed auction and the latter to bid for a product and buy the product if successful.</p>

                                <p><strong>Site</strong> or the Site means the site accessible at https://www.rexbid.ie and our systems.</p>

                                <p><strong>third party claim</strong> means a claim or any kind of action against us made by anyone, including (but not limited to) a User buyer, any regulator, the Revenue Commissioners, or any third party rights holder, in connection with:</p>

                                <div className="pl-5 space-y-1">
                                    <p>(i) products, their importation to Ireland and their supply through the Site.</p>
                                    <p>(ii) content a User being a buyer or seller has uploaded to or otherwise distributed through our systems, including but not limited to, a User seller profile, a product listing, a User seller communications with a User buyer or a User buyer communications with a User seller, advertising, and any omissions or inaccuracies in such content.</p>
                                    <p>(iii) things we have or have not done in reliance on information you the User whether buyer or seller have provided (or omitted to provide) to us, including our exercise of rights you have granted to us.</p>
                                    <p>(iv) things you the User whether buyer or seller have or have not done, including but not limited to any breach of these Terms and our policies.</p>
                                </div>

                                <p><strong>Tax</strong> means value added tax chargeable under the laws of Ireland and including any similar, substitute, or replacement tax on, inter alia, the supply of services in and from Ireland.</p>

                                <p><strong>trader</strong> means as defined in the Consumer Rights Act 2022: (a) a natural person, or (b) a legal person, whether: (i) privately owned or (ii) publicly owned, or (ii) partly privately owned and partly publicly owned, who is acting for purposes relating to the person's trade, business, craft or profession and includes any person acting in the name or on behalf of the trader.</p>

                                <p><strong>Terms</strong> means the provisions at the outset of these Terms, clauses 1 to 51 and any other document incorporated by reference including any User seller application/registration form, User buyer application/registration form, and the Policies. The Terms also include all amendments thereto pursuant to clauses 46 and 47 below.</p>

                                <p><strong>timed auction</strong> shall have the meaning set out in clause 12.</p>

                                <p><strong>transfer</strong> means assign, novate, transfer, mortgage, charge, subcontract, delegate, declare a trust over or deal in any other manner with</p>

                                <p><strong>User</strong> or you means a natural person or a legal entity being a seller or a buyer who is accepted by us and registered with us for the purposes of listing a product on the Site in the case of a seller, or bidding for a product listed on the Site, in the case of a buyer.</p>

                                <p><strong>username</strong> means an email address of the User concerned and provided to us and which complies with these Terms.</p>

                                <p><strong>Vat</strong> means value added tax chargeable under the Value Added Tax Consolidation 2010 of Ireland and legislation supplemental thereto or replacing, modifying or consolidating it and including any similar, substitute, or replacement tax on, inter alia, the supply of goods or services in Ireland.</p>

                                <p><strong>User materials</strong> means any content, data or information (including trade marks and branding) a User provides to us in connection with the User's product or products.</p>

                                <p><strong>User buyer</strong> means a User who is a buyer.</p>

                                <p><strong>User seller</strong> means a User who is a seller.</p>
                            </div>

                            <p className="text-gray-700 mt-3">
                                1.2 in these terms a reference to a statute or statutory provision is a reference to it as amended, extended or re-enacted from time to time after the commencement of any agreement pursuant to these Terms.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                2. Our role
                            </h2>

                            <p className="text-gray-700">
                                2.1 We provide through the Site, a facility through which a User being a seller can list and sell by timed auction through the Site, a product and a User who is a buyer, can buy through the Site a product if successful at a timed auction held through the Site by the User seller. We do not have any contractual involvement in transactions (save as provided in clause 13), between a User buyers and a User seller and at no stage, auction, buy or sell or purport to auction, buy or sell any of the products displayed on our Site.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                3. Applying to register on the Site
                            </h2>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                3.1 User who is a seller
                            </h3>

                            <p className="text-gray-700 mb-2">
                                3.1.1 An applicant User seller, in order to use the Site functionality, must apply to register on the Site through the Sign-in functionality on the Site and provide to us such information as we require from time to time such as a username and a secure password, which password the applicant User will be required to confirm. The User seller must also provide such information as we may require to enable us comply with: (i) tax requirements; and; or (ii) any age verification requirements and; or (iii) AML Requirements and or (iv) Laws on Sanctions.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.1.2 During the application process, the applicant User seller undertakes to us: (i) not to disclose to us information which is or might be confidential information of a third party; (ii) to comply with these Terms, our Privacy Statement and our Cookies Policy.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.1.3 Each applicant User seller, acknowledges and agrees that we may refuse to register an applicant seller, at our absolute discretion. If the User seller's application is refused, you will receive an email to this effect. If your application to register has been approved by us, you will receive an email confirmation from us.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.1.4 You the applicant User seller, undertakes to us, not to submit to us, or use as a username: (i) a name that is otherwise offensive, vulgar or obscene, or false; or (ii) the name of another person or entity; or (iii) a name that is not lawfully available for use; or (iv) a name or mark that is subject to any rights, including trademark or service mark of another person or entity other than you.
                            </p>

                            <p className="text-gray-700 mb-4">
                                3.1.5 Each User seller undertakes to us, to keep its account details strictly confidential and further undertakes to us not to permit any third party to access or use: (i) its password; (ii) its username; or (iii) the User seller's account on the User seller's behalf or otherwise. The User seller will be liable for any and all actions made via the User seller's account.
                            </p>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                3.2 User who is a buyer
                            </h3>

                            <p className="text-gray-700 mb-2">
                                3.2.1 An applicant User buyer, in order to use the Site functionality, must apply to register on the Site through the Sign-in functionality on the Site and provide to us such information as we require from time to time, including providing a username and a secure password, which password the applicant User will be required to confirm. The User buyer must also provide and undertakes to provide to us, such information as we may require, to enable us comply with: (i) tax requirements; and; or (ii) any age verification requirements and; or (iii) AML Requirements; and or (iv) Laws on Sanctions; and or (v) evidence of financial capacity to bid for and purchase a product or products.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.2.2 During the application process, you the applicant User buyer agree and undertake to us: (i) not to disclose to us information which is or might be confidential information of a third party; (ii) to comply with these Terms, our Privacy Statement and our Cookies Policy.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.2.3 Each applicant User buyer, acknowledges and agrees that we may refuse to register the applicant User buyer, at our absolute discretion. If the User buyer application is refused, you will receive an email to this effect. If your application to register has been approved by us, you will receive an email confirmation from us.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.2.4 The applicant User buyer undertakes to us, not to submit to us, or use as a username: (i) a name that is otherwise offensive, vulgar or obscene, or false; or (ii) the name of another person or entity; or (iii) a name that is not lawfully available for use; or (iv) a name or mark that is subject to any rights including trademark or servicemark of another person or entity other than you.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.2.5 If the User buyer's application to register has been approved by us and any required deposit is paid, you will receive an email confirmation from us. One you have received this, you can log in to the Site. A User buyer must be registered at least 24 hours prior to the start of any timed auction, failing which, the User buyer may not be able to bid online in that timed auction.
                            </p>

                            <p className="text-gray-700 mb-2">
                                3.2.6 A User buyer undertakes to us to keep its account details strictly confidential and further undertakes to us not to permit any third party to access or use: (i) its password, (ii) its username or (iii) the User buyer's account on the User's behalf or otherwise. The User buyer will be liable for any and all bids made via the User buyer's account.
                            </p>

                            <p className="text-gray-700">
                                3.2.7 Our timed auctions may require a deposit paid by a User buyer. The User buyer will be prompted after registration, and told if a deposit is required. Where a deposit is required, the User buyer must undertake the action required by the pay deposit prompt. This deposit acts as a card hold, not a withdrawal, unless you, the User buyer successfully purchase a product during the timed auction.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                4. Representations and Warranties
                            </h2>

                            <p className="text-gray-700 mb-3">
                                4.1 Each User buyer and each User seller, represents, warrants and undertakes, to us:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>(a) that you are, and will remain, established in Ireland (but not Northern Ireland);</p>
                                <p>(b) that the information you provide to us in connection with your application to become a seller or buyer (as relevant) on the Site is complete and accurate;</p>
                                <p>(c) to: (i) promptly notify us of any changes to the information and (ii) keep the profile you create on the Site up to date;</p>
                                <p>(c) that any documents you submit to us to support your application or in response to any request from us at any time, are either genuine documents or are true copies of genuine documents.</p>
                            </div>

                            <p className="text-gray-700 mt-3 mb-2">
                                4.2 In relation to each product, the User seller, sells or offers for sale by timed auction through the use of our Services on our Site, undertakes to us and to each User buyer for the product that you have listed for sale by timed auction:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>4.2.1 that are you the absolute unencumbered legal owner of the product and with the right to sell the product uncumbered; and</p>
                                <p>4.2.2 that you are acting as a principal and not as agent for any third party;</p>
                                <p>4.2.3 that the use of the product or the sale of the product does not infringe any third party rights nor is it unlawful in any way and that the product is not a prohibited product on our current prohibited items list. See clause 49;</p>
                                <p>4.2.4 to list the product in the correct category with an accurate and appropriate description for it.</p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                5. Our rights to verify the information you give us and your compliance with these Terms
                            </h2>

                            <p className="text-gray-700 mb-2">
                                5.1 You the User (whether a seller or a buyer) agree, that we may at our option, at any time, require you to promptly provide us with reasonable evidence that any information you have given to us is true and up to date and that such information and your behaviour is in compliance with these Terms. Such information includes (but is not limited to) information: (i) in connection with your application to become a seller or a buyer on the Site as the case may be; (ii) in connection with your seller profile or buyer profile as the case may be; and (iii) information in respect of/in connection with a listing you have made on the Site of a product or products.
                            </p>

                            <p className="text-gray-700 mb-2">
                                5.2 Each User seller acknowledges and agrees that we can suspend or restrict one or more individual listings of/for a product or products that the User has made on the Site, until the User has supplied this evidence (as referred to in clause 5.1) and furthermore, we can end this agreement if the User seller does not comply with this requirement. See clause 28 (Suspension of listings, ending of this agreement and disputes).
                            </p>

                            <p className="text-gray-700">
                                5.3 Each User whether seller or buyer, hereby agrees to permit us and you each hereby instruct us, to collect information about you the User whether a buyer or a seller and in connection with your performance of any agreement made under these Terms, including without limitation in the case of a User seller, the product(s) you list on Site and disclose it to tax or other governmental or regulatory authorities as required by law or for compliance with our legal obligations.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                6. The Policies which form part of these Terms
                            </h2>

                            <p className="text-gray-700">
                                6.1 The policies we refer to on our Site from time to time which you must comply with, form part of these Terms and our agreement with you. See clause 46 (Changes to these Terms) for how and when we tell you about changes and how you can end this agreement if you're not happy with a change.
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                7. Our communications with each other
                            </h2>

                            <p className="text-gray-700 mb-2">
                                7.1 When we accept the application of a User whether seller or buyer, we will give the User access to the account dashboard for the User concerned. The User whether buyer or seller agrees that we may use the account dashboard to exercise our rights as against a User, whether buyer or seller, advise a User about commencement and closing of timed auctions, to ask you about User content or profiles, User buyer bids, User buyer orders, questions, cancellations and complaints and also other things about our Services, such as changes to these Terms and our policies. We may also contact you a User via telephone, email or other methods.
                            </p>

                            <p className="text-gray-700">
                                7.2 You the User whether seller or buyer, undertake to us to use the User account dashboard to get in touch with us, but you acknowledge and agree that we may also give you other ways of contacting us.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                8. User seller communications with User buyers
                            </h2>

                            <p className="text-gray-700 mb-2">
                                8.1 Each User seller undertake to us, to always use the User's account dashboard to (i) communicate with a User buyer who has successfully bid through the Site for a product that that the User seller has sold to the User buyer by timed auction through the Site; or (ii) enquired about a product through the Site. Where a User buyer, has successfully bid through the Site for a product that the User seller has sold by timed auction through the Site to the User buyer or finds the product on the Site and in either instance calls the User seller directly, you the User seller should enter accurate details of any communications with the User buyer on the User buyer in the account dashboard. This helps us to keep a full record of all communications in relation to any transaction, in case there are any disputes.
                            </p>

                            <p className="text-gray-700">
                                8.2 Each User seller undertake to us, that if a User buyer contacts the User seller about a product through the Site, the User seller undertakes to us, that the User seller will not in any way ask or encourage the User buyer to buy the product directly from the User seller.
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                9. Use of our systems
                            </h2>

                            <p className="text-gray-700 mb-2">
                                9.1 Each User whether a buyer or seller undertake to us, to only use the User's account dashboard on our Site to include our systems for: (i) listing, selling, buying by/through timed auction the product(s) that have or are listed on the Site and (ii) communicating with each other in respect of a product or products, referred to in these Terms and (iii) communicating with us.
                            </p>

                            <p className="text-gray-700 mb-2">
                                9.2 Each User whether a buyer or seller undertake to us, to use all reasonable security practices to prevent unauthorised access or damage to our Site and our systems. Without prejudice to the generality of the foregoing, each User whether buyer or seller undertakes to us to:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>9.2.1 make sure any device a User uses to access our Site and our systems have up to date anti-virus protection;</p>
                                <p>9.2.2 not introduce any virus into our Site and our systems;</p>
                                <p>9.2.3 ensure that the User log-in details and passwords for our systems:</p>
                                <div className="pl-5 space-y-1">
                                    <p>9.2.3.1 are only used by the User or in the case of a User Trader, its employees, who in each case are required to comply with the requirements set out in this clause; and furthermore;</p>
                                    <div className="pl-5 space-y-1">
                                        <p>(a) are not shared between Users; and</p>
                                        <p>(b) are changed as and when prompted by our systems.</p>
                                    </div>
                                </div>
                                <p>9.2.4 tell us immediately if the User thinks that log-in details or passwords are being or may be used in an unauthorised way or that the security of our systems has been compromised in any other way.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                9.3 Except as permitted by any applicable law which a User and we cannot agree to exclude, each User whether buyer or seller undertakes to us:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>9.3.1 not to attempt to copy, modify, duplicate, create derivative works from, frame, mirror, republish, download, display, transmit, or distribute all or any portion of the Site and or our systems in any form or media or by any means;</p>
                                <p>9.3.2 not to attempt to de-compile, reverse compile, disassemble, reverse engineer or otherwise reduce to human-perceivable form all or any part of the Site and or our systems;</p>
                                <p>9.3.3 not to access all or any part of the Site and or our systems to build a product or service which competes with them;</p>
                                <p>9.3.4 not to use our Site and or our systems to provide services to third parties or allow or assist third parties to access our systems;</p>
                                <p>9.3.5 not to create multiple accounts to seek to evade a breach of these Terms or to avoid restrictions set out in these Terms.</p>
                            </div>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                10. Creating a profile and listing products on the Site
                            </h2>

                            <p className="text-gray-700 mb-2">
                                10.1 If you the User seller's application for registration on the Site is accepted, you undertake to us to create a seller profile on the Site in your account dashboard. Once you have done this, you can create a listing in your account dashboard to sell your product on the Site through your account dashboard.
                            </p>

                            <p className="text-gray-700 mb-2">
                                10.2 You the User seller, represents and warrants to us that you the User will:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>10.2.1 only create a listing for a product that we have approved in writing and which is not a prohibited product (as set out in our prohibited products clause 49);</p>
                                <p>10.2.2 only list a product which complies with all applicable legislation and regulations affecting their manufacture, sale, packaging and labelling and which do not infringe third party trade marks or other intellectual property rights;</p>
                                <p>10.2.3 only list a product which is safe. You the User seller acknowledges and agrees with us that the User is prohibited from listing a product that is unsafe, or that had been or become the subject of a product safety alert or recall.</p>
                                <p>10.2.4 only list a product which is already in Ireland (but not Northern Ireland) at the time of the product's listing for sale by timed auction to a User buyer through the Site. You the User seller acknowledges and agrees with us, that the User is not permitted to list a product or products which is/ are or will be imported from Northern Ireland on or after their sale to a buyer, as this has Vat and customs implications for both you and us;</p>
                                <p>10.2.5 include in the User seller's listing in his account dashboard, all the information about the User seller and the product and how the User seller will fulfil an order. Where the User seller is a Trader and the User buyer is able to substantiate that it is a consumer, the User seller undertakes to ensure that the product and the product information complies with consumer protection law and safety laws, including any relevant safety information about the product.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                10.2.6 The User seller undertakes to us to ensure that the User seller profile and the listing for a product or products:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>10.2.6.1 are not misleading, obscene or defame anyone, is or are illegal or constitute misinformation or disinformation;</p>
                                <p>10.2.6.2 only feature high quality images and descriptions, in which the User seller has all the necessary intellectual property and other rights to use in this way on the Site and to license to us as set out in clause 27 (branding and other intellectual property rights);</p>
                                <p>10.2.6.3 are in the English language and be clear and comprehensible;</p>
                                <p>10.2.6.4 display the User seller's valid Vat registration number;</p>
                                <p>10.2.6.6 do not include anything which would encourage or allow a User buyer to contact you other than through the User seller account dashboard. The User seller acknowledges and agrees that we are entitled to require the User remove such information and if you do not, you are in breach of these Terms;</p>
                                <p>10.2.6.7 do not use any search engine optimisation techniques which breach search engines' guidelines or involve deception, including but not limited to keyword stuffing.</p>
                            </div>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                11. Fake, stolen or unauthorised products
                            </h2>

                            <p className="text-gray-700 mb-2">
                                11.1 Each User seller undertake to us to:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>11.1.1 only list a product(s) that bear another company's authorised brand or logo on the Site or which embody other third party intellectual property rights, if the product(s) were either made in Ireland or imported into Ireland from another EU member state, with the consent of all relevant third party intellectual property rights-holders.</p>
                                <p>11.1.2 to maintain adequate processes and procedures to make sure that each product that is listed on the Site is authentic, authorised for sale, not stolen, and not counterfeit or is not an unauthorised copy.</p>
                                <p>11.1.3 pomptly provide us on request with genuine and conclusive documentary evidence showing that you are authorised to sell specific brands or product(s) on the Site.</p>
                            </div>

                            <p className="text-gray-700 mt-2">
                                11.2 Each User seller acknowledges and agrees that we are entitled to suspend a listing for a product or terminate this agreement under clause 28 (Suspension of listings, ending this agreement and disputes) if the User fails to comply with any requirement of this clause 11.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                12. Timed online auction
                            </h2>

                            <p className="text-gray-700 mb-2">
                                12.1 A timed online auction is an auction format where all bidding takes place entirely online over a set period. Each timed auction runs for a specific duration. During this time, a User buyer can place a bid at any point before the timed auction for the particular product closes.
                            </p>

                            <p className="text-gray-700 mb-2">
                                12.2 A User buyer by selecting the page on which the product is listed on and that a timed auction is running, can place a bid on the page that the product is listed on. The User buyer can use the screen in their account dashboard to view the bids that they have placed. User buyers will be notified by email when they have placed a bid and whenever they have been 'outbid' by another User buyer.
                            </p>

                            <p className="text-gray-700 mb-2">
                                12.3 Each User buyer acknowledges and agrees: (i) that they are bidding in a timed auction; and (ii) and that each bid submitted is irrevocable and cannot be amended or corrected, even if submitted in error and notified to us. The User buyer accepts full liability for all bids submitted via the User buyer's account dashboard.
                            </p>

                            <p className="text-gray-700 mb-2">
                                12.5 To maintain a fair timed auction, in respect of a product receiving a last minute bid, the closing time in respect of that auction will be extended, to allow all bidders a chance to place additional bids before the product is sold.
                            </p>

                            <p className="text-gray-700 mb-2">
                                12.6 Each User whether a seller or a buyer, acknowledges and agrees that we may reject a registration to bid online, withdraw a permission for a User buyer to bid, or terminate a User buyer access to the Site and our systems, or terminate a User seller access to our Site and our systems, in any such case, during or after a timed auction, if in the case of a User seller, the User seller is in breach of any these Terms or in the case of a User buyer, the User buyer is in breach of any of these Terms.
                            </p>

                            <p className="text-gray-700">
                                12.7. Each User whether a seller or a buyer acknowledges and agrees that the User buyer who places the highest bid shall be the winner of the timed auction.
                            </p>
                        </div>

                        {/* Section 13 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                13. General provisions relating to products that are listed in the Site
                            </h2>

                            <p className="text-gray-700 mb-2">
                                13.1 Each User being a seller or a buyer acknowledges and agrees that we sell each product as agent for a User seller and as such are not responsible for any default by User whether by a seller or by a buyer.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.2 Each User buyer acknowledges and agrees with us that:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>13.2.1 all products are sold as seen and with all faults and imperfections and errors of description. Illustrations, make, model, miles, hours, kilometres, descriptions and years in catalogues, videos or brochures are for identification only. Descriptions in each case are provided by the User seller. Each User buyer undertakes to us: (i) to be responsible for satisfying themselves prior to the timed auction as to the condition of each product; and (ii) that it, he or she have exercised and relied on their own judgement as to whether the product accords with its description, is safe and is suitable for any purpose that a User buyer intends.</p>
                                <p>13.2.2 neither the User seller of any product nor we, our servants or agents are responsible for errors of description or for the authenticity of any product or for any misstatement as to any matter affecting the product. No User seller, has any authority to make or give, any representation or warranty in relation to any product on our behalf. Any terms, warranties or conditions whether express or implied by applicable law are excluded to the maximum extent permitted by applicable law.</p>
                                <p>13.2.3 each and every product offered for sale by a User seller shall be sold 'as is. Specifically, but without prejudice to the generality of the foregoing, we, make no representation or warranty that any of the products:</p>
                                <div className="pl-5 space-y-1">
                                    <p>(a) conform to any standard in respect of safety, pollution or hazardous material or to any standard of requirement of any applicable authority, law or regulation, or</p>
                                    <p>(b) are fit or suitable for any particular purpose, or</p>
                                    <p>(c) are merchantable or financeable, or satisfactory quality or conform to any applicable contract; or</p>
                                    <p>(d) are of any particular age, year of manufacture, model, make or condition.</p>
                                </div>
                                <p>13.2.4. that we are not responsible for any registration documents for/in respect of any products offered for sale. The User buyer acknowledges and agrees, that it is his responsibility to have checked the registration documentation and the roadworthiness of any offered product for sale.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                13.3 The User buyer warrants and undertakes to us: (i) that he/she/it has carried out a physical inspection of each product that the User places a bid on and that the User is not relying on us, nor are we liable, for any matter relating to the state or condition of a product; (ii) to repair, at the User buyer's cost, any product purchased such that it is in a safe operating condition and, without limitation, to place the product in a condition which meets any standard or requirement of any applicable; authority, law or regulation including those concerning any use to which the product may be put; and (iii) to be responsible for any damages caused by the loading of any product, or occurring during the transit of any product after purchase. Accordingly each User being a buyer acknowledges and agrees that no complaints will be entertained or accepted by us post auction in relation to a product.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.4. Without prejudice to the provisions of this clause 13, the User buyer acknowledges and agrees that each product is sold by a User seller without CE Marking unless specified otherwise. If any product has been or is described as CE Marked, the User buyer acknowledges that this description has been provided by the User seller. We makes no warranty as to the accuracy or authenticity of any CE Marking or any documentation on any product .
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.5 Each User buyer acknowledges and agree with us, that once the User makes a bid for a product, the User buyer is deemed to have inspected the product and accepted its condition, and any faults and or errors in the description of the product on the Site.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.6 Each User buyer acknowledges and agrees with us, that photos of products on the Site are for identification only and such photos must not be relied on as a substitute for a physical inspection.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.7 Each User buyer, who is the highest bidder after the timed auction has closed, undertakes to us and to the User seller in question, to complete the transaction for the purchase of the product in question.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.8 The price for a product for sale by timed auction through the Site, is a matter for the User seller to decide. Additionally each User buyer acknowledges and agrees with us, that a User seller is entitled to set an applicable reserve price for a product.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.9 Each User seller undertakes to us and to the other Users that the reserve price set by the User seller or winning price following the timed auction will in each case be exclusive of: (i) supply Vat; (ii) packaging and delivery charges; (iii) and our fees.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.10 Each product advertised by a User seller on which Vat is required to be added to the sale/purchase price shall be so indicated in the listing for the product on the Site. The Vat payable in addition to the sale price, where applicable shall be the Vat rate prevailing on the day of the closing of the timed auction during which the product is sold.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.11 Each User seller and each User buyer acknowledges and agrees with us and with every User that we do not offer fulfilment services such as delivery for/of products.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.12 Each User buyer acknowledges and agrees with us, that the placing of a bid by it, entitles us as agent of the seller and the seller, to rely on the bid and as a result you the User buyer warrant and undertake that you have the legal right to make such a bid and to enter into any such transaction.
                            </p>

                            <p className="text-gray-700 mb-2">
                                13.13 Each User buyer acknowledges and agrees with us and with the User seller, that the product shall be at the User buyer's risk, from the time the User buyer is notified by us that he or she is winning bidder.
                            </p>

                            <p className="text-gray-700">
                                13.14 Each User buyer, acknowledges and agrees with us and with the User seller, that title to the product the subject of a winning bid remains with the User seller until: (i) the purchase price plus Vat where applicable set by the winning bid; and (ii) the commission payable to us, have each been paid for in full to us or to our designated payment services provider. Subject to the aforegoing, title to the product passes to the User buyer upon satisfaction of both such provisions.
                            </p>
                        </div>

                        {/* Section 14 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                14. Additional general rules governing listing and selling
                            </h2>

                            <p className="text-gray-700 mb-2">
                                14.1 Each User seller acknowledges and agrees that a product will remain listed on the Site until: (a) it is sold; or (b) the User seller specified listed time expires; or (c) we receive written notice via email from you that you wish to de-list it. In this regard, you agree with us that a listed product will be de-listed on receipt by us of written notice via email from you the User seller that you wish to de-list it.
                            </p>

                            <p className="text-gray-700 mb-2">
                                14.2 Each User seller undertakes to us and to each other User whether buyer or seller, not to directly or indirectly place bids on products that the User seller offers for sale on our Site or manipulate bidding in any other way.
                            </p>

                            <p className="text-gray-700 mb-2">
                                14.3 Each User buyer undertakes to us: (i) not to collude with any User who is a seller; and (ii) not to collude with any other User who is a buyer in the making of bids for any product at any timed auction.
                            </p>

                            <p className="text-gray-700 mb-2">
                                14.4 When a User seller is deemed in accordance with this clause 14 to have accepted the bid as the winning bid, we acting as the User seller's agent in the seller's name and on the seller's behalf, will:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>14.4.1 send the User buyer an acknowledgement that his bid has been successful and of his/her order for the product;</p>
                                <p>14.4.2 promptly inform the User seller of the fact of the User buyer's winning bid via the User seller's dashboard and of the User buyer's order for the product.</p>
                                <p>14.4.3 send the User buyer an order acceptance email and so form a direct contract for the User seller to supply the product to the User buyer. The contract is between you the User seller and the User buyer.</p>
                                <p>14.4.4 take payment for the User buyer order for the User seller product when we confirm acceptance of an order in the User seller's name and on the User seller's behalf in accordance with clause 14.4.3. The User seller's dashboard area will tell you the User seller whether or not payment has been received for the order, by us or by our designated payment services provider.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                14.5 Our order acceptance email to the User buyer, on behalf of you the User seller will serve as the buyer's supply Vat receipt issued by us in the User seller's name and on behalf of the User seller. Our email will include all the information about the ordered product which the User seller has included in his product listing as well as separately showing the Irish supply Vat collected as part of the order. The User seller is responsible for ensuring that this information meets legal information requirements and for compliance with all applicable legal, tax and regulatory requirements in connection with any Vat receipt for the User buyer issued in your name ie the User seller by us on the User seller's behalf.
                            </p>

                            <p className="text-gray-700 mb-2">
                                14.6 Where a User buyer is Irish Vat registered, we will, where required by applicable law, provide the User seller with the User buyer's Irish Vat registration number and details of the relevant supply.
                            </p>

                            <p className="text-gray-700 mb-2">
                                14.7 When we advise the User seller about the order, the User seller must, (subject to we telling the User seller, through the User seller account dashboard that payment has been received by us from the User buyer, or from our designated payment services provider from the User buyer), supply/make available the product to the buyer at the address specified in the product listing.
                            </p>

                            <p className="text-gray-700">
                                14.8 You the User seller undertake to us and to the winning User buyer to comply in full with these Terms as they relate to the sale of the product to the User buyer.
                            </p>
                        </div>

                        {/* Section 15 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                15. Purchase price and fees on services
                            </h2>

                            <p className="text-gray-700 mb-2">
                                15.1. Each User seller, undertakes to us, to pay us a fee of 3% of the winning purchase price (before the application of Vat) of/for a product immediately on completion of the timed auction, plus Vat at the appropriate rate on the fee (the seller fee). The seller fee is capped at 200 euro before the application of Vat.
                            </p>

                            <p className="text-gray-700 mb-2">
                                15.2 Each User buyer, undertakes to us, to pay us a fee of 3% of the winning purchase price (before the application of Vat) of/for a product immediately on completion of the timed auction, plus Vat at the appropriate rate on the fee (the buyer fee). The buyer fee is capped at 200 euro before the application of Vat.
                            </p>

                            <p className="text-gray-700 mb-2">
                                15.3 Each User being a seller authorises us or our designated payment services provider, to deduct the seller fee from the seller's debit card provided to us on acceptance of their application for registration on the Site.
                            </p>

                            <p className="text-gray-700 mb-2">
                                15.4. Each User being a buyer authorises us or our designated payment services provider, to deduct the buyer fee from the buyer's debit card provided to us on acceptance of their application for registration on the Site.
                            </p>

                            <p className="text-gray-700 mb-2">
                                15.5 The User buyer acknowledges and agrees that we may charge interest on payments paid late whether by a User seller or by a User buyer, on a daily basis at a rate equivalent to 4% above the base lending rate of Allied Irish Bank's then in force.
                            </p>

                            <p className="text-gray-700 mb-2">
                                15.6.1 Each User seller, acknowledges and agrees that we shall not be obliged to release any funds to the User seller for any product sold through the Site, until such time as we have received cleared funds from the User buyer for such product or products.
                            </p>

                            <p className="text-gray-700 mb-2">
                                15.6.2 We will pay the User seller the sum received by us from the User buyer for the User seller less:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>(i) our commission/fees and any Vat applicable to it unless already paid by the User seller by User seller's debit card.</p>
                                <p>(ii) any fees (and any Vat applicable to them) or other sums we've invoiced you for and which are unpaid at the time we pay you, whether or not the due date for payment has arrived</p>
                                <p>(iii) any sums owed to us in connection with any clause 38 (Claims and actions against us in connection with you or your products) which are unpaid at the time we pay you the User seller.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                15.7 Each User buyer, undertakes to us to be responsible for any costs of delivery and for any insurance costs from the time risk passes to the User buyer as set out in clause 13.13 above.
                            </p>

                            <p className="text-gray-700 mb-2">
                                15.8 We charge User buyers and User sellers in Euro for our fees and the fees and applicable Vat must be paid by each User seller and by each User buyer in Euro.
                            </p>

                            <p className="text-gray-700">
                                15.9 You the User seller undertake to us to account to the Revenue Commissioners for any Vat due on sales of the User's products on the Site and fully comply with your tax obligations in connection with the use of our Services and the offer and sale of your products by timed auction on the Site including the collection, reporting, filing and payment of any and all applicable taxes (such as Vat, plastic packaging taxes and duties) and other governmental assessments.
                            </p>
                        </div>

                        {/* Section 16 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                16. User buyer questions about orders
                            </h2>

                            <p className="text-gray-700">
                                You the User seller undertake to us, to be available to deal with User buyer queries or our queries, whether raised by phone by us or by the User buyer with the User seller through the User seller's account dashboard. You the User seller undertake to us to deal promptly and professionally with any User buyer questions about an order for a product through the User seller's account dashboard or using your phone, when we or the User buyer contacts you by phone. You the User seller must liaise with us if the question relates to any part of the process that we are involved in. You the User seller undertake to co-operate with us in trying to resolve any such questions where the question relates to any part of our process.
                            </p>
                        </div>

                        {/* Section 17 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                17. User buyer cancellations
                            </h2>

                            <p className="text-gray-700">
                                We will tell you the User seller, if a User buyer who evidences to us, that the User is a consumer and that you the User seller are a Trader, and contacts us to cancel an order for a product bought under a timed auction. When we do so, or when the consumer User buyer contacts you directly to cancel an order, you the User seller must comply with the Consumer Rights Act 2022 and other consumer protections under Irish law and any further commitments you have made in your product listing or other marketing or advertising. You the User seller who is a Trader, must promptly tell us of any refunds due to User buyers who have cancelled.
                            </p>
                        </div>

                        {/* Section 18 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                18. Rankings
                            </h2>

                            <p className="text-gray-700">
                                Where we rank a product listing and enable a User seller to influence a ranking, in response to search queries made on the Site, we will set out in a policy on the Site, the main parameters we use to rank a product listing and what a User seller can do to influence their ranking.
                            </p>
                        </div>

                        {/* Section 19 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                19. Site promotions
                            </h2>

                            <p className="text-gray-700">
                                We may invite a User seller to participate in promotions on the Site for example, by paying us for a more visible listing (as explained in clause 18). The terms of such promotions will be available through the User seller account dashboard. A User seller by submitting any of the User's product(s) for such a promotion are deemed to agree to the relevant terms as set by us in your account dashboard.
                            </p>
                        </div>

                        {/* Section 20 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                20. How we use other sales channels and affiliates to market your products
                            </h2>

                            <p className="text-gray-700">
                                We may use other than the Site, social media channels to market your products, advertised by you for sale by timed auction on our Site and if so we will provide details of such in a policy on our Site.
                            </p>
                        </div>

                        {/* Section 21 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                21. Differences between how we sell your products and how we sell other products
                            </h2>

                            <p className="text-gray-700">
                                We do not sell our own products through the Site.
                            </p>
                        </div>

                        {/* Section 22 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                22. Platform Availability
                            </h2>

                            <p className="text-gray-700 mb-2">
                                22.1 While we will use reasonable endeavours to make our Services and the Site available, we cannot guarantee that they will operate continuously or without interruptions. This could affect bidding or other aspects of a timed auction or sale by a timed auction on our Site.
                            </p>

                            <p className="text-gray-700">
                                22.2 Each User whether seller or buyer uses our Site and Services entirely at their own risk. Access to and use of our Site and our Services is dependent upon, among other things, the availability of the internet and the speed and quality of internet connections. Our system will attempt a connection to a User buyer for a maximum of 20 seconds and if no response is received then, we will reopen the product for sale by another timed auction. If a product is reopened for sale by timed auction by us, the disconnected User can still bid again on/for same product.
                            </p>
                        </div>

                        {/* Section 23 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                23. Customer complaints
                            </h2>

                            <p className="text-gray-700 mb-2">
                                23.1 We will tell a User seller, if a User buyer complains to us about the User seller or about one of the User seller's products, including any complaints that products have not been delivered/made available as set out in a User seller listing and provide the User seller with all relevant details about the complaint.
                            </p>

                            <p className="text-gray-700 mb-2">
                                23.2 You the User seller undertake to us to deal with complaints we tell you about, and any complaints you receive directly from User buyers, in a way that complies with law and honour any additional commitments or guarantees you've made in your product listing or other marketing or advertising.
                            </p>

                            <p className="text-gray-700">
                                23.3 All User seller communications with User buyers about complaints must be made through the Site, and accurately logged in the User seller's account area.
                            </p>
                        </div>

                        {/* Section 24 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                24. Access to data
                            </h2>

                            <p className="text-gray-700 mb-2">
                                24.1 Under Article 9(1) of Regulation (EU) 2019/1150 providers of online intermediation services are required to include in their terms and conditions a description ( as more specifically detailed in Article 9(2)) of the technical and contractual access, or absence thereof, of business users to any personal data or other data, or both, which business users or consumers provide for the use of the online intermediation services concerned or which are generated through the provision of those services.
                            </p>

                            <p className="text-gray-700">
                                24.2 Where we provide any such technical or contractual access, we will provide such a description in a link accessible through this clause and by amendment to it.
                            </p>
                        </div>

                        {/* Section 25 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                25. Our and your rights of set-off
                            </h2>

                            <p className="text-gray-700">
                                Save as expressly provided in these Terms, each User seller and each User buyer undertakes to us to pay all amounts due under this agreement in full without any set-off, counterclaim, deduction or withholding (other than any deduction or withholding of tax as required by law).
                            </p>
                        </div>

                        {/* Section 26 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                26. Orders from outside Ireland
                            </h2>

                            <p className="text-gray-700">
                                The Site only displays information to buyers in the English language, only accepts payment in Euro and only permits User buyers to enter delivery addresses in Ireland and we make this clear to User buyers. A User buyer or potential User buyer must not seek to access the Site and the Services from outside Ireland. Additionally a User seller or a potential User seller not resident in Ireland must not seek to list products for sale through the Site.
                            </p>
                        </div>

                        {/* Section 27 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                27. Branding and other intellectual property rights
                            </h2>

                            <p className="text-gray-700 mb-2">
                                27.1 A User seller may publicise a product listing on the Site, outside the Site, for example, on social media. In doing so the User seller undertakes to us to take care not to in any way suggest that the User seller or the User seller product listing(s) are endorsed, controlled or created by our Site or by us. A User seller can share the urls for a product listing and the User page and state that the User product or products can be bought on the Site. However, the User seller undertakes to us not to use the Site name stylised name or logos either on their own or in combination with another word or use the Site name in the User seller social media profile name or photo. The User seller also undertakes to us not to create content with the same look or feel as that of the Site.
                            </p>

                            <p className="text-gray-700 mb-2">
                                27.2 As soon as reasonably possible after this agreement ends, you the User seller must remove any content that suggests you sell on the Site from any places you control and use your best efforts to remove such content from any places owned by any third parties.
                            </p>

                            <p className="text-gray-700 mb-2">
                                27.3 You the User seller grant us a non-exclusive, worldwide, royalty-free licence to host, reproduce, display and publish any content, data or information (including trade marks and branding) you provide to us (your materials) in connection with you and your products for the purposes of listing and selling your products on the Site and through other channels where so provided in clause 20 or in any policy referring to clause 20 of these Terms and operating, improving and marketing the Site in any media.
                            </p>

                            <p className="text-gray-700 mb-2">
                                27.4 Clause 38 (Claims and actions against us in connection with you or your products) sets out what happens if someone claims that our use of your materials (as set out above) infringes their intellectual property or other rights.
                            </p>

                            <p className="text-gray-700">
                                27.5 As soon as reasonably possible after this agreement ends, we will stop all use of your materials on the Site and any other channel referred to in clause 20. However, we reserve the right to continue using your materials for the purposes and period set out in clause 35 (Your obligations after this agreement ends) and clause 36 (Our rights and obligations after this agreement ends).
                            </p>
                        </div>

                        {/* Section 28 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                28. Suspension of listings, ending this agreement and disputes
                            </h2>

                            <p className="text-gray-700 mb-2">
                                28.1 Each User seller acknowledges and agrees that we can suspend or restrict any individual listing the User seller makes on the Site, if we become aware, or have reason to believe, that what the User seller has told us about the User product or said about the User product in the listing for it, is not true or up to date or that the product or the listing does not comply with these Terms, including our policies or is otherwise unlawful.
                            </p>

                            <p className="text-gray-700 mb-2">
                                28.2 Each User seller acknowledges and agrees that we can end this agreement and the User's rights to use the Site for any of the following reasons:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>28.2.1 if the User has not complied with these Terms, including the policies referred to in them and the non-compliance is more than trivial or is repeated;</p>
                                <p>28.2.2 if the User has not paid one of our invoices by the due date;</p>
                                <p>28.2.3 if the User has suffered an Insolvency Event;</p>
                                <p>28.2.4 if we reasonably consider that our continuing to provide Services to the User could expose the Site and our business to disrepute, contempt, scandal or ridicule, or would tend to shock, insult or offend the public or reflect unfavourably on the Site's reputation or the other User sellers selling on the Site.</p>
                                <p>28.2.5 if we decide to stop providing the Site or to stop selling your type of products on the Site;</p>
                                <p>28.2.6 if we reasonably determine, or receive information or notice from the Revenue Commissioners, that you the User seller are not meeting your tax obligations.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                28.3 We will give you at least 30 days' notice that we are ending this agreement unless:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>28.3.1 our legal, tax or regulatory obligations require us to end this agreement without such notice;</p>
                                <p>28.3.2 it is imperative for us to end this agreement either immediately or on shorter notice. For example, we may end this agreement with immediate effect if you suffer an Insolvency Event or we discover that your products are unsafe or counterfeit or present a danger to minors or if we reasonably suspect you of fraud or of using the Site or our name to spam others;</p>
                                <p>28.3.3 if you have repeatedly breached these Terms.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                28.4 If we are in respect of a User seller, suspending or restricting an individual listing for a product or products or ending this agreement, we will normally give you a written statement of the specific facts or circumstances which led to our decision and which of these Terms we consider the User seller has breached. If we are acting in response to a notification from someone else, we will also share the contents of that notification with you. However, we will not give you such a statement if:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>28.4.1 we are subject to a legal, tax or regulatory obligation not to provide the specific facts or circumstances or to set out our reasons;</p>
                                <p>28.4.2 we are ending this agreement because you have repeatedly breached it or parts of it.</p>
                            </div>

                            <p className="text-gray-700 mt-2">
                                28.5 We will send our statement to you the User seller via email or another durable medium. Where we are suspending or restricting an individual listing, we will send the statement before or at the time of the suspension or restriction. If we are ending this agreement, we will send the statement at the same time that we give notice that we are ending this agreement. See also clause 35 (Your obligations after this agreement ends) and clause 36 (Our rights and obligations after this agreement ends).
                            </p>
                        </div>

                        {/* Section 30 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                30. How to complain
                            </h2>

                            <p className="text-gray-700 mb-2">
                                30.1 If a User being a seller or buyer wish to complain about our Services or you disagree with the exercise by us of a right reserved to us in these Terms, please contact us through your account dashboard.
                            </p>

                            <p className="text-gray-700">
                                30.2 You and we agree to try our best to resolve any complaint. If we cannot resolve your complaint in this way, either of us can request mediation (see clause 31). In addition, we are both able to bring legal action at any time (see clauses 48.1 and 48.2).
                            </p>
                        </div>

                        {/* Section 31 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                31. Mediation of disputes
                            </h2>

                            <p className="text-gray-700 mb-2">
                                31.1 Either you or we can request that any dispute between us be referred to one of our preferred independent mediators, which are https://www.appealscentre.eu/ and https://impressdisputeresolutions.org/ Any such requests should be submitted through your account area. Both you and we must act in good faith when considering any requests for mediation and engaging in any mediation.
                            </p>

                            <p className="text-gray-700">
                                31.2 We may refuse mediation of a dispute which has previously been mediated if the mediator determined you were not acting in good faith in that mediation. We may also refuse mediation of any dispute connected to other disputes in which a mediator has repeatedly found in our favour.
                            </p>
                        </div>

                        {/* Section 32 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                32. How you can end this agreement
                            </h2>

                            <p className="text-gray-700 mb-2">
                                32.1 A User seller can end this agreement with immediate effect by giving us notice, using the seller interface, for any of the following reasons:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>32.1.1 we have not complied with these Terms, including any policies referred to in them and our non-compliance is more than trivial or is repeated and (if our non-compliance is remediable) we have not remedied it within 30 days of you asking us to do so;</p>
                                <p>32.1.2 we suspend, threaten to suspend, cease or threaten to cease to carry on all or a substantial part of our business or our financial position deteriorates to such an extent that you think our ability to fulfil our obligations under this agreement is at risk.</p>
                            </div>

                            <p className="text-gray-700 mt-2">
                                32.2 A User seller can also end this agreement if you decide to stop using the Site for any reason, including because you are not happy with changes we are making to these Terms. In these situations, you must give us notice that you are ending this agreement, using and through your account dashboard.
                            </p>
                        </div>

                        {/* Section 33 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                33. Upcoming changes
                            </h2>

                            <p className="text-gray-700 mb-2">
                                If you are ending this agreement because we have told you about an upcoming change to these Terms (see clause 46 (Changes to these terms)), you normally have a right to end this agreement within 15 days of us telling you about the change and the agreement will end at the end of those 15 days. The exceptions are that you cannot end this agreement in this way because of a change if:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>33.1 you have listed new products on the Site after being told about the change (although this will not prevent you from ending this agreement for a Significant change);</p>
                                <p>33.2 you have previously told us that you accept/have accepted the change.</p>
                            </div>
                        </div>

                        {/* Section 34 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                34. How you can end this agreement
                            </h2>

                            <p className="text-gray-700">
                                A User being a seller may stop using the Site at any time. This agreement will end when you the User seller have informed us, using the/through your account area, that you no longer wish to use the Site and that you have removed your product listings.
                            </p>
                        </div>

                        {/* Section 35 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                35. Your obligations after this agreement ends
                            </h2>

                            <p className="text-gray-700 mb-2">
                                35.1 A User seller, and after this agreement ends (for whatever reason) must (unless we tell you otherwise):
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>35.1.1 immediately remove any listings for the User's product(s) from the Site;</p>
                                <p>35.1.2 leave your buyer facing seller profile (excluding listings for your products) live until 30 days after your fulfilment of the last order resulting from a timed auction and that you received through the Site to allow User buyers to contact you about orders previously made. Once this period has expired you must remove your buyer facing seller profile;</p>
                                <p>35.1.3 continue to comply with these Terms insofar as they relate to buyer orders received through the Site arising from a timed auction, before removal of your product listings. You undertake to comply with the version of these Terms which applied when this agreement ended.</p>
                            </div>
                        </div>

                        {/* Section 36 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                36. Our rights and obligations after this agreement ends
                            </h2>

                            <p className="text-gray-700 mb-2">
                                36.1 After this agreement ends (for whatever reason) you the User being a seller agree that we:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>(i) may remove all listings for your products from the Site, if you have not already done so, and reject any order received after this agreement ends;</p>
                                <p>(ii) may remove your buyer facing seller profile from the Site if you have not already done so, except that we can keep it live until 30 days after your fulfilment of the last order you received through the Site to allow buyers to contact you about orders previously submitted;</p>
                                <p>(iii) will continue to comply with these Terms insofar as they relate to buyer orders received through the Site before removal of your product listings, including by paying sums due to you for such orders. We will comply with the version of these Terms which applied when this agreement ended;</p>
                                <p>(iv) will stop giving you access to data (including personal data) generated by your use of the Site where we have made data available pursuant to clause 24.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                36.2 After this agreement ends (for whatever reason) you the User being a buyer agree that we:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>(i) may remove all your details from the Site, if you have not already done so, and reject any order received after this agreement ends:</p>
                                <p>(ii) may remove your User seller facing seller profile from the Site if you have not already done so, except that we can keep it live until 30 days after your fulfilment of the last purchase made through the Site;</p>
                                <p>(iii) will continue to comply with these Terms insofar as they relate to buyer orders received through the Site before removal of your product listings, including by paying sums due to you for such orders. We will comply with the version of these Terms which applied when this agreement ended;</p>
                                <p>(iv) will stop giving you access to data (including personal data) generated by your use of the Site where we have done so through clause 24.</p>
                            </div>
                        </div>

                        {/* Section 37 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                37. Limitations and Exclusions of Liability
                            </h2>

                            <p className="text-gray-700 mb-2">
                                37.1. Each User whether a seller or a buyer, acknowledges and agrees with us: (i) that you use our Site and our Services at your own risk; and that (ii) our Site and our Services are provided as is and as available basis.
                            </p>

                            <p className="text-gray-700 mb-2">
                                37.2 To the extent permitted by applicable law, we exclude all warranties, terms and conditions, including but not limited to implied warranties of merchantability, suitability or fitness for purpose.
                            </p>

                            <p className="text-gray-700 mb-2">
                                37.3 In addition, to the extent permitted by applicable law, in no event will we, or any director or officer or employee be liable under these Terms and under any agreement, to any User whether seller or buyer or to any third party and whether arising in/under contract, liability under statute or statutory instrument, liability in tort (including negligence), misrepresentation, restitution or otherwise, for any indirect or consequential loss or damages, loss of profits, loss of goodwill, loss of sales or business, loss of agreements or contracts, loss of anticipated savings, and all such damages or losses are expressly excluded by these Terms and by agreement made thereunder, whether or not they or any of them were foreseeable or whether or not we were advised of such loss or damages.
                            </p>

                            <p className="text-gray-700 mb-2">
                                37.4 Subject to clause 37.1, clause 37.2 and clause 37.3 and except in respect of liabilities we cannot exclude for death or personal liability caused by our negligence, our total liability to a User whether buyer or seller is capped as follows:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>37.4.1 for loss arising from our failure to comply with the data protection provisions set out in clause 45 (data protection obligations), the cap is Euro 1,000;</p>
                                <p>37.4.2 for all other loss or damage the cap is Euro 100.</p>
                            </div>

                            <p className="text-gray-700 mt-2">
                                37.5 Unless a User whether seller or buy, notifies us that the User intends to make a claim in respect of an event within the notice period, we shall have no liability for that event. The notice period for an event, starts on the day on which the User became, or ought reasonably to have become, aware of the event having occurred and expires 180 calendar days from that date. The notice to us must be in writing and must identify the event and the grounds for the claim in reasonable detail.
                            </p>
                        </div>

                        {/* Section 38 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                38. Claims and actions against us in connection with you or your products
                            </h2>

                            <p className="text-gray-700 mb-2">
                                38.1 We will pass on to a User seller any complaints we receive about the User seller or a product as described in clause 23 (Customer complaints). However, if anyone, including (but not limited to) a User buyer, any regulator, the Revenue Commissioners, couriers or any third party rights holder, makes a claim or takes any kind of action against us in connection with:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>38.1.1 a product, its importation to Ireland and its supply through the Site;</p>
                                <p>38.1.2 content that the User seller, may have uploaded to or otherwise distributed through our systems, including but not limited to the User seller profile, the product listing(s), the User communications with a buyer(s) advertising, and any omissions or inaccuracies in such content;</p>
                                <p>38.1.3 things we have or have not done in reliance on information the User has provided (or omitted to provide) to us, including our exercise of rights that the User has granted to us;</p>
                                <p>38.1.4 things the User has or has not done, including but not limited to any breach of these Terms, any agreement incorporated thereunder and any of our policies;</p>
                                <p>38.1.5 a Third party claim, then you must, at our option and as we request, either help us defend or deal with the Third party claim or defend or deal with it on our behalf, in each case at your own expense. If we ask you to defend or deal with a claim on our behalf, you must get our prior written agreement before settling or compromising it or attempting to do so.</p>
                            </div>
                        </div>

                        {/* Section 39 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                39. Indemnity
                            </h2>

                            <p className="text-gray-700">
                                Each User (whether seller or buyer) undertakes to us to indemnify and hold us (and our respective officers, directors, employees, and agents) harmless from any claim or demand, including reasonable legal fees, made by any third party due to or arising out of any breach of these Terms by a User, or of any agreement, or from the User's improper use of our Services or the User's breach of any law or the rights of a third party.
                            </p>
                        </div>

                        {/* Section 40 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                40. Product recall and product liability insurance
                            </h2>

                            <p className="text-gray-700">
                                Each User being a seller and who is a Trader (as defined) undertakes to us to maintain appropriate, up-to-date and accurate records to enable the immediate recall of any of any of the User seller's products from the market. These records shall include details of deliveries to a User buyer (including delivery date, name and address of buyer and telephone number and email address if available). The User seller being a Trader undertake to us to also keep records of batch numbers, where appropriate.
                            </p>
                        </div>

                        {/* Section 41 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                41. Responsibility for product recall
                            </h2>

                            <p className="text-gray-700 mb-2">
                                41.1 Each User seller and who is a Trader, acknowledges and agreed with us, that it is liable to User buyers for the product recall of any of the User's products. We will provide the User seller and trader with information we hold about the User buyer(s) and the User seller's products sold to them as reasonably necessary to assist the User seller with the User seller's product recall obligations.
                            </p>

                            <p className="text-gray-700 mb-2">
                                41.2 If we ask the User seller who is a Trader to provide, the User Trader must give us evidence that it has promptly complied with the User seller Trader's product recall obligations. If the User seller being a Trader, does not do this within a reasonable time, we can do what we think appropriate to protect a User buyer, including contacting buyers to alert them to safety issues
                            </p>

                            <p className="text-gray-700">
                                41.3 Each User seller being a Trader undertake to cooperate with us in doing this and reimburse us all Liabilities we incur in connection with any recall of your products. Clause 38 (Claims and actions against us in connection with you or your products) applies in relation to any Third party claim that your products are unsafe.
                            </p>
                        </div>

                        {/* Section 42 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                42. We can notify buyers and others about unsafe products
                            </h2>

                            <p className="text-gray-700">
                                We may suspend or restrict a User seller listing for an unsafe product(s) as set out in clause 28 (Suspension of listings, ending this agreement and disputes) and notify a User buyer and the public of what we have done and why, by whatever means we consider appropriate. We may also include safety warnings about products as part of a User seller product listings. We may use information from User buyer complaints about User seller products when assessing the safety of User seller products, require further information from the User buyer about the issues reported and share such information with regulatory and other governmental authorities.
                            </p>
                        </div>

                        {/* Section 43 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                43. Product liability insurance
                            </h2>

                            <p className="text-gray-700">
                                Each User who is a seller and is a Trader undertakes to us to maintain product liability insurance covering any product for as long as it or they are listed on the Site and for two years after they stop being listed on the Site. Such insurance must provide cover of not less than Euro one million per annum and be with a reputable insurer. The User seller who is a Trader, undertakes to us to provide a copy of the insurance policy and proof of payment of the current premium to us when we ask for it.
                            </p>
                        </div>

                        {/* Section 44 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                44. Compliance with the law and our mandatory policies
                            </h2>

                            <p className="text-gray-700">
                                Each User seller and each User buyer undertake to us, at all times when doing anything in connection with these Terms including any agreement made thereunder to comply with the Terms, the Privacy Statement, and with any policy published by us on the Site related to the Services we provide and to these Terms and to any applicable law including Sanctions Law, AML Requirements and data protection law.
                            </p>
                        </div>

                        {/* Section 45 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                45. Data Protection Obligations
                            </h2>

                            <p className="text-gray-700 mb-2">
                                45.1 We will process a User's personal data in accordance with our data protection privacy statement/ policy https://rexbid.ie/privacy-policy
                            </p>

                            <p className="text-gray-700 mb-2">
                                45.2 We and a User being a seller, may share with each other the following types of personal data, that we have collected in connection with this agreement (shared personal data):
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>45.2.1 names, addresses and contact details of User buyers for User product(s);</p>
                                <p>45.2.2 information about User buyer orders for your products;</p>
                                <p>45.2.3 information about User buyer queries and complaints in relation to orders;</p>
                                <p>45.2.4 information about User buyer searches and activity on the Site;</p>
                                <p>45.2.5 information about our respective employees;</p>
                                <p>45.2.6 information about individuals working with other organisations that we or you being a User seller work with.</p>
                            </div>

                            <p className="text-gray-700 mt-2 mb-2">
                                45.3 We and a User being a seller, agree that we shall only process shared personal data which we receive from the User being a seller for the following purposes: (i) fulfilling orders for User seller products; (ii) dealing with queries and complaints from User buyers about User products; (iii) marketing our products and services to User buyers, subject to appropriate consents to marketing being in place and in the User seller's case subject to the constraints set out in clause 8 (User seller communications with User buyers); (iv) dealing with each other's employees and individuals working with other organisations for the purposes of operating this agreement.
                            </p>

                            <p className="text-gray-700 mb-2">
                                45.4 We and a User being a seller (you), shall comply with all the obligations imposed on a controller under data protection law. If either we or you fail to do so, the other can end this agreement, as set out in clause 28 (Suspension of listings, ending this agreement and disputes) and clause 32 (How you can end this agreement).
                            </p>

                            <p className="text-gray-700 mb-2">
                                45.5 We and a User being a seller (you): (i) ensure that all necessary notices, consents and lawful bases are in place to enable lawful transfer of the shared personal data to the other as well as to their employees and the entities they use in connection with this agreement (permitted recipients); (ii) give full information to any data subject whose personal data may be processed under this agreement about the nature of such processing. This includes giving notice that, when this agreement ends, personal data relating to them may be retained by or transferred to one or more of the permitted recipients, their successors and assignees; (iii) not disclose or allow access to the shared personal data to anyone other than the permitted recipients; (iv) Ensure that all permitted recipients are subject to written contractual obligations concerning the shared personal data (including obligations of confidentiality) which are no less demanding than those imposed by this agreement; (v) ensure that appropriate technical and organisational measures are in place to protect against unauthorised or unlawful processing of personal data and against accidental loss or destruction of, or damage to, personal data. Such measures shall include, but not be limited to, those set out in our data protection Privacy Statement https://rexbid.ie/privacy-policy; (vi) not transfer any shared personal data received outside EEA without ensuring that (vii) the transfer is to a country approved under data protection law as providing adequate protection; (vii) there are appropriate safeguards or binding corporate rules in place, pursuant to data protection law; (viii) we or you (as appropriate) otherwise comply with all the obligations imposed under data protection law by providing an adequate level of protection to any Personal data that is transferred; and (ix) one of the derogations for specific situations in data protection law applies to the transfer.
                            </p>

                            <p className="text-gray-700 mt-2 mb-2">
                                45.6 We and a User being a seller (you) shall assist the other in complying with data protection law. The things we and you will do include but are not limited to:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>45.6.1 consulting the other about any notices given to a data subject in relation to the shared personal data;</p>
                                <p>45.6.2 promptly telling the other about receipt of a data subject rights request in relation to the shared personal data;</p>
                                <p>45.6.3 providing the other with reasonable help in complying with any data subject rights request in relation to the shared personal data;</p>
                                <p>45.6.4 not disclosing, releasing, amending, deleting or blocking any shared personal data in response to a data subject rights request without first consulting the other, wherever possible;</p>
                                <p>45.6.5 helping the other (at the other's cost) to respond to any data subject rights request and to comply with data protection law with respect to security, personal data breach notifications, data protection impact assessments and consultations with the Data Protection Commission or other regulators;</p>
                                <p>45.6.6 on becoming aware of a breach of data protection law (by themselves or the other), notifying the other of it as soon as reasonably possible;</p>
                                <p>45.6.7 when this agreement ends, either deleting or returning shared personal data (and any copies of it) received from the other, unless required by law to store it;</p>
                                <p>45.6.8 using technology compatible with the other's technology to process shared personal data, to ensure that transfers to or from the other don't result in inaccuracies;</p>
                                <p>45.6.9 maintaining complete and accurate records and information to demonstrate that it has complied with these provisions;</p>
                                <p>45.6.10 providing the other with contact details of at least one employee as point of contact and responsible manager for all issues arising out of data protection law, including the procedures to be followed in the event of a data security breach, and the regular review of the parties' compliance with data protection law.</p>
                            </div>
                        </div>

                        {/* Section 46 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                46. Changes to these Terms
                            </h2>

                            <p className="text-gray-700 mb-2">
                                46.1 We will let a User whether buyer or seller, know via email or another durable medium about any changes we are making to these terms (including the policies referred to in them), unless they are just editorial changes which do not alter the terms' content or meaning.
                            </p>

                            <p className="text-gray-700 mb-2">
                                46.2 Normally we will give you at least 15 days' notice before such changes take effect.
                            </p>

                            <p className="text-gray-700 mb-2">
                                46.3 We will give a User more notice if a change we are making impacts on the way you do things, either technically or commercially (a Significant change). For example, you might need more notice if we entirely remove a feature from the Site, add a new feature or if you need to adapt your products or reprogramme your services to continue using the Site.
                            </p>

                            <p className="text-gray-700 mb-2">
                                46.4 We will not give a User advance notice if we have to make a change with immediate effect, whether for legal or regulatory reasons or to protect the Site, our suppliers or our buyers from fraud, malware, spam, data breaches or other cybersecurity risks.
                            </p>

                            <p className="text-gray-700">
                                46.5 If a User being a Seller list new products on the Site after we have told the User about any changes (other than a Significant change), the User will be deemed to have agreed to those changes and they will take effect immediately.
                            </p>
                        </div>

                        {/* Section 47 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                47. What you can do if you are unhappy about changes we have made
                            </h2>

                            <p className="text-gray-700 mb-2">
                                47.1 If a User being a seller is unhappy with any changes we tell you about, the User is entitled to end this agreement, subject to the following exceptions, where you cannot end this agreement because of a change if:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>47.1.1 the User has listed a new product(s) on the Site after being told about the change (although this will not prevent you from ending this agreement for a Significant change).</p>
                                <p>47.1.2 the User has previously told us that the User accepts the change.</p>
                            </div>
                        </div>

                        {/* Section 48 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                48. Other Important Terms
                            </h2>

                            <p className="text-gray-700 mb-2">
                                48.1 This agreement and any dispute or claim (including non-contractual disputes or claims) arising out of or in connection with it or its subject matter or formation shall be governed by and construed in accordance with the laws of Ireland.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.2 Each User (whether buyer or seller) agrees that the courts of Ireland shall have exclusive jurisdiction to settle any dispute or claim (including non-contractual disputes or claims) arising out of or in connection with this agreement, its subject matter or formation.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.3 Each User (whether buyer or seller) acknowledges and agrees that shall not be in breach of the Terms including any agreement reached under the Terms or otherwise liable for any failure or delay in performing any of our obligations, if such delay or failure results from events, circumstances or causes beyond our reasonable control. The time for performance of any such obligations shall be extended accordingly. If the period of delay or non-performance continues for 28 calendar days, you the User or we end this agreement by giving ten (10) calendar days written notice to the other party.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.4 Each User (whether buyer or seller) acknowledges and agrees that we may at any time assign, mortgage, charge, subcontract, delegate, declare a trust over or deal in any other manner with (Transfer) any or all of our rights and obligations under these Terms and each agreement thereunder.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.5 Each User (whether buyer or seller) acknowledges and agrees that a User cannot transfer the User's rights under these Terms or assign or subcontract the User's obligations under these Terms or under any of them without our prior written consent. Each User (whether buyer or seller) undertakes to us to get our prior consent in writing before the User attempts to transfer any right or before attempting to assign or to subcontract any obligation under these Terms. Any such request to transfer a right, or to assign or subcontract obligation, the User undertakes to make through and in accordance with clause 7.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.6 Each User (whether buyer or seller) undertake to us that you will not at any time during the term of an agreement with us, and for a period of 24 months after it ends (for whatever reason) disclose to any person any confidential information concerning the business, assets, affairs, buyers, clients or sellers of us (the discloser) except as may be required by law, a court of competent jurisdiction or any governmental or regulatory authority.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.7 Each User (whether buyer or seller) undertakes to us not to use any confidential information of us, for any purpose other than to exercise the User's rights and perform the User's obligations under or in connection with these Terms and this agreement.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.9 Each User (whether buyer or seller) acknowledges and agrees that this agreement (comprising these Terms and the policies referred to in them) constitutes the entire agreement between you and us in relation to our Services.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.10 Each User (whether buyer or seller) acknowledges and agrees that in entering into this agreement that the User does not or did not rely on, any statement, representation, assurance or warranty (whether made innocently or negligently) that is not set out in these Terms and under this agreement. Each User (whether buyer or seller) acknowledges and agrees with us that the User shall not have any claim against us for innocent or negligent misrepresentation or negligent misstatement based on any statement in this agreement.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.11 Each User (whether buyer or seller) acknowledges and agrees that except for changes made as described in clauses 46 and 47, no variation of this agreement shall be effective unless it is in writing and signed by you and us.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.12 Each User (whether buyer or seller) acknowledges and agrees that a waiver of any right or remedy by us is only effective if given in writing and shall not be deemed a waiver of any subsequent right or remedy.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.13 A delay or failure to exercise, or the single or partial exercise of, any right or remedy by us, shall not waive that or any other right or remedy, nor shall it prevent or restrict the further exercise of that or any other right or remedy.
                            </p>

                            <p className="text-gray-700 mb-2">
                                48.14 If any provision or part-provision of these Terms and any agreement hereunder is or becomes invalid, illegal or unenforceable, it shall be deemed deleted, but that shall not affect the validity and enforceability of the rest of the agreement and these Terms.
                            </p>

                            <p className="text-gray-700">
                                48.15 These Terms and each agreement reached hereunder does not give rise to any rights to any third party who is not a party to these Terms and a party to any agreement reached hereunder.
                            </p>
                        </div>

                        {/* Section 49 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                49. Prohibited Products
                            </h2>

                            <p className="text-gray-700 mb-2">
                                49.1 Each User who is a seller undertakes, not to, list for sale through the Site any product(s) which:
                            </p>

                            <div className="pl-5 space-y-1 text-gray-700">
                                <p>49.1.1 is/are stolen, replicas, counterfeits or unauthorised copies.</p>
                                <p>49.1.2 violate the intellectual property, confidentiality or privacy rights of any person.</p>
                                <p>49.1.3 violate any laws, including those governing export control and consumer protection.</p>
                                <p>49.1.4 contain any material that is obscene or pornographic.</p>
                                <p>49.1.5 the User does not have authority to sell.</p>
                            </div>
                        </div>

                        {/* Section 50 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                50. Release
                            </h2>

                            <p className="text-gray-700">
                                Each User (whether buyer or seller), agrees and undertakes to us, that if the User has a dispute with one or more other Users, the User undertakes to release us (and our officers, directors, employees, and agents) from claims, demands, and damages (actual and consequential) of every kind and nature, known and unknown, arising out of or in any way connected with any such dispute. In entering into this release, each User(whether buyer or seller) expressly waive any protections (whether statutory or otherwise) that would otherwise limit the coverage of this release to include only those claims which you the User may know or suspect to exist in your favour at the time of agreeing to this release.
                            </p>
                        </div>

                        {/* Section 51 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                51. Electronic Communications
                            </h2>

                            <p className="text-gray-700">
                                When a User (either buyer or seller) use our Services or send an email to us, you the User are communicating with us electronically. We will communicate with you electronically in a variety of ways, such as by email, text, or by posting email messages or communications on the Site. For contractual purposes, you agree that all agreements, notices, disclosures and other communications that we provide you electronically satisfy any legal requirement that such communications be in writing, unless mandatory applicable laws specifically require a different form of communication.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Contact Information
                            </h2>

                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">
                                    RexBid (REXBID Limited)
                                </p>

                                <p className="text-gray-700 text-sm mb-1">
                                    {address}
                                </p>

                                <p className="text-gray-700 text-sm mb-1">
                                    Registration Number: 819231
                                </p>

                                <p className="text-gray-700 text-sm mb-1">
                                    Email:{" "}
                                    <a
                                        href="mailto:admin@rexbid.com"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        admin@rexbid.com
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                These Terms were last updated on {formattedDate}.
                                If you have questions, please contact us at admin@rexbid.com.
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

export default TermsConditions;