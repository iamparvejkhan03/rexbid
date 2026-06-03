import { Container, FAQs } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import {
    Clock,
    Mail,
    MapPin,
    MessageCircleQuestion,
    Phone,
    User,
    ArrowRight,
    CheckCircle,
} from "lucide-react";
import { contactUs, logo, otherData } from "../assets";
import axiosInstance from "../utils/axiosInstance";

// Intersection Observer for fade-in animations
const useFadeIn = (threshold = 0.2) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: "0px 0px -50px 0px" }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
};

function Contact() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            userType: "bidder",
            message: "",
        },
    });

    const userType = watch("userType");
    const [sending, setSending] = useState(false);

    // Animation refs
    const headerRef = useFadeIn(0.1);
    const contactCardRef = useFadeIn(0.2);
    const infoRefs = [useFadeIn(0.3), useFadeIn(0.35), useFadeIn(0.4), useFadeIn(0.45)];

    const submitHandler = async (contactData) => {
        try {
            setSending(true);
            const { data } = await axiosInstance.post("/api/v1/contact/submit", contactData);
            if (data?.success) {
                toast.success(data.message);
                reset();
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(data.message || "Failed to submit your query");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit your query. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <Container className="pt-24 md:pt-32">
            {/* Header with animation */}
            <div
                ref={headerRef.ref}
                className={`text-center max-w-2xl mx-auto transition-all duration-700 ${
                    headerRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/10 border border-[#D19F3E]/20 mb-4">
                    <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase">Get in Touch</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#072342]">Contact Us</h2>
                <p className="text-gray-600 mt-4 text-lg">
                    Get in touch with the team at RexBid. We’re here to help buyers, sellers, and businesses across Ireland.
                </p>
            </div>

            {/* Main Contact Card – split layout with brand colors */}
            <div
                ref={contactCardRef.ref}
                className={`relative my-16 rounded-2xl overflow-hidden shadow-xl transition-all duration-700 delay-100 ${
                    contactCardRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            >
                {/* Brand blue background */}
                <div className="absolute inset-0 bg-[#072342]" />
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* LEFT – Contact Info */}
                    <div className="p-8 md:p-10 text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Talk</h2>
                        <p className="text-white/80 mb-8 leading-relaxed">
                            Whether you’re listing machinery, selling vehicles, or looking for the right equipment, our team is ready to help with straightforward advice and support.
                        </p>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#D19F3E]/20 flex items-center justify-center">
                                    <Mail size={18} className="text-[#D19F3E]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">Email</p>
                                    <Link to={`mailto:${otherData?.email}`} className="hover:text-[#D19F3E] transition">
                                        {otherData.email}
                                    </Link>
                                </div>
                            </div>
                            {/* <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#D19F3E]/20 flex items-center justify-center">
                                    <Phone size={18} className="text-[#D19F3E]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">Phone</p>
                                    <Link to={`tel:${otherData?.phoneCode}${otherData?.phone}`} className="hover:text-[#D19F3E] transition">
                                        {otherData?.phoneCode} {otherData?.formatPhone(otherData?.phone)}
                                    </Link>
                                </div>
                            </div> */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#D19F3E]/20 flex items-center justify-center">
                                    <MapPin size={18} className="text-[#D19F3E]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">Location</p>
                                    <p className="text-white">{otherData.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#D19F3E]/20 flex items-center justify-center">
                                    <Clock size={18} className="text-[#D19F3E]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">Business Hours</p>
                                    <p className="text-white">Mon-Fri: 9AM–5PM • Sat: 9AM–2:30PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT – Form Card */}
                    <div className="bg-white p-8 md:p-10 rounded-t-2xl lg:rounded-l-none lg:rounded-r-2xl">
                        <h3 className="text-xl font-semibold text-[#072342] mb-6">Send us a message</h3>

                        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <User size={16} /> Name *
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    placeholder="John Doe"
                                    {...register("name", { required: true })}
                                />
                                {errors.name && <p className="text-xs text-[#D19F3E] mt-1">Name is required</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <Mail size={16} /> Email *
                                </label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    placeholder="hello@example.com"
                                    {...register("email", { required: true })}
                                />
                                {errors.email && <p className="text-xs text-[#D19F3E] mt-1">Email is required</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <Phone size={16} /> Phone
                                </label>
                                <input
                                    type="tel"
                                    placeholder={`${otherData?.phoneCode} (xxx) xxx xxxx`}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    {...register("phone")}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">I am a</label>
                                <div className="flex flex-wrap gap-4">
                                    {["bidder", "seller"].map((type) => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value={type}
                                                {...register("userType")}
                                                className="accent-[#D19F3E]"
                                            />
                                            <span className="capitalize text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <MessageCircleQuestion size={16} /> Message *
                                </label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    placeholder="Tell us how we can help you..."
                                    {...register("message", { required: true })}
                                />
                                {errors.message && <p className="text-xs text-[#D19F3E] mt-1">Message is required</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-[#D19F3E] hover:bg-[#bc8f35] text-[#072342] font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                {sending ? "Sending..." : "Send Message"}
                                {!sending && <ArrowRight size={16} className="group-hover:translate-x-1 transition" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Info Cards Row – simple, animated */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 my-14">
                {[
                    // { icon: Phone, title: "Phone", content: `${otherData?.phoneCode} ${otherData?.formatPhone?.(otherData?.phone) || ''}`, delay: 0 },
                    { icon: Mail, title: "Email", content: otherData.email, delay: 1 },
                    { icon: MapPin, title: "Location", content: otherData.address, delay: 2 },
                    { icon: Clock, title: "Hours", content: "Mon-Fri: 9AM–5PM\nSat: 9AM–2:30PM", delay: 3 },
                ].map((item, idx) => {
                    const Icon = item.icon;
                    const { ref, isVisible } = infoRefs[idx];
                    return (
                        <div
                            key={idx}
                            ref={ref}
                            className={`flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 ${
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                            }`}
                            style={{ transitionDelay: `${item.delay * 100}ms` }}
                        >
                            <div className="p-3 rounded-lg bg-[#D19F3E]/10">
                                <Icon size={20} className="text-[#D19F3E]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#072342] mb-1">{item.title}</h3>
                                <p className="text-gray-600 text-sm whitespace-pre-line">{item.content}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Container>
    );
}

export default Contact;