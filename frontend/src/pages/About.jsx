import { Verified, Gavel, BadgeCheck, UserPlus, Clock, Heart, Shield, Users, Calendar, Cpu, CheckCircle, TrendingUp, Search, ShieldCheck, Wallet, Globe, BarChart3, Smile, Handshake, BadgeDollarSign, HandHelping, PackageCheck, UserCheck, } from "lucide-react";
import { Link } from "react-router-dom";
import {
    CaseIH,
    Claas,
    Cummins,
    Fendt,
    Freightliner,
    Hitachi,
    JCB,
    JohnDeere,
    Komatsu,
    Kubota,
    Liebherr,
    MasseyFerguson,
    Mercedes,
    NewHolland,
    NokianTyres,
    Peterbilt,
    Scag,
    Skania,
    Stiga,
    Timberjack,
    Toro,
    Toyota,
    Volvo,
} from "../assets";
import { Container, HowItWorksCard } from "../components";

const highlights = [
    {
        icon: Handshake,
        title: "Unbeatable Selection",
        desc: "Thousands of machines from leading manufacturers. Find exactly what you need.",
    },
    {
        icon: Gavel,
        title: "Trade Your Way",
        desc: "Auctions, buy now, offers, and giveaways — the flexibility you deserve.",
    },
    {
        icon: BadgeDollarSign,
        title: "Zero Hidden Fees",
        desc: "Transparent buyer fees and pricing. What you see is what you pay.",
    },
    {
        icon: HandHelping,
        title: "Expert Support",
        desc: "From your first bid to final delivery — we're with you every step.",
    },
];

const stats = [
    { icon: Smile, value: "500+", label: "Customer", sub: "Total Customer" },
    { icon: PackageCheck, value: "450", label: "Auctions", sub: "Total Product" },
    { icon: Users, value: "600+", label: "Bidder", sub: "Number Of Total Bidder" },
    { icon: UserCheck, value: "1.2k", label: "Accounts", sub: "User Helped" },
];

const features = [
    {
        number: "01",
        icon: ShieldCheck,
        title: "Verified Listings",
        desc: "Every machine is verified to ensure authenticity and transparency across the Nordics.",
    },
    {
        number: "02",
        icon: Gavel,
        title: "Real-Time Bidding",
        desc: "Experience live auctions with instant updates — just as if you were in the room.",
    },
    {
        number: "03",
        icon: Wallet,
        title: "Secure Payments",
        desc: "Bank-level encryption and trusted gateways protect every bid and every deal.",
    },
    {
        number: "04",
        icon: Globe,
        title: "Global Marketplace",
        desc: "Connect with buyers and sellers across Norway, seamless cross-border trading made simple.",
    },
    {
        number: "05",
        icon: BarChart3,
        title: "Market Insights",
        desc: "Smart pricing data helps buyers and sellers make informed decisions based on real market trends.",
    },
    {
        number: "06",
        icon: Smile,
        title: "Customer Satisfaction",
        desc: "Our team ensures a smooth experience from listing to selling — because your satisfaction matters.",
    },
];

