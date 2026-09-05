import { CalendarDays, CheckSquare, Clock, Download, File, Fuel, Gauge, Gavel, Heart, Loader, MapPin, MessageCircle, PaintBucket, Plane, ShieldCheck, Tag, User, Users, Weight, Zap, Banknote, MessageSquare, Mail, Phone, Star, CreditCard, Info } from "lucide-react";
import { BidConfirmationModal, BuyNowModal, Container, GiveawayClaimModal, LoadingSpinner, MobileBidStickyBar, RatingStars, ReviewModal, SellerStatsCard, SpecificationsSection, TabSection, TimerDisplay, WatchlistButton } from "../components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { lazy, Suspense, useRef, useState, useEffect } from "react";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useComments } from "../hooks/useComments";
import { useWatchlist } from "../hooks/useWatchlist";
import { useAuth } from "../contexts/AuthContext";
import PilotPhaseModal from "../components/PilotPhaseModal";

const YouTubeEmbed = lazy(() => import('../components/YouTubeEmbed'));
const ImageLightBox = lazy(() => import('../components/ImageLightBox'));
const MakeOfferModal = lazy(() => import('../components/MakeOfferModal'));

function SingleAuction() {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [buying, setBuying] = useState(false);
    const [makingOffer, setMakingOffer] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState(false);
    const bidSectionRef = useRef(null);
    const commentSectionRef = useRef(null);
    const offerSectionRef = useRef(null);
    const auctionTime = useAuctionCountdown(auction);
    const countdown = useAuctionCountdown(auction);
    const [activeTab, setActiveTab] = useState('description');
    const { pagination } = useComments(id);
    const { isWatchlisted, toggleWatchlist, watchlistCount } = useWatchlist(id);
    const hasFetchedRef = useRef(false);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const formRef = useRef();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showBuyNowModal, setShowBuyNowModal] = useState(false);
    const [showGiveawayModal, setShowGiveawayModal] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [isClaimingGiveaway, setIsClaimingGiveaway] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [revieweeId, setRevieweeId] = useState(null);
    const [auctionReviews, setAuctionReviews] = useState([]);
    const makingOfferRef = useRef(false);
    // Pilot phase
    const [isPilotModalOpen, setIsPilotModalOpen] = useState(false);
    const timeRemaining = auction?.endDate ? new Date(auction.endDate) - new Date() : 0;

    const userCurrency = user?.currency || 'EUR';

    const updateAuctionState = (updatedAuction) => {
        setAuction(updatedAuction);
    };

    const handleOpenBidModal = () => {
        setIsBidModalOpen(true);
        // setIsPilotModalOpen(true);
    };

    const handleConfirmBid = (e) => {
        handleBid(e);
        setIsBidModalOpen(false);
    };

    const handleCloseBidModal = () => {
        setIsBidModalOpen(false);
    };

    const handlePilotModalClose = () => {
        setIsPilotModalOpen(false);
        navigate('/');
    };

    const handleOpenMakeOfferModal = () => {
        setIsMakeOfferModalOpen(true);
        // setIsPilotModalOpen(true);
    };

    const handleCloseMakeOfferModal = () => {
        setIsMakeOfferModalOpen(false);
        setOfferAmount('');
        setOfferMessage('');
    };

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/auctions/${id}?currency=${userCurrency}`);
                if (data.success) {
                    setAuction(data.data.auction);
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to fetch auction');
                console.error('Fetch auction error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (countdown?.status === 'ended') {
            const timer = setTimeout(() => {
                fetchAuction();
            }, 2000);
            return () => clearTimeout(timer);
        } else if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchAuction();
        }
    }, [id, countdown?.status]);

    useEffect(() => {
        const fetchUserReview = async () => {
            if (!user || !auction || auction.status !== 'sold') return;
            try {
                const { data } = await axiosInstance.get(`/api/v1/reviews/my-review/auction/${auction._id}`);
                setUserReview(data.data);
            } catch (error) {
                console.error("Error fetching user review:", error);
            }
        };
        fetchUserReview();
    }, [user, auction]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!auction?._id) return;
            try {
                const { data } = await axiosInstance.get(`/api/v1/reviews/auction/${auction._id}`);
                setAuctionReviews(data.data);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };
        fetchReviews();
    }, [auction]);

    const handleGiveawayClaimSuccess = async () => {
        try {
            const { data } = await axiosInstance.get(`/api/v1/auctions/${id}?currency=${userCurrency}`);
            if (data.success) {
                setAuction(data.data.auction);
            }
        } catch (error) {
            console.error("Error refreshing auction:", error);
        }
    };

    const scrollToBidSection = () => {
        bidSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const scrollToCommentSection = () => {
        commentSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const scrollToOfferSection = () => {
        offerSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'comments' || tabId === 'bids' || tabId === 'offers') {
            scrollToCommentSection();
        }
    };

    // ============= BID HANDLER =============
    const handleBid = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must login to bid.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't bid on your own auction.`);
            return;
        }

        // Calculate minimum bid in user's currency
        let minBidInUserCurrency;
        if (auction.bidCount === 0) {
            // First bid: must be at least starting price
            minBidInUserCurrency = auction.convertedStartPrice;
        } else {
            // Subsequent bids: current price + bid increment
            minBidInUserCurrency = auction.convertedCurrentPrice + (auction.convertedBidIncrement || 0);
        }

        const bidValue = parseFloat(bidAmount);
        if (!bidAmount || bidValue < minBidInUserCurrency) {
            const currencySymbol = userCurrency === 'GBP' ? '£' : '€';
            toast.error(`Minimum bid is ${currencySymbol}${minBidInUserCurrency.toFixed(2)}`);
            return;
        }

        try {
            setBidding(true);

            const { data } = await axiosInstance.post(`/api/v1/auctions/bid/${id}`, {
                amount: bidValue,
                currency: userCurrency
            });

            if (data.success) {
                setAuction(data.data.auction);
                setBidAmount('');
                toast.success('Bid placed successfully!');

                // Show anti-sniping message if the auction time was extended
                if (data.data.extended) {
                    toast.success('Anti-sniping: Your bid extended the auction by 1 minute!', {
                        duration: 5000,
                        position: 'bottom-center',
                        icon: '⏳',
                    });
                }
            }
        } catch (error) {
            // ✅ NEW: Handle payment method required error
            if (error?.response?.data?.errorCode === 'PAYMENT_METHOD_REQUIRED' ||
                error?.response?.data?.errorCode === 'PAYMENT_METHOD_INVALID' ||
                error?.response?.data?.errorCode === 'STRIPE_CUSTOMER_INVALID') {

                const redirectUrl = error.response.data.redirectTo || `/${user.userType || 'bidder'}/billing`;

                // Show a more prominent message
                toast.error(
                    (error) => (
                        <div>
                            <p className="font-medium">{error.response?.data?.message || 'Payment method required'}</p>
                            {/* <button
                                onClick={() => navigate(redirectUrl)}
                                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Add Payment Method
                            </button> */}
                        </div>
                    ),
                    { duration: 10000 }
                );

                // Optionally redirect after a delay
                setTimeout(() => {
                    navigate(redirectUrl);
                }, 1500);
            } else {
                toast.error(error?.response?.data?.message || 'Failed to place bid');
            }
            console.error('Bid error:', error);
        } finally {
            setBidding(false);
        }
    };

    // ============= BUY NOW HANDLER =============
    const handleBuyNow = async () => {
        if (!user) {
            toast.error('You must login to buy now.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't buy your own auction.`);
            return;
        }

        if (!auction.convertedBuyNowPrice) {
            toast.error('Buy Now is not available for this auction.');
            return;
        }

        if (countdown.status !== 'always-available') {
            toast.error('Auction is not active.');
            return;
        }

        try {
            setBuying(true);

            // Execute Buy Now - SIMPLIFIED VERSION
            const { data } = await axiosInstance.post(`/api/v1/buy-now/${id}`);

            if (data.success) {
                setAuction(data.data.auction);
                toast.success('Congratulations! You have purchased this item.');

                // Optionally scroll to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to complete Buy Now purchase');
            console.error('Buy Now error:', error);
        } finally {
            setBuying(false);
        }
    };

    // const handleClaimNow = async () => {
    //     if (!user) {
    //         toast.error('You must login to claim this item.');
    //         navigate('/login');
    //         return;
    //     }

    //     if (user._id?.toString() === auction?.seller?._id?.toString()) {
    //         toast.error(`You can't claim your own giveaway.`);
    //         return;
    //     }

    //     if (auction.winner) {
    //         toast.error('This item has already been claimed.');
    //         return;
    //     }

    //     try {
    //         setClaiming(true);

    //         const { data } = await axiosInstance.post(`/api/v1/buy-now/${id}`);

    //         if (data.success) {
    //             setAuction(data.data.auction);
    //             toast.success('🎉 Congratulations! You have claimed this item for free!');
    //             setShowBuyNowModal(false);
    //             window.scrollTo({ top: 0, behavior: 'smooth' });
    //         }
    //     } catch (error) {
    //         toast.error(error?.response?.data?.message || 'Failed to claim item');
    //         console.error('Claim error:', error);
    //     } finally {
    //         setClaiming(false);
    //     }
    // };

    // ============= GIVEAWAY HANDLER =============

    const handleClaimGiveaway = async () => {
        if (!user) {
            toast.error('You must be logged in to participate in this giveaway.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't participate in your own giveaway.`);
            return;
        }

        if (auction.winner) {
            toast.error('This item has already been given away.');
            return;
        }

        try {
            setIsClaimingGiveaway(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to claim item');
            console.error('Claim error:', error);
        } finally {
            setIsClaimingGiveaway(false);
        }
    }

    const handleMakeOffer = async (e) => {
        e.preventDefault();
        if (makingOfferRef.current) return;
        makingOfferRef.current = true;

        if (!user) {
            toast.error('You must login to make an offer.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't make an offer on your own auction.`);
            return;
        }

        if (!auction.allowOffers) {
            toast.error('Offers are not allowed for this auction.');
            return;
        }

        if (!offerAmount || parseFloat(offerAmount) <= 0) {
            toast.error('Please enter a valid offer amount.');
            return;
        }

        if (parseFloat(offerAmount) < auction.convertedStartPrice) {
            toast.error(`Offer must be at least ${userCurrency === 'GBP' ? '£' : '€'}${auction.convertedStartPrice}`);
            return;
        }

        if (auction.convertedBuyNowPrice && parseFloat(offerAmount) >= auction.convertedBuyNowPrice) {
            toast.error(`Offer is higher than Buy Now price. Consider using Buy Now instead.`);
            return;
        }

        try {
            setMakingOffer(true);

            const { data } = await axiosInstance.post(`/api/v1/offers/auction/${id}`, {
                amount: parseFloat(offerAmount),
                message: offerMessage,
                currency: userCurrency
            });

            if (data.success) {
                // Update auction state
                setAuction(data.data.auction);

                handleCloseMakeOfferModal();
                toast.success('Your offer has been submitted successfully!');

                // Switch to offers tab
                setActiveTab('offers');
            }
        } catch (error) {
            // Handle payment method required error
            if (error?.response?.data?.errorCode === 'PAYMENT_METHOD_REQUIRED' ||
                error?.response?.data?.errorCode === 'PAYMENT_METHOD_INVALID' ||
                error?.response?.data?.errorCode === 'STRIPE_CUSTOMER_INVALID') {

                const redirectUrl = error.response.data.redirectTo || `/${user?.userType || 'bidder'}/billing`;

                // Show a more prominent message
                toast.error(
                    (error) => (
                        <div>
                            <p className="font-medium">{error.response?.data?.message || 'Payment method required'}</p>
                            {/* <button
                                onClick={() => navigate(redirectUrl)}
                                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Add Payment Method
                            </button> */}
                        </div>
                    ),
                    { duration: 10000 }
                );

                // Optionally redirect after a delay
                setTimeout(() => {
                    navigate(redirectUrl);
                }, 1500);
            } else {
                toast.error(error?.response?.data?.message || 'Failed to submit offer');
            }
            console.error('Offer error:', error);
        } finally {
            setMakingOffer(false);
            makingOfferRef.current = false;
        }
    };

    // Handle document download
    const handleDocumentDownload = (documentUrl, filename) => {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = filename;
        link.target = '_blank';
        link.click();
    };

    // Extract YouTube ID from URL
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const youtubeVideoId = getYouTubeId(auction?.videoLink);
    const minBidAmount = auction?.bidCount > 0 ? auction?.convertedCurrentPrice + auction?.convertedBidIncrement : auction?.convertedCurrentPrice;

    // Check if Buy Now is available - remove timer check for buy_now
    const isBuyNowAvailable = auction?.convertedBuyNowPrice &&
        auction?.auctionType === 'buy_now' &&
        !auction?.winner &&
        auction?.status === 'active'; // Only check status, not timer

    // Check if Make Offer is available - updated for all auction types
    const isMakeOfferAvailable = auction?.allowOffers &&
        !auction?.winner &&
        auction?.status === 'active' && // Check status instead of countdown
        (auction.auctionType === 'standard' ||
            auction.auctionType === 'reserve' ||
            auction.auctionType === 'buy_now'); // Include buy_now

    if (loading) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (!auction) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600">Auction not found</h2>
                    <Link to="/auctions" className="text-orange-500 hover:underline mt-4 inline-block">
                        Back to Auctions
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className={`pt-32 pb-16 min-h-[70vh] grid grid-cols-1 lg:grid-cols-3 items-start gap-10`}>
            <section className="col-span-1 lg:col-span-2">
                {/* Title and top section */}
                <div className="flex flex-wrap gap-2 capitalize justify-between items-center text-secondary">
                    <div className="flex flex-wrap gap-2">
                        Category: {auction.categories?.map((category, index) => (
                            <Link
                                key={index}
                                to={`/auctions?category=${category}`}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <p onClick={toggleWatchlist}
                            className={`flex items-center gap-2 py-1 px-3 border border-gray-200 rounded-full transition-colors ${isWatchlisted
                                ? 'bg-gray-100 text-black hover:bg-gray-200'
                                : 'text-secondary hover:bg-gray-200'
                                } disabled:opacity-50`}>
                            <Heart size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />
                            <span>{watchlistCount || auction?.watchlistCount || 0}</span>
                        </p>

                        <p onClick={() => handleTabClick('comments')}
                            className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                            <MessageSquare size={18} />
                            <span>{pagination?.totalComments || 0}</span>
                        </p>

                        {
                            (auction.auctionType === 'standard' || auction.auctionType === 'reserve') && (
                                <p onClick={() => handleTabClick('bids')}
                                    className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                                    <Gavel size={20} />
                                    <span>{auction.bids?.length || 0}</span>
                                </p>
                            )
                        }

                        {/* Offers Count */}
                        {auction?.allowOffers && (
                            <p onClick={() => handleTabClick('offers')}
                                className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                                <Banknote size={18} />
                                {/* <span>{auction.offers.filter(o => o.status === 'pending').length}</span> */}
                                <span>{auction.offers?.length}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="my-5">
                    <MobileBidStickyBar
                        currentBid={auction.convertedCurrentPrice}
                        timeRemaining={countdown}
                        onBidClick={() => scrollToBidSection()}
                        convertedBuyNowPrice={auction.convertedBuyNowPrice}
                        onBuyNowClick={isBuyNowAvailable ? handleBuyNow : null}
                        onMakeOfferClick={isMakeOfferAvailable ? handleOpenMakeOfferModal : null}
                        allowOffers={auction.allowOffers}
                        auctionType={auction.auctionType}
                        status={countdown.status}
                        auction={auction}
                        userCurrency={userCurrency}
                    />
                </div>

                <div className="flex items-center gap-3 my-6 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-semibold text-primary">{auction.title}</h2>
                    {/* {auctionReviews.length > 0 && (
                        <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                            <RatingStars rating={auctionReviews.reduce((sum, r) => sum + r.rating, 0) / auctionReviews.length} size={16} />
                            <span className="text-sm text-gray-600 ml-1">({auctionReviews.length})</span>
                        </div>
                    )} */}
                </div>

                {/* Image section */}
                {/* <Suspense fallback={<LoadingSpinner />}> */}
                <ImageLightBox isFeatured={auction.isFeatured} images={auction.photos} auctionType={auction?.auctionType} isReserveMet={auction.convertedCurrentPrice >= auction.reservePrice} />
                {/* </Suspense> */}

                <hr className="my-8" />

                {/* Info section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Auction Overview</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
                        {/* <div className="flex items-center gap-3">
                            <Plane className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Title</p>
                                <p className="text-base">{auction.title}</p>
                            </div>
                        </div> */}

                        <div className="flex items-center gap-3">
                            <Tag className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Category</p>
                                <p className="text-base capitalize">{auction?.categories[1]}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Location</p>
                                <p className="text-base">{auction.location || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <CalendarDays className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Start Date</p>
                                <p className="text-base">
                                    {new Date(auction.startDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">End Date</p>
                                <p className="text-base">
                                    {new Date(auction.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Seller</p>
                                <p className="text-base break-all">{auction.sellerUsername}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Gavel className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Auction Type</p>
                                <p className="text-base capitalize">
                                    {auction.auctionType === 'reserve' ? 'Reserve Price' : auction.auctionType === 'standard' ? 'Standard' : auction.auctionType === 'giveaway' ? 'Giveaway' : 'Buy Now'}
                                </p>
                            </div>
                        </div>

                        {/* <div className="flex items-center gap-3">
                            <ShieldCheck className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8" strokeWidth={1} />
                            <div>
                                <p className="text-secondary text-sm">Status</p>
                                <p className="text-base capitalize">
                                    {auction.status}
                                </p>
                            </div>
                        </div> */}
                    </div>

                    {/* Dynamic Specifications Section */}
                    <SpecificationsSection auction={auction} />
                </div>
                {/* Features Section */}
                {auction.features && (
                    <>
                        <div>
                            <hr className="my-8" />
                            <h3 className="my-5 text-primary text-xl font-semibold">Features & Options</h3>
                            <div className="prose prose-lg max-w-none border rounded-lg px-6 py-3 bg-white text-md">
                                {auction.features ? (
                                    <div dangerouslySetInnerHTML={{ __html: auction.features }} />
                                ) : (
                                    <p className="text-gray-500">No Features provided.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Document section */}
                {auction.documents && auction.documents.length > 0 && (
                    <div>
                        <hr className="my-8" />
                        <h3 className="my-5 text-primary text-xl font-semibold">Document(s)</h3>
                        <div className="flex gap-5 max-w-full flex-wrap">
                            {auction.documents.map((doc, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleDocumentDownload(doc.url, doc.originalName || doc.filename)}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary"
                                    >
                                        <File size={20} className="flex-shrink-0" />
                                        <span className="group-hover:underline max-w-[125px] truncate">
                                            {doc.originalName || doc.filename}
                                        </span>
                                        <Download size={20} className="flex-shrink-0" />
                                    </button>
                                    {/* Add caption display for documents */}
                                    {doc.caption && (
                                        <p className="text-xs text-gray-600 mt-1 max-w-[150px] text-center truncate" title={doc.caption}>
                                            {doc.caption}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Service Records Section */}
                {auction.serviceRecords && auction.serviceRecords.length > 0 && (
                    <>
                        <div>
                            <h3 className="my-5 text-primary text-xl font-semibold">Other Images</h3>
                            <ImageLightBox
                                images={auction.serviceRecords}
                                captions={auction.serviceRecords.map(record => record.caption || '')} // ADD THIS LINE
                                type="logbooks"
                            />
                        </div>
                    </>
                )}

                {/* Video section */}
                {youtubeVideoId && (
                    <>
                        <div className="my-8" />
                        <div>
                            <h3 className="my-5 text-primary text-xl font-semibold">Video Look</h3>
                            <Suspense fallback={<LoadingSpinner />}>
                                <YouTubeEmbed videoId={youtubeVideoId} title={auction.title} />
                            </Suspense>
                        </div>
                    </>
                )}

                {/* NEW: Seller Stats Card */}
                {auction?.seller && (
                    <div className="my-8">
                        <SellerStatsCard sellerId={auction.seller._id} />
                    </div>
                )}

                <Suspense fallback={<LoadingSpinner />}>
                    <TabSection
                        ref={commentSectionRef}
                        description={auction.description}
                        bids={auction.bids}
                        offers={auction.offers}
                        auction={auction}
                        activatedTab={activeTab}
                        onAuctionUpdate={updateAuctionState}
                        auctionReviews={auctionReviews}
                        userCurrency={userCurrency}
                    />
                </Suspense>

            </section>

            {/* Bid Section */}
            <section ref={bidSectionRef} className="col-span-1 lg:col-span-1 border border-gray-200 bg-gray-100 rounded-lg sticky top-24">
                {/* Timer section */}
                <TimerDisplay countdown={countdown} auction={auction} userCurrency={userCurrency} />

                <hr className="mx-6" />

                {/* Current bid section */}
                <div className="p-4 flex flex-col gap-3">
                    {
                        (auction.auctionType === 'standard' || auction.auctionType === 'reserve') && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <p className="font-light">{auction.bidCount > 0 ? 'Current Bid' : 'Start Bidding At'}</p>
                                    <p className="flex items-center gap-1 text-3xl sm:text-4xl font-medium">
                                        <span>{userCurrency === 'GBP' ? '£' : '€'}</span>
                                        <span> {auction.convertedCurrentPrice?.toFixed(2).toLocaleString()}</span>
                                    </p>
                                </div>

                                {auction.auctionType === 'reserve' && timeRemaining > 0 && timeRemaining > 6 * 60 * 60 * 1000 && (
                                    <p className={`${auction.convertedCurrentPrice >= auction.reservePrice ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'} flex items-start self-start text-xs font-medium px-4 py-2 rounded-md`}>
                                        {auction.convertedCurrentPrice >= auction.reservePrice ? 'Reserve Met' : 'Reserve Not Met'}
                                    </p>
                                )}

                                {/* ----- RESERVE PROGRESS INDICATOR (only in last 6h) ----- */}
                                {auction.auctionType === 'reserve' &&
                                    auction.status === 'active' &&
                                    countdown.status === 'counting-down' &&
                                    timeRemaining > 0 &&                    // still active
                                    timeRemaining < 6 * 60 * 60 * 1000 &&   // last 6 hours
                                    auction.reservePrice > auction.startPrice &&
                                    auction.bidCount > 0 &&                 // optional: only show if there's at least one bid
                                    (
                                        <div className="mt-2 border-t pt-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-secondary">Reserve Progress</span>
                                                <span className="text-xs font-medium">
                                                    {auction.convertedCurrentPrice >= auction.convertedReservePrice
                                                        ? '✅ Met'
                                                        : '⏳ Not met'}
                                                </span>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-500 ${auction.convertedCurrentPrice >= auction.convertedReservePrice
                                                            ? 'bg-green-500'
                                                            : 'bg-orange-400'
                                                        }`}
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            ((auction.convertedCurrentPrice - auction.convertedStartPrice) /
                                                                (auction.convertedReservePrice - auction.convertedStartPrice)) *
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                <p className="flex w-full justify-between border-b pb-2">
                                    <span className="text-secondary">Starting Bid</span>
                                    <span className="font-medium">{userCurrency === 'GBP' ? '£' : '€'}{auction.convertedStartPrice?.toFixed(2).toLocaleString()}</span>
                                </p>

                                <p className="flex w-full justify-between border-b pb-2">
                                    <span className="text-secondary">No. of Bids</span>
                                    <span className="font-medium">{auction?.bidCount}</span>
                                </p>
                            </>
                        )
                    }

                    {
                        auction.allowOffers && (auction.auctionType === 'buy_now' || auction.auctionType === 'giveaway') && (
                            <>
                                <div className="flex flex-col gap-2">
                                    {auction.status === 'sold' || auction.winner ? (
                                        <>
                                            <p className="font-light">Sold For</p>
                                            <p className="flex items-center gap-1 text-3xl sm:text-4xl font-medium">
                                                <span>{userCurrency === 'GBP' ? '£' : '€'}</span>
                                                <span>{auction.convertedFinalPrice?.toFixed(2).toLocaleString() || auction.convertedCurrentPrice?.toFixed(2).toLocaleString()}</span>
                                            </p>
                                        </>
                                    ) : (
                                        // Only show offer starting at if convertedStartPrice > 0
                                        auction.convertedStartPrice > 0 ? (
                                            <>
                                                <p className="font-light">Offer Starting At</p>
                                                <p className="flex items-center gap-1 text-3xl sm:text-4xl font-medium">
                                                    <span>{userCurrency === 'GBP' ? '£' : '€'}</span>
                                                    <span>{auction.convertedStartPrice?.toFixed(2).toLocaleString()}</span>
                                                </p>
                                            </>
                                        ) : (
                                            // For items with 0 convertedStartPrice (giveaways/buy now), show make offer prompt
                                            ''
                                        )
                                    )}
                                </div>
                            </>
                        )
                    }

                    {
                        auction.allowOffers && (
                            <p className="flex w-full justify-between border-b pb-2">
                                <span className="text-secondary">No. of Offers</span>
                                <span className="font-medium">{auction?.offers?.length}</span>
                            </p>
                        )
                    }

                    {
                        (auction.auctionType === 'reserve' || auction.auctionType === 'standard') && (
                            <p className="flex w-full justify-between border-b pb-2">
                                <span className="text-secondary">Min. Bid Increment</span>
                                <span className="font-medium">{userCurrency === 'GBP' ? '£' : '€'}{auction?.convertedBidIncrement?.toFixed(2).toLocaleString()}</span>
                            </p>
                        )
                    }

                    {/* Buy Now Price Display */}
                    {(auction.auctionType === 'buy_now' && auction.convertedBuyNowPrice) && (
                        <div className="bg-white border border-green-300 rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-secondary text-sm">Buy Now Price</p>
                                    <p className="text-2xl font-bold text-green-600">{userCurrency === 'GBP' ? '£' : '€'}{auction.convertedBuyNowPrice?.toFixed(2).toLocaleString()}</p>
                                </div>
                                <Zap className="text-green-500" size={24} />
                            </div>
                        </div>
                    )}

                    {/* Giveaway Display */}
                    {auction.auctionType === 'giveaway' && (
                        <div className="bg-green-50 border border-green-300 rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    {/* <p className="text-secondary text-sm">Giveaway</p> */}
                                    <p className="text-2xl font-bold text-green-600">Giveaway</p>
                                    {auction.winner && (
                                        <p className="text-sm text-green-600 mt-1">
                                            Claimed by: {auction.winner.username}
                                        </p>
                                    )}
                                </div>
                                <span className="text-4xl">🎁</span>
                            </div>
                        </div>
                    )}

                    {/* GIVEAWAY HANDLING - This should be first */}
                    {auction.auctionType === 'giveaway' && auction.status !== 'sold' && countdown?.status === 'always-available' && (
                        <>
                            <button
                                onClick={() => setShowGiveawayModal(true)}
                                disabled={isClaimingGiveaway}
                                className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-3 px-6 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors text-lg font-semibold"
                            >
                                {isClaimingGiveaway ? (
                                    <Loader size={20} className="animate-spin-slow" />
                                ) : (
                                    <>
                                        <span>🎁</span>
                                        <span>Enter Giveaway</span>
                                    </>
                                )}
                            </button>

                            <GiveawayClaimModal
                                isOpen={showGiveawayModal}
                                onClose={() => setShowGiveawayModal(false)}
                                onSuccess={handleGiveawayClaimSuccess}
                                auctionId={auction._id}
                            />
                        </>
                    )}

                    {/* Show claimed status for won giveaways */}
                    {auction.auctionType === 'giveaway' && auction.winner && (
                        <div className="text-center py-4 bg-purple-100 rounded-lg border border-purple-200">
                            <p className="font-medium text-purple-700">🎁 Item Claimed</p>
                            <p className="text-sm text-purple-600 mt-1">
                                Claimed by: {auction.winner.username}
                            </p>
                        </div>
                    )}

                    {/* REGULAR AUCTION HANDLING - For non-giveaway auctions */}
                    {auction.auctionType !== 'giveaway' && (
                        <>
                            {/* ACTIVE STATES - Show for both counting-down and always-available */}
                            {(countdown.status === 'counting-down' || countdown.status === 'always-available') && (
                                <>
                                    <p className="bg-blue-100 text-blue-600 py-2 px-4 rounded-md text-sm flex items-center gap-2"><Info size={14} />{auction?.vatIncluded ? 'VAT to be added' : 'No VAT  to be added'}</p>
                                    {/* Bid Form for standard/reserve - only show for timed auctions */}
                                    {(auction.auctionType === 'standard' || auction.auctionType === 'reserve') && (
                                        <form ref={formRef} onSubmit={handleBid} className="flex flex-col gap-4">
                                            <input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="py-3 px-5 w-full border-2 border-gray-400 rounded-lg focus:outline-2 focus:outline-primary"
                                                placeholder={`Enter your bid amount (${userCurrency === 'GBP' ? '£' : '€'}${auction.bidCount > 0 ? minBidAmount?.toFixed(2) : auction.convertedStartPrice?.toFixed(2)} or higher)`}
                                                min={minBidAmount?.toFixed(2)}
                                            />
                                            <button
                                                type="button"
                                                disabled={bidding}
                                                onClick={() => handleOpenBidModal(bidAmount)}
                                                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 px-6 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                                            >
                                                {bidding ? (
                                                    <Loader size={16} className="animate-spin-slow" />
                                                ) : (
                                                    <>
                                                        <Gavel />
                                                        <span>Place Bid</span>
                                                    </>
                                                )}
                                            </button>

                                            <BidConfirmationModal
                                                isOpen={isBidModalOpen}
                                                onClose={handleCloseBidModal}
                                                onConfirm={handleConfirmBid}
                                                bidAmount={bidAmount}
                                                auction={auction}
                                                ref={formRef}
                                            />
                                        </form>
                                    )}

                                    {/* Buy Now Button - Show for buy_now auctions */}
                                    {auction.auctionType === 'buy_now' && isBuyNowAvailable && (
                                        <>
                                            <button
                                                onClick={() => setShowBuyNowModal(true)}
                                                disabled={buying || !isBuyNowAvailable}
                                                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-6 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                            >
                                                {buying ? (
                                                    <Loader size={16} className="animate-spin-slow" />
                                                ) : (
                                                    <>
                                                        <Zap />
                                                        <span>Buy Now {userCurrency === 'GBP' ? '£' : '€'}{auction.convertedBuyNowPrice?.toFixed(2).toLocaleString()}</span>
                                                    </>
                                                )}
                                            </button>

                                            <BuyNowModal
                                                isOpen={showBuyNowModal}
                                                onClose={() => setShowBuyNowModal(false)}
                                                onConfirm={handleBuyNow}
                                                auction={auction}
                                                loading={buying}
                                            />
                                        </>
                                    )}

                                    {/* Make Offer Button - Show for any auction type that allows offers and is active */}
                                    {isMakeOfferAvailable && (
                                        <button
                                            onClick={handleOpenMakeOfferModal}
                                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 py-3 px-6 cursor-pointer rounded-lg transition-colors"
                                        >
                                            <Banknote />
                                            <span>Make an Offer</span>
                                        </button>
                                    )}

                                    {/* Make Offer Modal */}
                                    <Suspense fallback={null}>
                                        <MakeOfferModal
                                            isOpen={isMakeOfferModalOpen}
                                            onClose={handleCloseMakeOfferModal}
                                            onSubmit={handleMakeOffer}
                                            offerAmount={offerAmount}
                                            setOfferAmount={setOfferAmount}
                                            offerMessage={offerMessage}
                                            setOfferMessage={setOfferMessage}
                                            loading={makingOffer}
                                            auction={auction}
                                        />
                                    </Suspense>
                                </>
                            )}

                            {/* Make Payment Button for sold auctions */}
                            {auction.status === 'sold' && user && (user._id === auction.winner?._id) && (
                                <button
                                    onClick={() => {
                                        navigate(`/checkout/${auction?._id}`)
                                    }}
                                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={18} /> Pay Now
                                </button>
                            )}

                            {/* Review Button for sold auctions */}
                            {auction.status === 'sold' && user && (user._id === auction.seller?._id || user._id === auction.winner?._id) && !userReview && (
                                <button
                                    onClick={() => {
                                        setRevieweeId(user._id === auction.seller?._id ? auction.winner?._id : auction.seller?._id);
                                        setShowReviewModal(true);
                                    }}
                                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Star size={18} /> Rate {user._id === auction.seller?._id ? "Bidder" : "Seller"}
                                </button>
                            )}

                            <ReviewModal
                                isOpen={showReviewModal}
                                onClose={() => setShowReviewModal(false)}
                                auctionId={auction._id}
                                revieweeId={revieweeId}
                                onSuccess={() => {
                                    setUserReview({}); // mark as reviewed
                                    toast.success("Thank you for your review!");
                                }}
                            />

                            {/* Non-active states for regular auctions */}
                            {countdown.status === 'approved' && (
                                <div className="text-center py-4 bg-blue-100 rounded-lg border border-blue-200">
                                    <p className="font-medium text-blue-700">Auction Not Started</p>
                                    <p className="text-sm text-blue-600 mt-1">Bidding will begin when the auction starts</p>
                                </div>
                            )}

                            {countdown.status === 'ended' && (
                                <div className="text-center py-4 bg-yellow-100 rounded-lg border border-yellow-200">
                                    <p className="font-medium text-yellow-700">Auction Ended</p>
                                    {auction.winner ? (
                                        <p className="text-sm text-yellow-600 mt-1">Winner: {auction.winner.username}</p>
                                    ) : auction.status === 'sold' ? (
                                        <p className="text-sm text-green-600 mt-1">Item Sold</p>
                                    ) : auction.status === 'reserve_not_met' ? (
                                        <p className="text-sm text-yellow-600 mt-1">Reserve Not Met</p>
                                    ) : auction.status === 'sold_buy_now' ? (
                                        <p className="text-sm text-green-600 mt-1">Sold via Buy Now</p>
                                    ) : (
                                        <p className="text-sm text-yellow-600 mt-1">No winning bidder</p>
                                    )}
                                </div>
                            )}

                            {countdown.status === 'cancelled' && (
                                <div className="text-center py-4 bg-yellow-100 rounded-lg border border-yellow-200">
                                    <p className="font-medium text-yellow-700">Auction Cancelled</p>
                                    {auction.winner ? (
                                        <p className="text-sm text-yellow-600 mt-1">Winner: {auction.winner.username}</p>
                                    ) : auction.status === 'sold' ? (
                                        <p className="text-sm text-green-600 mt-1">Item Sold</p>
                                    ) : (
                                        <p className="text-sm text-yellow-600 mt-1">No winning bidder</p>
                                    )}
                                </div>
                            )}

                            {countdown.status === 'draft' && (
                                <div className="text-center py-4 bg-yellow-100 rounded-lg border border-yellow-200">
                                    <p className="font-medium text-yellow-700">Auction Pending</p>
                                    {auction.winner ? (
                                        <p className="text-sm text-yellow-600 mt-1">Winner: {auction.winner.username}</p>
                                    ) : auction.status === 'sold' ? (
                                        <p className="text-sm text-green-600 mt-1">Item Sold</p>
                                    ) : (
                                        <p className="text-sm text-yellow-600 mt-1">Needs Admin Approval</p>
                                    )}
                                </div>
                            )}

                            {countdown.status === 'loading' && (
                                <div className="text-center py-4 bg-gray-100 rounded-lg">
                                    <p className="font-medium text-gray-600">Loading auction status...</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Watchlist Count */}
                    {auction.watchlistCount > 0 && (
                        <p className="text-center bg-white p-3 text-secondary text-sm flex items-center justify-center gap-2 border border-gray-200 rounded-lg">
                            <Users className="w-4 h-4" />
                            <span>{auction.watchlistCount} user{auction.watchlistCount !== 1 ? 's' : ''} watching</span>
                        </p>
                    )}

                    {/* <p className="text-center bg-white p-3 text-secondary text-sm flex items-center justify-center gap-2 border border-gray-200 rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{auction.views} views</span>
                    </p> */}

                    {/* Pending Offers Count */}
                    {auction.offers && auction.offers.filter(o => o.status === 'pending').length > 0 && (
                        <p className="text-center bg-white p-3 text-secondary text-sm flex items-center justify-center gap-2 border border-gray-200 rounded-lg">
                            <Banknote className="w-4 h-4" />
                            <span>{auction.offers.filter(o => o.status === 'pending').length} pending offer{auction.offers.filter(o => o.status === 'pending').length !== 1 ? 's' : ''}</span>
                        </p>
                    )}
                </div>
            </section>

            <PilotPhaseModal
                isOpen={isPilotModalOpen}
                onClose={handlePilotModalClose}
            />
        </Container>
    );
}

export default SingleAuction;