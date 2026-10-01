import { Container } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Mail, Phone, User, ArrowRight, MessageCircleQuestion, Type, Truck } from "lucide-react";
import { otherData } from "../assets";
import axiosInstance from "../utils/axiosInstance";

function DeliveryPartnerQuote() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        },
    });

    const [sending, setSending] = useState(false);
    const nameValue = watch("name");

    // Auto-fill subject with name (still editable by the user)
    useEffect(() => {
        if (nameValue && nameValue.trim()) {
            setValue("subject", `New Delivery Quote Request - ${nameValue.trim()}`);
        } else {
            setValue("subject", "New Delivery Quote Request");
        }
    }, [nameValue, setValue]);

    const submitHandler = async (formData) => {
        try {
            setSending(true);
            const { data } = await axiosInstance.post("/api/v1/delivery-quote/submit", formData);

            if (data?.success) {
                toast.success(data.message || "Your quote request has been sent successfully.");
                reset();
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(data?.message || "Failed to send your quote request.");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to send your quote request. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <Container className="pt-24 md:pt-32 pb-16">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/10 border border-[#D19F3E]/20 mb-4">
                    <Truck size={14} className="text-[#D19F3E]" />
                    <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase">
                        Delivery Partner
                    </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#072342]">
                    Get a Delivery Quote
                </h2>
                <p className="text-gray-600 mt-4 text-lg">
                    Tell us about your delivery requirements and our partner team will get back to you with a quote.
                </p>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                            <User size={16} /> Name *
                        </label>
                        <input
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                            placeholder="John Doe"
                            {...register("name", { required: true })}
                        />
                        {errors.name && (
                            <p className="text-xs text-[#D19F3E] mt-1">Name is required</p>
                        )}
                    </div>

                    {/* Email */}
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
                            <p className="text-xs text-[#D19F3E] mt-1">Email is required</p>
                        )}
                    </div>

                    {/* Phone (optional) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                            <Phone size={16} /> Phone <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="tel"
                            placeholder={`${otherData?.phoneCode} (xxx) xxx xxxx`}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                            {...register("phone")}
                        />
                    </div>

                    {/* Subject (auto-filled but editable) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                            <Type size={16} /> Subject *
                        </label>
                        <input
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                            placeholder="New Delivery Quote Request"
                            {...register("subject", { required: true })}
                        />
                        {errors.subject && (
                            <p className="text-xs text-[#D19F3E] mt-1">Subject is required</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                            <MessageCircleQuestion size={16} /> Delivery Details *
                        </label>
                        <textarea
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                            placeholder="Tell us what you need delivered, pickup location, drop-off location, preferred dates, and any special requirements..."
                            {...register("message", { required: true })}
                        />
                        {errors.message && (
                            <p className="text-xs text-[#D19F3E] mt-1">Delivery details are required</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-[#D19F3E] hover:bg-[#db9a18] text-[#072342] font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {sending ? "Sending..." : "Request Quote"}
                        {!sending && (
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition"
                            />
                        )}
                    </button>
                </form>
            </div>
        </Container>
    );
}

export default DeliveryPartnerQuote;