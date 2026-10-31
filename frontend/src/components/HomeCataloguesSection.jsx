import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookMarked } from "lucide-react";
import { Container } from "./index";
import CatalogueCard from "../components/CatalogueCard";
import axiosInstance from "../utils/axiosInstance";

function HomeCataloguesSection() {
    const [catalogues, setCatalogues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upcoming");
    const navigate = useNavigate();

    const tabTitles = { upcoming: "Upcoming", past: "Past" };
    const tabDescriptions = {
        upcoming:
            "Auctions grouped by their closing day. Preview what's on the block before the gavel drops.",
        past:
            "Browse recent catalogues to see how past auctions went.",
    };

    const fetchCatalogues = async (tab = activeTab) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(
                `/api/v1/catalogues?status=${tab}&limit=8`
            );
            if (data.success) setCatalogues(data.data.catalogues || []);
            else setCatalogues([]);
        } catch (err) {
            console.error("Fetch catalogues error:", err);
            setCatalogues([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCatalogues("upcoming");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        fetchCatalogues(tab);
    };

    if (loading && catalogues.length === 0) {
        return (
            <Container className="my-14">
                <div className="mb-8">
                    <div className="h-10 w-72 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-96 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-3 rounded-[24px] border border-gray-100 bg-white p-3 shadow-sm"
                        >
                            <div className="aspect-[4/3] animate-pulse rounded-[18px] bg-gray-100" />
                            <div className="space-y-3 p-2 pt-5">
                                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    // Hide entirely if no catalogues at all
    if (!loading && catalogues.length === 0 && activeTab === "upcoming") {
        return null;
    }

    return (
        <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#C59D55]/[0.045] blur-[100px]" />

            <Container className="mt-8">
                <div className="flex items-center justify-between flex-wrap gap-y-3">
                    {/* <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
                        {tabTitles[activeTab]}
                        <span className="ml-2 font-medium italic text-gray-400">
                            Catalogues
                        </span>
                    </h2> */}

                    <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#072342] leading-tight my-2 flex items-center gap-2">
                        <BookMarked className="text-[#D19F3E]" size={28} />
                        {/* Featured{" "} */}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                Catalogues
                            </span>
                            <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                            </svg>
                        </span>
                    </h2>

                    {/* <div className="flex space-x-2 bg-white p-1 border border-gray-500/50 rounded-md text-sm">
                        {["upcoming", "past"].map((tab) => (
                            <div className="flex items-center" key={tab}>
                                <input
                                    type="radio"
                                    name="home-catalogue-tabs"
                                    id={`home-catalogue-tab-${tab}`}
                                    className="hidden peer"
                                    checked={activeTab === tab}
                                    onChange={() => handleTabChange(tab)}
                                />
                                <label
                                    htmlFor={`home-catalogue-tab-${tab}`}
                                    className="cursor-pointer rounded py-2 px-4 sm:px-8 text-gray-500 transition-colors duration-200 peer-checked:bg-[#F5B51B] peer-checked:text-black capitalize"
                                >
                                    {tab}
                                </label>
                            </div>
                        ))}
                    </div> */}
                </div>

                {/* <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
                    {tabDescriptions[activeTab]}
                </p> */}

                {catalogues.length > 0 ? (
                    <>
                        <div className="mt-10 grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {catalogues.map((cat) => (
                                <CatalogueCard key={cat._id} catalogue={cat} />
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() =>
                                    navigate(
                                        `/catalogues?status=${activeTab}`
                                    )
                                }
                                className="group flex items-center gap-2 rounded-lg bg-[#F5B51B] px-8 py-3 font-medium text-black transition-all duration-300 hover:bg-[#e4a000] hover:shadow-[0_0_35px_rgba(197,157,85,0.25)] focus:outline-none focus:ring-2 focus:ring-[#F5B51B] focus:ring-offset-2"
                            >
                                <BookMarked size={17} />
                                <span>View More</span>
                                <ArrowRight
                                    size={18}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="mt-10 text-center py-16 text-gray-500">
                        <BookMarked size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                            No {activeTab} catalogues
                        </p>
                        <p className="text-sm">
                            Check back soon — new catalogues are added regularly
                        </p>
                    </div>
                )}
            </Container>
        </section>
    );
}

export default HomeCataloguesSection;