function About() {
    return (
        <section className="pt-16 md:pt-16 max-w-full text-gray-600">
            <div className="bg-white">
                {/* <Container> */}
                    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-14 pb-5">

                        {/* floating soft glow */}
                        <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-200 opacity-30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-32 -right-32 w-80 h-80 bg-orange-300 opacity-30 rounded-full blur-3xl animate-pulse"></div>

                        <div className="max-w-full mx-auto text-center px-6 py-8">

                            {/* headline */}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                Built on Trust — <br />
                                <span className="text-orange-500">Across Every Bid & Every Deal</span>
                            </h1>

                            {/* description */}
                            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
                                BidNordic brings together buyers and sellers from across the Nordics in a marketplace built on confidence. With transparency, fair pricing, and secure transactions at our core, we help industry professionals trade smarter.
                            </p>

                            {/* buttons */}
                            <div className="mt-10 flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/auctions"
                                    className="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold shadow hover:bg-orange-600 transition"
                                >
                                    Explore Auctions
                                </Link>

                                <Link
                                    to="/contact"
                                    className="px-8 py-3 border border-gray-300 rounded-full font-semibold hover:bg-gray-100 transition"
                                >
                                    Contact Us
                                </Link>
                            </div>

                            {/* stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-20">
                                {stats.map((stat, i) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={i} className="flex flex-col items-center">
                                            <Icon className="text-orange-500 mb-3" size={30} />
                                            <div className="text-2xl font-bold text-gray-900">
                                                {stat.value}
                                            </div>
                                            <div className="text-gray-500 text-sm">{stat.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                {/* </Container> */}
            </div>

            {/* Brands we work with */}
            <Container className="mb-14">
                <div className="max-w-full mx-auto mb-8 text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                        Brands We Work With
                    </h2>
                    <p className="text-lg text-gray-700 mb-2">
                        From excavators and tractors to cranes and forklifts — we handle heavy equipment across all major manufacturers.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300 border-r-0 md:border-b-0">
                        <img src={CaseIH} alt="Case IH" className="h-8 w-auto mix-blend-multiply" />
                        <p className="flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 text-sm">
                            Case IH
                        </p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300 md:border-b-0 md:border-r-0">
                        <img src={Claas} alt="Claas" className="h-7 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Claas</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300 border-y-0 border-r-0 md:border-r md:border-t">
                        <img src={Cummins} alt="Cummins" className="h-10 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Cummins</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300 border-y-0 md:border-b md:border-r-0 md:border-t">
                        <img src={Fendt} alt="Fendt" className="h-10 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Fendt</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300 border-r-0">
                        <img src={Freightliner} alt="Freightliner" className="h-10 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Freightliner</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300 border-r-0">
                        <img src={Hitachi} alt="Hitachi" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Hitachi</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={JCB} alt="JCB" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">JCB</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={JohnDeere} alt="John Deere" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">John Deere</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Komatsu} alt="Komatsu" className="h-8 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Komatsu</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Kubota} alt="Kubota" className="h-8 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Kubota</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Liebherr} alt="Liebherr" className="h-8 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Liebherr</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Mercedes} alt="Mercedes" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Mercedes</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={NewHolland} alt="NewHolland" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">NewHolland</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Scag} alt="Scag" className="h-8 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Scag</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Skania} alt="Scania" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Scania</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={NokianTyres} alt="Nokian Tyres" className="h-8 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Nokian Tyres</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={MasseyFerguson} alt="Massey Ferguson" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Massey Ferguson</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Peterbilt} alt="Peterbilt" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Peterbilt</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Toyota} alt="Toyota" className="h-11 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Toyota</p>
                    </Link>

                    <Link to="#" className="group px-8 pt-8 pb-3 flex flex-col items-center justify-center border border-gray-300">
                        <img src={Stiga} alt="Stiga" className="h-7 w-auto mix-blend-multiply" />
                        <p className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">Stiga</p>
                    </Link>

                </div>


            </Container>

            {/* Why choose us */}
            <Container>
                <section className="bg-gray-50">
                    <div className="max-w-full mx-auto">

                        {/* Heading */}
                        <div className="text-left mb-8">
                            <p className="text-orange-500 font-semibold tracking-widest uppercase text-sm">
                                Why Choose Us
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold text-black mt-2">
                                Built for Trust, Speed & Results
                            </h2>
                        </div>

                        {/* Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={i}
                                        className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition duration-300 relative overflow-hidden"
                                    >
                                        {/* top accent line */}
                                        <div className="absolute left-0 top-0 h-1 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></div>

                                        {/* Number */}
                                        <span className="absolute right-5 top-12 text-5xl font-extrabold text-transparent stroke-text group-hover:text-orange-500 transition duration-300">
                                            {item.number}
                                        </span>

                                        {/* Icon */}
                                        <div className="mt-4 w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                                            <Icon size={24} />
                                        </div>

                                        {/* Title */}
                                        <h3 className="mt-5 text-xl font-semibold text-gray-900">
                                            {item.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="mt-3 text-gray-600 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </Container>

            {/* Highlights */}
            <section className="bg-orange-100 py-14 mt-14">
                <Container>

                    {/* label */}
                    <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-500 text-sm px-4 py-1.5 rounded-md mb-6 font-semibold tracking-wide">
                        → HIGHLIGHTED
                    </div>

                    {/* heading */}
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                        Our Featured <span className="text-gray-500 font-medium italic">Highlights.</span>
                    </h2>

                    {/* features */}
                    <div className="grid md:grid-cols-4 mt-8 border-t border-b border-gray-300/40">
                        {highlights.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className={`py-10 px-6 text-center md:text-left ${i !== highlights.length - 1
                                        ? "md:border-r border-gray-300/40"
                                        : ""
                                        }`}
                                >
                                    <Icon size={40} strokeWidth={1} className="text-orange-500 mb-6 mx-auto md:mx-0" />

                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-600 leading-relaxed text-sm max-w-xs mx-auto md:mx-0">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left mt-14">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                                    <Icon size={40} strokeWidth={1} className="text-gray-500" />

                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {stat.value}{" "}
                                            <span className="text-lg font-medium text-gray-700">
                                                {stat.label}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm">{stat.sub}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </Container>
            </section>
        </section >
    );
}

export default About;