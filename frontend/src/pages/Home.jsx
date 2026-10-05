import { lazy, Suspense } from "react";
import { Hero, Container, Testimonial, HowItWorksCard, LoadingSpinner, AuctionCard, AuctionListItem, CategoryCarousel, HowItWorks, PromoBanner } from "../components";
import Marquee from "react-fast-marquee";
import { BadgeCheck, Gavel, Grid, List, Tag, Upload, Filter, UserCog2, LucideVerified, UserPlus, Clock, PhoneCall, Target, Users, ArrowRight, User, CarFront, Hand } from "lucide-react";
import {
    CaseIH,
    Claas,
    Cummins,
    darkLogo,
    evolve,
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
import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const CTA = lazy(() => import('../components/CTA'));
const CategoryIconsSection = lazy(() => import('../components/CategoryIconsSection'));
const TestimonialSection = lazy(() => import('../components/TestimonialSection'));
const About = lazy(() => import('../components/About'));
const FeaturedListings = lazy(() => import('../components/FeaturedListings'));
const HomeLiveAuctionsSection = lazy(() =>import("../components/HomeLiveAuctionsSection"));

const trustedBrands = [
    { src: CaseIH, alt: 'Case IH' },
    { src: Claas, alt: 'Claas' },
    { src: Cummins, alt: 'Cummins' },
    { src: Fendt, alt: 'Fendt' },
    { src: Freightliner, alt: 'Freightliner' },
    { src: Hitachi, alt: 'Hitachi' },
    { src: JCB, alt: 'JCB' },
    { src: JohnDeere, alt: 'John Deere' },
    { src: Komatsu, alt: 'Komatsu' },
    { src: Kubota, alt: 'Kubota' },
    { src: Liebherr, alt: 'Liebherr' },
    { src: MasseyFerguson, alt: 'Massey Ferguson' },
    { src: Mercedes, alt: 'Mercedes' },
    { src: NewHolland, alt: 'New Holland' },
    { src: NokianTyres, alt: 'Nokian Tyres' },
    { src: Peterbilt, alt: 'Peterbilt' },
    { src: Scag, alt: 'Scag' },
    { src: Skania, alt: 'Skania' },
    { src: Stiga, alt: 'Stiga' },
    { src: Timberjack, alt: 'Timberjack' },
    { src: Toro, alt: 'Toro' },
    { src: Toyota, alt: 'Toyota' },
    { src: Volvo, alt: 'Volvo' },
];

function Home() {
    const { user } = useAuth();

    return (
        <>
            <Hero />

            {/* Marquee section */}
            {/* <Container>
                <Marquee speed={50} gradient={false}>
                    <div className="flex gap-8 w-full my-14 mr-8">
                        {
                            trustedBrands.map(brand => (
                                <div key={brand.alt} className="flex items-center justify-center border rounded-lg shadow hover:shadow-lg transition-all border-slate-200 p-4 md:p-5 bg-white">
                                    <img
                                        src={brand.src}
                                        alt={brand.alt}
                                        className="h-6 sm:h-6 md:h-7 lg:h-8 xl:h-9 mix-blend-multiply"
                                    />
                                </div>
                            ))
                        }
                    </div>
                </Marquee>
            </Container> */}

            {/* Category section */}
            {/* <Suspense fallback={<LoadingSpinner />}>
                <CategoryIconsSection />
            </Suspense> */}

            {/* Featured Listings Section */}
            <FeaturedListings />

            <Container>
                <PromoBanner
                logoUrl={evolve}
                title="Nationwide Delivery Available with Our Partner - EVOLVE"
                description=""
                buttonText="Get a Quote Now"
                buttonLink="/delivery-partner-quote"
            />
            </Container>

            {/* Auctions Live section */}
            <Suspense fallback={<LoadingSpinner />}>
                <HomeLiveAuctionsSection />
            </Suspense>

            {/* Who we are section */}
            {/* <Container className="mt-8 md:mb-0">
                <Suspense fallback={<LoadingSpinner />}>
                    <About />
                </Suspense>
            </Container> */}

            {/* <Container className=""> */}
            <HowItWorks />
            {/* </Container> */}

            {/* Testimonials */}
            {/* <Suspense fallback={<LoadingSpinner />}>
                <TestimonialSection />
            </Suspense> */}

            <CTA />
        </>
    )
}

export default Home;