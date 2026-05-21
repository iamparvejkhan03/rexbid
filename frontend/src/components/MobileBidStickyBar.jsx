import { Gavel, Zap, PoundSterling, Clock, Gift, Users, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

const MobileBidStickyBar = ({
  currentBid,
  timeRemaining,
  onBidClick,
  buyNowPrice,
  onBuyNowClick,
  onMakeOfferClick,
  allowOffers,
  auctionType,
  status,
  auction // Pass the full auction object to get more details
}) => {
  const { days, hours, minutes, seconds, status: timeStatus } = timeRemaining;
  const isActive = timeStatus === 'counting-down' || timeStatus === 'always-available';

  // State for live timer
  const [liveTimer, setLiveTimer] = useState({
    days: days || 0,
    hours: hours || 0,
    minutes: minutes || 0,
    seconds: seconds || 0
  });

  // Update live timer every second
  useEffect(() => {
    if (!isActive || timeStatus !== 'counting-down') return;

    const interval = setInterval(() => {
      setLiveTimer(prev => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeStatus]);

  // Sync with props when they change
  useEffect(() => {
    if (isActive && timeStatus === 'counting-down') {
      setLiveTimer({
        days: days || 0,
        hours: hours || 0,
        minutes: minutes || 0,
        seconds: seconds || 0
      });
    }
  }, [days, hours, minutes, seconds, isActive, timeStatus]);

  // Determine if buttons should be shown
  const showBuyNow = auctionType === 'buy_now' && buyNowPrice && isActive && !auction?.winner && auction?.status === 'active';
  const showMakeOffer = allowOffers && isActive && !auction?.winner && auction?.status === 'active';
  const showBidForm = (auctionType === 'standard' || auctionType === 'reserve') && isActive && !auction?.winner && auction?.status === 'active';
  const isGiveaway = auctionType === 'giveaway';
  const showGiveawayClaim = isGiveaway && isActive && !auction?.winner && auction?.status === 'active';

  // Get status display text
  const getStatusDisplay = () => {
    if (auction?.winner) {
      return {
        text: auctionType === 'giveaway' ? 'Item Claimed' : 'Auction Ended - Sold',
        color: 'bg-green-100 text-green-800'
      };
    }

    switch (timeStatus) {
      case 'ended':
        return { text: 'Auction Ended', color: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { text: 'Starting Soon', color: 'bg-blue-100 text-blue-800' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
      case 'draft':
        return { text: 'Pending Approval', color: 'bg-orange-100 text-orange-800' };
      case 'always-available':
        return { text: isGiveaway ? 'Free Giveaway' : 'Available Now', color: 'bg-green-100 text-green-800' };
      default:
        return { text: timeStatus, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="lg:hidden bg-white border border-gray-200 rounded-lg shadow-sm mb-6 sticky top-16 z-40">
      <div className="p-4">
        {/* Top Row: Current Bid/Price and Timer */}
        <div className="flex w-full justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500 font-light">
              {isGiveaway ? 'FREE GIVEAWAY' :
                auctionType === 'buy_now' ? 'BUY NOW PRICE' :
                  auction?.bidCount > 0 ? 'CURRENT BID' : 'STARTING BID'}
            </p>
            <p className="text-lg font-semibold">
              {isGiveaway ? (
                <span className="flex items-center gap-1 text-green-600">FREE 🎁</span>
              ) : (
                `${currentBid?.toLocaleString() || 0} kr`
              )}
            </p>
          </div>

          {/* Timer - Show for counting-down auctions */}
          {timeStatus === 'counting-down' && (
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-500" />
              <div className="flex items-center space-x-1 text-sm font-medium">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{liveTimer.days}d</span>
                <span className="text-gray-400">:</span>
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{liveTimer.hours}h</span>
                <span className="text-gray-400">:</span>
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{liveTimer.minutes}m</span>
                <span className="text-gray-400">:</span>
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{liveTimer.seconds}s</span>
              </div>
            </div>
          )}

          {/* Show "Always Available" badge for buy_now/giveaway */}
          {timeStatus === 'always-available' && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Available Now
            </span>
          )}
        </div>

        {/* Reserve Status - Only for reserve auctions */}
        {auctionType === 'reserve' && auction && (
          <div className="mb-3 text-sm">
            <span className={`${auction.currentPrice >= auction.reservePrice ? 'text-green-600' : 'text-orange-600'}`}>
              {auction.currentPrice >= auction.reservePrice ? '✓ Reserve Met' : '⚠ Reserve Not Met'}
            </span>
          </div>
        )}

        {/* Winner/Sold Info */}
        {auction?.winner && (
          <div className="mb-3 text-sm text-green-600">
            <span className="font-medium">Winner: {auction.winner.username}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          {/* Giveaway Claim Button */}
          {showGiveawayClaim && (
            <button
              onClick={onBuyNowClick}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md cursor-pointer flex items-center gap-2 text-sm font-medium w-full justify-center"
            >
              <Gift size={18} />
              <span>Claim for Free 🎁</span>
            </button>
          )}

          {/* Buy Now Button */}
          {showBuyNow && (
            <button
              onClick={onBuyNowClick}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md cursor-pointer flex items-center gap-2 text-sm font-medium w-full justify-center"
            >
              <Zap size={18} />
              <span>Buy Now {buyNowPrice?.toLocaleString()} kr</span>
            </button>
          )}

          {/* Make Offer Button */}
          {showMakeOffer && (
            <button
              onClick={onMakeOfferClick}
              className="bg-[#edcd1f] hover:bg-[#edcd1f]/90 text-black py-3 px-4 rounded-md cursor-pointer flex items-center gap-2 text-sm font-medium w-full justify-center"
            >
              <PoundSterling size={18} />
              <span>Make Offer</span>
            </button>
          )}

          {/* Place Bid Button */}
          {showBidForm && !showBuyNow && !showMakeOffer && (
            <button
              onClick={onBidClick}
              className="bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md cursor-pointer flex items-center gap-2 text-sm font-medium w-full justify-center"
            >
              <Gavel size={18} />
              <span>Place Bid</span>
            </button>
          )}

          {/* View Only Button (for non-active) */}
          {!isActive && !auction?.winner && (
            <button
              onClick={onBidClick}
              className="bg-gray-400 hover:bg-gray-500 text-white py-3 px-4 rounded-md cursor-pointer flex items-center justify-center text-sm font-medium w-full"
            >
              <span>View Auction Details</span>
            </button>
          )}
        </div>

        {/* Status Badge */}
        {!isActive && !auction?.winner && (
          <div className="mt-3 text-center">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </div>
        )}

        {/* Stats Row */}
        {(auction?.watchlistCount > 0 || auction?.views > 0) && (
          <div className="mt-3 flex justify-center gap-4 text-xs text-gray-500 border-t pt-3">
            {auction?.watchlistCount > 0 && (
              <span className="flex items-center gap-1">
                <Users size={14} />
                {auction.watchlistCount} watching
              </span>
            )}
            {auction?.views > 0 && (
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} />
                {auction.views} views
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBidStickyBar;