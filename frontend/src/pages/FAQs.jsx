import {
    ChevronDown,
    Search,
    Mail,
    Phone,
    ArrowRight,
    ShieldCheck,
    Gavel,
    CreditCard,
    Truck,
    Store,
    Clock,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { email, phone } = otherData;

const faqs = [
    {
        category: "Buyers",
        icon: <Gavel size={18} />,
        questions: [
            {
                question: "Who can place bids on RexBid?",
                answer: "Both businesses and private buyers across Ireland can register and place bids.",
            },
            {
                question: "Are bids legally binding?",
                answer: "Yes. All bids placed on the platform are considered legally binding.",
            },
            {
                question: "Can I inspect an item before bidding?",
                answer: "Some sellers may allow inspections. Please contact the seller directly for availability.",
            },
        ],
    },
    {
        category: "Payments",
        icon: <CreditCard size={18} />,
        questions: [
            {
                question: "What payment methods are accepted?",
                answer: "Payments can be made either through saved card or directly to the seller by bank transfer or cash, depending on the listing.",
            },
            {
                question: "Does RexBid handle payments?",
                answer: "In some cases, payment may be processed using the card registered to your account.",
            },
        ],
    },
    {
        category: "Collection",
        icon: <Truck size={18} />,
        questions: [
            {
                question: "Do you offer delivery services?",
                answer: "No, we don't offer delivery services. You need to arrange delivery by contacting the seller.",
            },
            {
                question: "Can I collect the item myself?",
                answer: "Yes. Collection can usually be arranged directly with the seller after payment.",
            },
        ],
    },
    {
        category: "Sellers",
        icon: <Store size={18} />,
        questions: [
            {
                question: "How do I list an item on RexBid?",
                answer: "Create an account, upload your listing details, and start receiving bids from buyers.",
            },
            {
                question: "What are the seller fees?",
                answer: "RexBid charges a 3% seller commission, with an additional 3% for featured listings.",
            },
        ],
    },
    {
        category: "General",
        icon: <Clock size={18} />,
        questions: [
            {
                question: "Which currencies are supported?",
                answer: "Listings can use GBP for Northern Ireland and EUR for the Republic of Ireland.",
            },
            {
                question: "How can I contact support?",
                answer: `You can contact us anytime via email at ${email} or by phone at ${phone}.`,
            },
        ],
    },
];

function FAQsPage() {
    const [activeCategory, setActiveCategory] = useState("Buyers");
    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFaqs = faqs
        .filter((cat) => cat.category === activeCategory)
        .flatMap((cat) =>
            cat.questions.map((q) => ({
                ...q,
                category: cat.category,
            }))
        )
        .filter(
            (faq) =>
                faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <section className="bg-white text-[#072342] overflow-hidden">
            {/* HERO SECTION - White background */}
            <section className="relative pt-32 bg-white border-b border-gray-100">
                <Container>
                    <div className="max-w-full text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/10 text-[#D19F3E] text-sm font-medium">
                            <ShieldCheck size={16} />
                            Help Center
                        </div>
                        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            Frequently Asked
                            <span className="text-[#D19F3E]"> Questions</span>
                        </h1>
                        <p className="mt-6 text-lg text-[#072342]/70 leading-relaxed max-w-full">
                            Everything you need to know about listings, bidding, payments, and selling machinery or vehicles on RexBid.
                        </p>
                        <div className="relative mt-10 max-w-2xl mx-auto">
                            <Search
                                size={20}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-14 pl-14 pr-5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/30 focus:border-[#D19F3E] transition"
                            />
                        </div>
                    </div>
                </Container>
            </section>

            {/* MAIN CONTENT - Gray background for separation */}
            <section className="py-14 lg:py-14 bg-gray-50">
                <Container>
                    <div className="grid lg:grid-cols-[300px,1fr] gap-8 lg:gap-12">
                        {/* SIDEBAR */}
                        <div className="space-y-6">
                            <div className="bg-gray-100/80 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-[#072342] mb-4 px-1">Categories</h3>
                                <div className="space-y-1">
                                    {faqs.map((cat) => (
                                        <button
                                            key={cat.category}
                                            onClick={() => setActiveCategory(cat.category)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                                activeCategory === cat.category
                                                    ? "bg-[#072342] text-white shadow-md"
                                                    : "hover:bg-white/70 text-[#072342]/80"
                                            }`}
                                        >
                                            <span
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                                    activeCategory === cat.category
                                                        ? "bg-white/10 text-[#D19F3E]"
                                                        : "bg-[#D19F3E]/10 text-[#D19F3E]"
                                                }`}
                                            >
                                                {cat.icon}
                                            </span>
                                            <span className="font-medium text-sm md:text-base">
                                                {cat.category}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Card - stays dark blue */}
                            <div className="bg-[#072342] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                                <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#D19F3E]/20 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold leading-snug">Still Need Help?</h3>
                                    <p className="mt-2 text-white/70 text-sm">
                                        Our support team is always available to assist you.
                                    </p>
                                    <div className="mt-6 space-y-3">
                                        <a
                                            href={`mailto:${email}`}
                                            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition rounded-xl p-3"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-[#D19F3E]/20 flex items-center justify-center">
                                                <Mail size={16} className="text-[#D19F3E]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/60">Email Us</p>
                                                <p className="text-sm font-medium">{email}</p>
                                            </div>
                                        </a>
                                        <a
                                            href={`tel:${phone}`}
                                            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition rounded-xl p-3"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-[#D19F3E]/20 flex items-center justify-center">
                                                <Phone size={16} className="text-[#D19F3E]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/60">Call Us</p>
                                                <p className="text-sm font-medium">{phone}</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ ACCORDION AREA */}
                        <div>
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                <div>
                                    <p className="text-[#D19F3E] uppercase tracking-[3px] text-xs font-semibold">
                                        Support Questions
                                    </p>
                                    <h2 className="mt-1 text-2xl md:text-3xl font-bold text-[#072342]">
                                        {activeCategory} FAQs
                                    </h2>
                                </div>
                                <div className="text-sm text-[#072342]/50 bg-white px-3 py-1 rounded-full shadow-sm">
                                    {filteredFaqs.length} questions
                                </div>
                            </div>

                            <div className="space-y-3">
                                {filteredFaqs.map((faq, index) => {
                                    const isOpen = openIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden shadow-sm ${
                                                isOpen
                                                    ? "border-[#D19F3E]/40 shadow-md"
                                                    : "border-gray-100 hover:shadow-md hover:border-gray-200"
                                            }`}
                                        >
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                            >
                                                <h3 className="text-base md:text-lg font-semibold text-[#072342] leading-relaxed pr-2">
                                                    {faq.question}
                                                </h3>
                                                <div
                                                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                        isOpen
                                                            ? "bg-[#D19F3E] text-white rotate-180"
                                                            : "bg-gray-100 text-[#072342]"
                                                    }`}
                                                >
                                                    <ChevronDown size={18} />
                                                </div>
                                            </button>
                                            <div
                                                className={`grid transition-all duration-300 ease-in-out ${
                                                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="px-5 pb-5 text-[#072342]/70 leading-relaxed text-sm md:text-base">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CTA Banner with subtle shadow */}
                            <div className="mt-10 bg-white rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border border-gray-100 shadow-md">
                                <div>
                                    <p className="text-[#D19F3E] uppercase tracking-[3px] text-xs font-semibold">
                                        Need More Assistance?
                                    </p>
                                    <h3 className="mt-1 text-xl md:text-2xl font-bold text-[#072342]">
                                        Contact Our Support Team
                                    </h3>
                                    <p className="mt-1 text-[#072342]/60 text-sm max-w-md">
                                        We're here to help with auctions, payments, account issues, and equipment listings.
                                    </p>
                                </div>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 bg-[#D19F3E] hover:bg-[#bc8d2f] text-[#072342] font-semibold px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap"
                                >
                                    Contact Us
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </section>
    );
}

export default FAQsPage;