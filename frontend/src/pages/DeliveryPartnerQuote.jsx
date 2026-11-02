import { Container } from "../components";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import {
    Mail,
    Phone,
    User,
    ArrowRight,
    Package,
    Scale,
    MapPin,
    Home,
    Truck,
} from "lucide-react";
import { otherData, logo, evolve, evolveBanner } from "../assets";
import axiosInstance from "../utils/axiosInstance";

function DeliveryPartnerQuote() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            whatDelivered: "",
            weightDimensions: "",
            collectionAddress: "",
            deliveryAddress: "",
        },
    });

    const [sending, setSending] = useState(false);

    const submitHandler = async (formData) => {
        try {
            setSending(true);
            const { data } = await axiosInstance.post(
                "/api/v1/delivery-quote/submit",
                formData
            );

            if (data?.success) {
                gtag('event', 'delivery_quote_request', {
                    lead_type: 'delivery_quote',
                    form_location: 'delivery_partner_quote_page',
                    has_phone: Boolean(formData.phone?.trim()),
                });

                toast.success(
                    data.message ||
                        "Your quote request has been sent successfully."
                );
                reset();
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(
                    data?.message || "Failed to send your quote request."
                );
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
            <div className="max-w-5xl mx-auto">

                {/* ==== HERO BANNER ==== */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl h-56 md:h-72 lg:h-80">
                    <img
                        src={evolveBanner}
                        alt="Delivery partner"
                        className="absolute inset-0 w-full h-full object-cover brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#072342]/90 via-[#072342]/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 md:p-10 md:pb-20 text-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D19F3E]/20 backdrop-blur-sm border border-[#D19F3E]/40 mb-3">
                            <Truck size={12} className="text-[#D19F3E]" />
                            <span className="text-[10px] font-semibold tracking-wider text-[#D19F3E] uppercase">
                                Delivery Partner
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold mb-1">
                            Get a Delivery Quote
                        </h1>
                        <p className="text-white/80 text-sm md:text-base max-w-xl">
                            Tell us about your delivery requirements and our partner team will get back to you with a quote.
                        </p>
                    </div>
                </div>

                {/* ==== FORM CARD ==== */}
                <div className="relative -mt-8 md:-mt-12 md:mx-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-10">

                    <div className="flex flex-col items-center mb-8">
                        <img
                            src={evolve}
                            alt="RexBid"
                            className="h-12 md:h-14 w-auto object-contain mb-3"
                        />
                        <p className="text-xl text-gray-900 font-extrabold">
                            Delivery Partner Quote Request
                        </p>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Items marked with{" "}
                            <span className="text-[#D19F3E] font-semibold">*</span>{" "}
                            mean you must fill in the information to proceed.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">

                        {/* Row 1: Name + Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        </div>

                        {/* Row 2: Phone + What Needs to be Delivered */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <Phone size={16} /> Phone *
                                </label>
                                <input
                                    type="tel"
                                    placeholder={`${otherData?.phoneCode} (xxx) xxx xxxx`}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    {...register("phone", { required: true })}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-[#D19F3E] mt-1">
                                        Phone is required
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <Package size={16} /> What do You Need Delivered? *
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    placeholder="Massey Ferguson 6270"
                                    {...register("whatDelivered", { required: true })}
                                />
                                {errors.whatDelivered && (
                                    <p className="text-xs text-[#D19F3E] mt-1">
                                        This field is required
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Row 3: Weight / Dimensions (optional) */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                <Scale size={16} /> Weight / Dimensions{" "}
                                <span className="text-gray-400">(if known)</span>
                            </label>
                            <input
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                placeholder="4 tonne"
                                {...register("weightDimensions")}
                            />
                        </div>

                        {/* Row 4: Collection + Delivery Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <MapPin size={16} /> Collection Address *
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    placeholder="Letterkenny, Donegal"
                                    {...register("collectionAddress", { required: true })}
                                />
                                {errors.collectionAddress && (
                                    <p className="text-xs text-[#D19F3E] mt-1">
                                        Collection address is required
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <Home size={16} /> Delivery Address *
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D19F3E]/50 focus:border-[#D19F3E] transition"
                                    placeholder="Enniscorthy, Wexford, F34KL871"
                                    {...register("deliveryAddress", { required: true })}
                                />
                                {errors.deliveryAddress && (
                                    <p className="text-xs text-[#D19F3E] mt-1">
                                        Delivery address is required
                                    </p>
                                )}
                            </div>
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
            </div>
        </Container>
    );
}

export default DeliveryPartnerQuote;