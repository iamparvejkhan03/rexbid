import { useState, Suspense, lazy, useEffect, forwardRef } from "react";
import { MessageSquare, Gavel, Notebook, PoundSterling } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoadingSpinner = lazy(() => import("./LoadingSpinner"));
const CommentSection = lazy(() => import("./CommentSection"));
const BidHistory = lazy(() => import("./BidHistory"));
const Description = lazy(() => import("./Description"));
const OffersSection = lazy(() => import("./OffersSection"));

const TabSection = forwardRef(
  ({ description, bids, offers, auction, activatedTab, onAuctionUpdate }, ref) => {
    const [activeTab, setActiveTab] = useState(activatedTab || "description");
    const { user } = useAuth();

    // Sync tab when prop changes
    useEffect(() => {
      if (activatedTab) {
        setActiveTab(activatedTab);
      }
    }, [activatedTab]);

    const isBiddingAllowed =
      auction.auctionType === "standard" || auction.auctionType === "reserve";

    const userHasOffers = () => {
      if (!user) return false;

      if (activatedTab === "offers") return true;
      if (!offers || offers.length === 0) return false;

      return offers.some((offer) => {
        const buyerId = offer.buyer?._id || offer.buyer;
        return buyerId && buyerId.toString() === user._id.toString();
      });
    };

    const getUserOffers = () => {
      if (!user || !offers) return [];
      return offers.filter((offer) => {
        const buyerId = offer.buyer?._id || offer.buyer;
        return buyerId && buyerId.toString() === user._id.toString();
      });
    };

    // ✅ Build tabs safely
    const tabs = [];

    tabs.push({
      id: "description",
      label: "Description",
      icon: <Notebook size={18} />,
      component: <Description description={description} />,
    });

    tabs.push({
      id: "comments",
      label: "Comments",
      icon: <MessageSquare size={18} />,
      component: <CommentSection auctionId={auction._id} />,
    });

    if (isBiddingAllowed) {
      tabs.push({
        id: "bids",
        label: "Bid History",
        icon: <Gavel size={18} />,
        component: <BidHistory bids={bids} auction={auction} />,
      });
    }

    if (userHasOffers()) {
      tabs.push({
        id: "offers",
        label: "My Offers",
        icon: <PoundSterling size={18} />,
        component: (
          <OffersSection
            offers={getUserOffers()}
            auction={auction}
            onAuctionUpdate={onAuctionUpdate}
          />
        ),
      });
    }

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-6 py-4 text-base md:text-lg font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary hover:border-gray-300"
                  }
                `}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div ref={ref} className="p-4 sm:p-6">
          <Suspense fallback={<LoadingSpinner />}>
            {tabs.find((tab) => tab.id === activeTab)?.component}
          </Suspense>
        </div>
      </div>
    );
  }
);

TabSection.displayName = "TabSection";

export default TabSection;