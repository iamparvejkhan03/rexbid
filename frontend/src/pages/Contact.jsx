import { Container, FAQs } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useState } from "react";
import {
    Clock,
    Mail,
    MapPin,
    MessageCircleQuestion,
    Phone,
    User,
} from "lucide-react";
import { contactUs, logo, otherData } from "../assets";
import axiosInstance from "../utils/axiosInstance";

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

    const submitHandler = async (contactData) => {
        try {
            setSending(true);

            const { data } = await axiosInstance.post(
                "/api/v1/contact/submit",
                contactData
            );

            if (data?.success) {
                toast.success(data.message);
                reset();
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(data.message || "Failed to submit your query");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to submit your query. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <Container className="pt-24 md:pt-32">
            <h2 className="text-4xl md:text-5xl font-bold text-primary text-center">
                Contact
            </h2>
            <p className="text-center text-primary mt-4">
                Get in touch with our team of experts. We're here to help.
            </p>

            {/* CONTACT PANEL */}
            <section className="relative my-16 rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-y-8 p-6 md:p-12 items-center">
                    {/* LEFT INFO */}
                    <div className="text-white max-w-md">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h2>

                        <p className="text-white/90 mb-8 text-base">
                            Not sure what you need? The team will be happy to listen to your
                            ideas and provide valuable advice to help you start your project.
                        </p>

                        <div className="space-y-4 text-base">
                            <div className="flex items-center gap-3">
                                <Mail size={18} />
                                <Link to={`mailto:${otherData?.email}`} className="hover:underline">{otherData.email}</Link>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone size={18} />
                                <Link to={`tel:${otherData?.phone}`} className="hover:underline">{otherData.phone}</Link>
                            </div>
                        </div>
                    </div>

                    {/* FORM CARD */}
                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">
                            We'd love to hear from you!
                        </h3>

                        <form
                            onSubmit={handleSubmit(submitHandler)}
                            className="space-y-6"
                        >
                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
                                    <User size={18} /> Name *
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Nathan"
                                    {...register("name", { required: true })}
                                />
                                {errors.name && (
                                    <p className="text-sm text-orange-500">Name is required</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
                                    <Mail size={18} /> Email *
                                </label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="name@example.com"
                                    {...register("email", { required: true })}
                                />
                                {errors.email && (
                                    <p className="text-sm text-orange-500">Email is required</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
                                    <Phone size={18} /> Phone
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+47 xxx xxxxx"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    {...register("phone")}
                                />
                            </div>

                            {/* User Type */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-3 block">
                                    I am a
                                </label>

                                <div className="flex gap-6">
                                    {["bidder", "seller", "broker"].map((type) => (
                                        <label
                                            key={type}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                value={type}
                                                {...register("userType")}
                                            />
                                            <span className="capitalize">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
                                    <MessageCircleQuestion size={18} /> Message *
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Tell us how we can help you..."
                                    {...register("message", { required: true })}
                                />
                                {errors.message && (
                                    <p className="text-sm text-orange-500">
                                        Message is required
                                    </p>
                                )}
                            </div>

                            <button className="w-full h-11 rounded-md bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white hover:opacity-90 font-semibold">
                                {sending ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* CONTACT DETAILS */}
            <section className="my-14 grid sm:grid-cols-2 xl:grid-cols-4 gap-8">
                <InfoCard icon={<Phone size={20} className="bg-ora1" />} title="Phone">
                    {otherData.phone}
                </InfoCard>

                <InfoCard icon={<Mail size={20} />} title="Email">
                    {otherData.email}
                </InfoCard>

                <InfoCard icon={<MapPin size={20} />} title="Location">
                    {otherData.address}
                </InfoCard>

                <InfoCard icon={<Clock size={20} />} title="Business Hours">
                    Mon - Fri: 9AM - 5PM <br />
                    Saturday: 9AM – 2:30PM
                </InfoCard>
            </section>
        </Container>
    );
}

const InfoCard = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-primary">{children}</p>
        </div>
    </div>
);

export default Contact;