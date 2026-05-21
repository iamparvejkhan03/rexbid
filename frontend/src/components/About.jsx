import { ChartColumnIncreasing, Gavel, Shield, ShieldCheck, Store } from "lucide-react";
import { whoWeAre, about } from "../assets";
import { useEffect, useRef, useState } from "react";

function About() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.25 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className="pb-20 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

                {/* LEFT CONTENT */}
                <div
                    className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Who We <span className="italic text-gray-500 font-medium">Are</span>
                    </h2>

                    <p className="text-gray-600 leading-relaxed text-lg mb-10 max-w-xl">
                        BidNordic is a heavy equipment auction platform built for the Nordic market. We connect dealers, contractors, and industry professionals with industrial-grade machinery at competitive prices. With secure technology and a seasoned team, we deliver transparent, efficient, and trustworthy transactions every time.
                    </p>

                    <div className="space-y-8">

                        {/* Feature 1 */}
                        <div className="flex gap-5 items-start">
                            <div className="p-3 flex items-center justify-center rounded-full bg-orange-100">
                                <Gavel className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-gray-900">
                                    Auction Excellence
                                </h4>
                                <p className="text-gray-600 mt-1">
                                    Our deep experience ensures every auction runs smoothly — from first listing to final sale.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex gap-5 items-start">
                            <div className="p-3 flex items-center justify-center rounded-full bg-orange-100">
                                <ShieldCheck className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-gray-900">
                                    Built on Trust
                                </h4>
                                <p className="text-gray-600 mt-1">
                                    We provide a secure and transparent process for both buyers and sellers across the Nordic region.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex gap-5 items-start">
                            <div className="p-3 flex items-center justify-center rounded-full bg-orange-100">
                                <ChartColumnIncreasing className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-gray-900">
                                    The BidNordic Advantage
                                </h4>
                                <p className="text-gray-600 mt-1">
                                    Faster deals, greater confidence, and seamless auction experiences — every time.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT IMAGE AREA */}
                <div
                    className={`relative transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                        }`}
                >
                    {/* MAIN IMAGE */}
                    <div className="relative">
                        <img
                            src={whoWeAre}
                            alt="workspace"
                            className="rounded-3xl w-full h-[520px] object-cover shadow-xl transition-transform duration-700 hover:scale-[1.02]"
                        />

                        {/* FLOATING STAT */}
                        <div className="absolute top-8 right-8 bg-white/90 backdrop-blur rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4 animate-fadeIn">
                            <div className="text-2xl"><Gavel size={32} /></div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">600+</p>
                                <p className="text-sm text-gray-500">Total Bidders</p>
                            </div>
                        </div>
                    </div>

                    {/* OVERLAP IMAGE */}
                    <img
                        src={about}
                        alt="setup"
                        className="absolute -bottom-16 right-0 w-80 rounded-2xl border-[5px] border-orange-100 transition-transform duration-700 hover:-translate-y-2"
                    />
                </div>
            </div>
        </section>
    );
}

export default About;
