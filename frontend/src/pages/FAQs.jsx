import { Container } from "../components";
import { MessageCircleQuestion, Search, Shield, HelpCircle, Phone, Mail, Car, CreditCard, Truck, Store, FileText, Clock, Gavel } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const faqs = [
    {
        category: "Bidder",
        icon: <Gavel size={20} />,
        questions: [
            {
                question: "Who can bid on BidNordic?",
                answer: "BidNordic is open to both trade professionals and private buyers across Norway. Dealers, contractors, farmers, and individuals can all register and participate."
            },
            {
                question: "Are there any fees for buyers?",
                answer: "Yes, we charge a minimal buyer fee on successful purchases. The fee is clearly displayed before you bid, so there are no surprises."
            },
            {
                question: "Can I inspect equipment before bidding?",
                answer: "Inspection is not available before bidding. However, if you have questions about a listing, please reach out to us and we'll help where we can."
            },
            {
                question: "Are machines sold with a warranty?",
                answer: "No. All equipment is sold on an 'as-is' basis without warranty. Descriptions are provided for guidance only."
            },
            {
                question: "Can I return a machine after purchase?",
                answer: "If you have concerns after winning, please contact us directly. We'll review your situation and advise accordingly."
            },
            {
                question: "How does the 'Make an Offer' feature work?",
                answer: "On eligible listings, you can submit an offer. If the seller accepts, a binding agreement is formed and payment must be completed within the agreed timeframe."
            },
            {
                question: "Are bids and Buy Now purchases binding?",
                answer: "Yes. All bids, accepted offers, and Buy Now purchases are legally binding contracts. Bid retractions are not permitted."
            },
            {
                question: "Can anyone participate in giveaways?",
                answer: "Yes! Our free giveaways are open to everyone—both trade and private individuals."
            }
        ]
    },
    {
        category: "Payments",
        icon: <CreditCard size={20} />,
        questions: [
            {
                question: "What payment methods do you accept?",
                answer: "Bank transfer is our primary payment method. All payments must be made in NOK."
            },
            {
                question: "How long do I have to make payment?",
                answer: "Payment terms vary by listing. Please check the specific auction or listing for your payment deadline."
            },
            {
                question: "What happens after I make payment?",
                answer: "Once payment clears, you'll receive an invoice and collection instructions. Ownership transfers only after full payment is received."
            },
            {
                question: "Is off-platform communication or payment allowed?",
                answer: "No. All communication, offers, and payments must go through BidNordic. Off-platform activity may result in account suspension."
            }
        ]
    },
    {
        category: "Collection & Delivery",
        icon: <Truck size={20} />,
        questions: [
            {
                question: "Can I collect equipment myself?",
                answer: "Yes. Collection is available by appointment. Please contact us to arrange a suitable time."
            },
            {
                question: "Do you offer delivery?",
                answer: "Yes, delivery can be arranged across Norway. Quotes are provided before dispatch."
            },
            {
                question: "When does responsibility transfer to me?",
                answer: "Risk transfers to the buyer once the equipment is collected or delivered, whichever occurs first."
            }
        ]
    },
    {
        category: "Sellers",
        icon: <Store size={20} />,
        questions: [
            {
                question: "I have equipment to sell — how does it work?",
                answer: "We offer tailored remarketing services for dealers, fleet operators, rental companies, and contractors. Contact us for a custom quote."
            },
            {
                question: "What are your seller fees?",
                answer: "We offer both commission-based and fixed-fee options. Please contact us to discuss which model suits your needs."
            },
            {
                question: "Do you provide inspection or photography services?",
                answer: "Sellers are responsible for managing their own listings, including descriptions and images. We recommend providing clear, accurate information to attract serious buyers."
            }
        ]
    },
    {
        category: "General",
        icon: <Clock size={20} />,
        questions: [
            {
                question: "What are your support hours?",
                answer: "We're always available! Our team is here to help whenever you need us."
            },
            {
                question: "What languages do you support?",
                answer: "Our support team is available in multiple languages, including Swedish and English."
            },
            {
                question: "How can I contact BidNordic?",
                answer: `BidNordic | Phone: ${phone} | Email: ${email} | Address: ${address}`
            }
        ]
    }
];

function FAQsPage() {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Bidder");

    const filteredFaqs = faqs.flatMap(category =>
        category.questions.filter(q =>
            (activeCategory === "all" || category.category === activeCategory) &&
            (q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
        ).map(q => ({ ...q, category: category.category }))
    );

    return (
        <section className="pt-24 md:pt-32 bg-gradient-to-b from-white to-gray-50 max-w-full">
            {/* Hero Section */}
            <div className="">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span className="text-sm font-semibold text-secondary">FAQ Center</span>
                        </div>
                        <div className="text-center mb-10">
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                                Frequently Asked <span className="italic text-gray-500">Questions</span>
                            </h1>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-12">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search for answers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-16">
                <div className="grid lg:grid-cols-[320px,1fr] gap-10">

                    {/* LEFT SIDEBAR */}
                    <div className="space-y-6">

                        {/* Category Box */}
                        <div className="bg-[#efe7df] rounded-2xl p-6 space-y-2">
                            {faqs.map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => setActiveCategory(cat.category)}
                                    className={`w-full text-left px-5 py-4 rounded-xl border-b border-b-white transition font-medium
            ${activeCategory === cat.category
                                            ? "bg-white text-green-600 shadow"
                                            : "text-gray-700 hover:bg-white/60"}`}
                                >
                                    {cat.category}
                                </button>
                            ))}
                        </div>

                        {/* Help Card */}
                        <div className="bg-[#e9e2f4] rounded-2xl p-6 text-center">
                            <h3 className="font-semibold text-lg mb-4">
                                Didn't find your answer? Ask directly!
                            </h3>

                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center border rounded-full text-green-600 border-green-500">
                                <Mail size={22} />
                            </div>

                            <p className="text-sm text-gray-600">To Send Mail</p>
                            <Link to={`mailto:${otherData.email}`} className="font-semibold hover:underline">{otherData?.email}</Link>
                        </div>

                    </div>

                    {/* RIGHT SIDE QUESTIONS */}
                    <div className="space-y-5">

                        {faqs
                            .filter(cat => activeCategory === "all" || cat.category === activeCategory)
                            .flatMap(cat =>
                                cat.questions.map(q => ({
                                    ...q,
                                    category: cat.category
                                }))
                            )
                            .filter(faq =>
                                faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((faq, index) => (

                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full flex items-center justify-between px-6 py-5 text-left"
                                    >
                                        <span className="font-semibold text-gray-800">
                                            {faq.question}
                                        </span>

                                        <span className={`w-9 h-9 flex items-center justify-center rounded-full transition
                ${openIndex === index
                                                ? "bg-green-200 rotate-45"
                                                : "bg-green-100"}`}
                                        >
                                            <span className="text-xl font-bold text-green-700">+</span>
                                        </span>
                                    </button>

                                    <div className={`transition-all duration-300 overflow-hidden
              ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                    >
                                        <p className="px-6 pb-6 text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </Container>

        </section>
    );
}

export default FAQsPage;