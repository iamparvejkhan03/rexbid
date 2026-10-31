import { Container } from "../components";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import {
    Mail, Phone, User, ArrowRight, Star, MapPin,
    MessageCircleQuestion, Users, Sparkles,
} from "lucide-react";
import { otherData, darkLogo } from "../assets";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

const USER_TYPES = [
    { value: "bidder", label: "Bidder" },
    { value: "seller", label: "Seller" },
    { value: "company", label: "Company" },
    { value: "other", label: "Other" },
];

function StarPicker({ value, onChange, size = 36 }) {
    const [hover, setHover] = useState(0);
    const active = hover || value;
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                    <Star
                        size={size}
                        className={
                            n <= active
                                ? "fill-[#D19F3E] text-[#D19F3E]"
                                : "text-gray-300"
                        }
                    />
                </button>
            ))}
        </div>
    );
}

function RateUs() {
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        defaultValues: {
            name: user ? `${user?.firstName} ${user?.lastName}` : "",
            email: user ? `${user?.email}` : "",
            phone: user ? `${user?.phone}` : "",
            location: user ? `${user?.countryName}` : "",
            userType: user ? `${user?.userType}` : "bidder",
            rating: 0,
            feedback: "",
        },
    });

    const [sending, setSending] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const ratingValue = watch("rating");

    const submitHandler = async (formData) => {
        if (!formData.rating || formData.rating < 1) {
            toast.error("Please select a star rating.");
            return;
        }
        try {
            setSending(true);
            const { data } = await axiosInstance.post(
                "/api/v1/website-review/submit",
                formData
            );

            if (data?.success) {
                if (typeof gtag === "function") {
                    gtag("event", "website_review_submitted", {
                        rating: formData.rating,
                        user_type: formData.userType,
                    });
                }
                toast.success(data.message || "Thank you for your review!");
                reset();
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(data?.message || "Failed to submit your review.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to submit your review. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <Container className="pt-24 md:pt-32 pb-16">
            <div className="max-w-5xl mx-auto">

                {/* ==== SUCCESS STATE ==== */}
                {submitted ? (
                    <div className="relative md:mx-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#D19F3E]/15 flex items-center justify-center mb-4">
                            <Star size={28} className="fill-[#D19F3E] text-[#D19F3E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#072342] mb-2">
                            Thank you for your feedback!
                        </h2>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            Your review has been submitted and will appear on
                            our “What Our Clients Say” page once approved.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-[#072342] underline text-sm hover:text-[#D19F3E]"
                        >
                            Submit another review
                        </button>
                    </div>
                ) : (
                    /* ==== FORM CARD ==== */
                    <div className="relative md:mx-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-10">
                        <div className="flex flex-col items-center mb-8">
                            <img
                                src={darkLogo}
                                alt="RexBid"
                                className="h-12 md:h-14 w-auto object-contain mb-3"
                            />
                            <p className="text-xl text-gray-900 font-extrabold">
                                Tell Us About Your Experience
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(submitHandler)}
                            className="space-y-5"
                        >
                            {/* Name + Email */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                        <User size={16} /> Name *
                                    </label>
                                    <input
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                        placeholder="John Smith"
                                        {...register("name", { required: true })}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-[#D19F3E] mt-1">
                                            Name is required
                                        </p>
                                    )}
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
                                    {errors.email && (
                                        <p className="text-xs text-[#D19F3E] mt-1">
                                            Email is required
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                        <Phone size={16} /> Phone{" "}
                                        <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder={`${otherData?.phoneCode || "+353"} (xxx) xxx xxxx`}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                        {...register("phone")}
                                    />
                                </div>
                            </div>

                            {/* Phone + Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                        <MapPin size={16} /> Location *
                                    </label>
                                    <input
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                        placeholder="Dublin, Ireland"
                                        {...register("location", { required: true })}
                                    />
                                    {errors.location && (
                                        <p className="text-xs text-[#D19F3E] mt-1">
                                            Location is required
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                        <Users size={16} /> I am a *
                                    </label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                        {...register("userType", { required: true })}
                                    >
                                        {USER_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* User Type + Rating */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                        <Star size={16} /> Your Rating *
                                    </label>
                                    <StarPicker
                                        value={ratingValue}
                                        onChange={(v) =>
                                            setValue("rating", v, {
                                                shouldValidate: true,
                                            })
                                        }
                                    />
                                    <input
                                        type="hidden"
                                        {...register("rating", {
                                            required: true,
                                            valueAsNumber: true,
                                        })}
                                    />
                                </div>
                            </div>

                            {/* Feedback */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <MessageCircleQuestion size={16} /> Your Feedback *
                                </label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    placeholder="Tell us about your experience with RexBid"
                                    {...register("feedback", { required: true })}
                                />
                                {errors.feedback && (
                                    <p className="text-xs text-[#D19F3E] mt-1">
                                        Feedback is required
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-[#D19F3E] hover:bg-[#db9a18] text-[#072342] font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {sending ? "Submitting..." : "Submit Review"}
                                {!sending && (
                                    <ArrowRight
                                        size={16}
                                        className="group-hover:translate-x-1 transition"
                                    />
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default RateUs;