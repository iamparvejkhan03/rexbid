import { lazy, Suspense } from "react";
import { Container, PromoBanner } from "../components";
import { evolve } from "../assets";
import HomeHero from "../components/home/HomeHero";
import LiveNowBanner from "../components/home/LiveNowBanner";
import { irishDayKey, useClosingNext } from "../components/home/shared";

const FeaturedListings = lazy(() => import("../components/FeaturedListings"));
const SaleDates = lazy(() => import("../components/home/SaleDates"));
const RecentlySold = lazy(() => import("../components/home/RecentlySold"));
const WhySell = lazy(() => import("../components/home/WhySell"));
const HowItWorksTabs = lazy(() => import("../components/home/HowItWorksTabs"));
const HomeFAQ = lazy(() => import("../components/home/HomeFAQ"));
const SellerCTA = lazy(() => import("../components/home/SellerCTA"));

function Home() {
    // Listings closing next: feeds the "closing now" banner and the hero panel.
    const { items, currency } = useClosingNext(12);

    // The listing the banner is showing (next to close today, Irish time).
    const now = Date.now();
    const today = irishDayKey(now);
    const liveNow = items.find(
        (a) => new Date(a.endDate).getTime() > now && irishDayKey(a.endDate) === today
    );

    return (
        <>
            <LiveNowBanner items={items} currency={currency} />
            <HomeHero items={items} currency={currency} excludeId={liveNow?._id} belowBanner={!!liveNow} />

            <Suspense fallback={null}>
                <SaleDates />
                <div className="bg-white pt-4">
                    <FeaturedListings />
                </div>
                <Container>
                    <PromoBanner
                        logoUrl={evolve}
                        title="Nationwide delivery with our transport partner EVOLVE"
                        description="Get a quote for any machine on RexBid."
                        buttonText="Get a quote"
                        buttonLink="/delivery-partner-quote"
                    />
                </Container>
                <RecentlySold />
                <WhySell />
                <HowItWorksTabs />
                <HomeFAQ />
                <SellerCTA />
            </Suspense>
        </>
    );
}

export default Home;
