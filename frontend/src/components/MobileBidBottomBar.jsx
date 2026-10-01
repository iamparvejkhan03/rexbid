import { Gavel } from 'lucide-react';

const MobileBidBottomBar = ({
    auction,
    onBidClick,
    userCurrency = 'EUR',
    countdown
}) => {
    if (!auction) return null;

    // Format currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: userCurrency || 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Format time remaining (e.g., "03d 02h 13m left")
    const formatTimeLeft = () => {
        if (!countdown || countdown.status !== 'counting-down') return 'Ended';

        const { days, hours, minutes } = countdown;

        if (days > 0) {
            return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m left`;
        }
        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m left`;
        }
        return `${String(minutes).padStart(2, '0')}m left`;
    };

    // Determine current price to display
    const displayPrice = auction.auctionType === 'buy_now'
        ? (auction.convertedBuyNowPrice || auction.convertedCurrentPrice)
        : (auction.convertedCurrentPrice || auction.convertedStartPrice);

    // Get first image for thumbnail
    const thumbnail = auction.photos?.[0]?.url || auction.photos?.[0] || 'https://via.placeholder.com/150';

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0B1D33] text-white p-3 flex items-center justify-between z-50 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] mb-20">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Thumbnail */}
                <img
                    src={thumbnail}
                    alt={auction.title}
                    className="w-12 h-12 rounded object-cover flex-shrink-0 border border-gray-700"
                />

                {/* Price & Time */}
                <div className="flex flex-col min-w-0">
                    <p className="text-lg font-bold truncate">
                        {formatCurrency(displayPrice)}
                    </p>
                    <p className="text-xs text-gray-300">
                        {formatTimeLeft()}
                    </p>
                </div>
            </div>

            {/* Place Bid Button */}
            <button
                onClick={onBidClick}
                className="bg-[#D19F3E] hover:bg-[#b88a32] text-white font-semibold py-2.5 px-4 rounded flex items-center gap-2 transition-colors flex-shrink-0"
            >
                <Gavel size={18} />
                <span>Place Bid</span>
            </button>
        </div>
    );
};

export default MobileBidBottomBar;