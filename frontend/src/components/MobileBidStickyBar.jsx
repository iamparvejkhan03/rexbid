import { Gavel, Zap, Banknote, Clock, Gift, Users, ShieldCheck, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const MobileBidStickyBar = ({
  currentBid,
  timeRemaining,
  onBidClick,
  convertedBuyNowPrice,
  onBuyNowClick,
  onMakeOfferClick,
  allowOffers,
  auctionType,
  status,
  auction,
  userCurrency = 'EUR',
  // New props for the bottom stats row
  onSetReminder,
  isWatchlisted,
  watchlistCount,
  views
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

  // Determine if buttons should be shown
  const showBuyNow = auctionType === 'buy_now' && convertedBuyNowPrice && isActive && !auction?.winner && auction?.status === 'active';
  const showMakeOffer = allowOffers && isActive && !auction?.winner && auction?.status === 'active';
  const showBidForm = (auctionType === 'standard' || auctionType === 'reserve') && isActive && !auction?.winner && auction?.status === 'active';
  const isGiveaway = auctionType === 'giveaway';
  const showGiveawayClaim = isGiveaway && isActive && !auction?.winner && auction?.status === 'active';

  // Reserve status logic
  const isReserveMet = (auction?.convertedCurrentPrice || auction?.currentPrice || 0) >= (auction?.reservePrice || 0);

  // Format End Date
  const formatEndDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="lg:hidden bg-white border border-gray-200 rounded-lg shadow-sm mb-6 sticky top-16 z-40">
      <div className="p-4">

        {/* Top Row: Price & Timer */}
        <div className="flex justify-between items-start overflow-hidden mb-4 gap-4">
          {/* Left Side: Price & Reserve */}
          <div className="flex flex-col flex-1">
            <p className="text-xs text-black font-semibold mb-1">
              {isGiveaway ? '' : auctionType === 'buy_now' ? 'Buy Now Price' : auction.status === 'sold' ? 'Final Bid' : auction?.bidCount > 0 ? 'Current Bid' : 'Starting Bid'}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isGiveaway ? (
                <span className="text-green-600">GIVEAWAY 🎁</span>
              ) : auctionType === 'buy_now' ? (
                formatCurrency(auction?.convertedBuyNowPrice || convertedBuyNowPrice)
              ) : (
                formatCurrency(currentBid)
              )}
            </p>

            {/* Reserve Badge */}
            {auctionType === 'reserve' && auction && (
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium w-fit ${isReserveMet
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
                }`}>
                {isReserveMet ? '✓ Reserve Met' : '⚠ Reserve Applies'}
              </div>
            )}
          </div>

          {/* Right Side: Timer (with your requested status handling) */}
          <div className="flex flex-col items-start flex-shrink-0 border-l border-gray-200 pl-4">
            <div className="flex items-center gap-1 text-xs text-gray-700 font-medium mb-1">
              <Clock size={14} />
              <span>
                {timeStatus === 'counting-down' && 'Auction Ends In'}
                {timeStatus === 'always-available' && (auctionType === 'giveaway' ? 'Giveaway Open' : 'Available Now')}
                {timeStatus === 'approved' && 'Auction Starts Soon'}
                {timeStatus === 'ended' && (auction?.status === 'reserve_not_met' ? 'Reserve Not Met' : auction?.status === 'sold' ? 'Auction Sold' : 'Auction Ended')}
                {timeStatus === 'cancelled' && 'Auction Cancelled'}
                {timeStatus === 'draft' && 'Pending Approval'}
                {timeStatus === 'loading' && 'Loading Status...'}
              </span>
            </div>

            {timeStatus === 'counting-down' && (
              <>
                <div className="flex items-end gap-3 text-xl font-bold text-gray-900">
                  <span>{String(liveTimer.days).padStart(2, '0')}</span>
                  <span className="text-gray-500 text-lg">:</span>
                  <span>{String(liveTimer.hours).padStart(2, '0')}</span>
                  <span className="text-gray-500 text-lg">:</span>
                  <span>{String(liveTimer.minutes).padStart(2, '0')}</span>
                  <span className="text-gray-500 text-lg">:</span>
                  <span>{String(liveTimer.seconds).padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between w-full text-[12px] text-gray-500 mt-0.5 gap-2">
                  <span>Days</span>
                  <span>Hours</span>
                  <span>Minutes</span>
                  <span>Seconds</span>
                </div>
                {auction?.endDate && (
                  <p className="text-[12px] text-gray-500 mt-1">Ends: {formatEndDate(auction.endDate)}</p>
                )}
              </>
            )}

            {timeStatus === 'always-available' && (
              <>
                <p className="text-sm font-semibold text-green-600">
                  {auctionType === 'giveaway' ? 'Open for Entry' : 'Ready to Purchase'}
                </p>
                <p className="text-[12px] text-gray-500 mt-1">
                  {auctionType === 'giveaway' ? 'Claim this item anytime' : 'Buy instantly at any time'}
                </p>
              </>
            )}

            {timeStatus === 'approved' && (
              <>
                <p className="text-sm font-semibold text-blue-600">Starting Soon</p>
                {auction?.startDate && (
                  <p className="text-[12px] text-gray-500 mt-1">Starts: {formatEndDate(auction.startDate)}</p>
                )}
              </>
            )}

            {timeStatus === 'ended' && (
              <>
                {auction?.status === 'sold' && <p className="text-sm font-semibold text-green-600">Sold ✓</p>}
                {auction?.status === 'sold_buy_now' && <p className="text-sm font-semibold text-green-600">Sold via Buy Now ✓</p>}
                {auction?.status === 'reserve_not_met' && <p className="text-sm font-semibold text-orange-600">Reserve Not Met</p>}
                {!['sold', 'sold_buy_now', 'reserve_not_met'].includes(auction?.status) && (
                  <p className="text-sm font-semibold text-gray-600">Ended</p>
                )}
                {auction?.endDate && (
                  <p className="text-[12px] text-gray-500 mt-1">
                    {auction?.status === 'sold' || auction?.status === 'sold_buy_now'
                      ? `Sold at: ${formatEndDate(auction.endDate)}`
                      : `Ended: ${formatEndDate(auction.endDate)}`}
                  </p>
                )}
              </>
            )}

            {timeStatus === 'cancelled' && (
              <>
                <p className="text-sm font-semibold text-red-600">Cancelled</p>
                <p className="text-[12px] text-gray-500 mt-1">This auction has been cancelled</p>
              </>
            )}

            {timeStatus === 'draft' && (
              <>
                <p className="text-sm font-semibold text-orange-600">Pending Approval</p>
                <p className="text-[12px] text-gray-500 mt-1">Awaiting admin review</p>
              </>
            )}

            {timeStatus === 'loading' && (
              <p className="text-sm font-semibold text-gray-500">Loading...</p>
            )}
          </div>
        </div>

        {/* Middle Row: Action Buttons */}
        <div className="flex gap-2 w-full mt-4">
          {showBidForm && (
            <button
              onClick={onBidClick}
              className="flex-1 bg-[#D19F3E] hover:bg-[#b88a32] text-white py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Gavel size={18} />
              <span>Place Bid</span>
            </button>
          )}

          {/* {showMakeOffer && (
            <button
              onClick={onMakeOfferClick}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Banknote size={18} />
              <span>Make an Offer</span>
            </button>
          )} */}

          {showBuyNow && (
            <button
              onClick={onBuyNowClick}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Zap size={18} />
              <span>Buy Now</span>
            </button>
          )}

          {showGiveawayClaim && (
            <button
              onClick={onBuyNowClick}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Gift size={18} />
              <span>Enter Giveaway 🎁</span>
            </button>
          )}

          {/* Fallback for non-active auctions */}
          {!isActive && !auction?.winner && (
            <button
              onClick={onBidClick}
              className="flex-1 bg-gray-700 hover:bg-gray-500 text-white py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center text-sm font-medium transition-colors"
            >
              View Auction Details
            </button>
          )}
        </div>

        {/* Bottom Row: Stats & Reminder */}
        <div className="flex items-center justify-between text-[13px] font-medium text-gray-700 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {watchlistCount || auction?.watchlistCount || 0} watching
            </span>
            {/* <span className="flex items-center gap-1">
              <ShieldCheck size={14} />
              {views || auction?.views || 0} views
            </span> */}
          </div>

          {onSetReminder && (
            <button
              onClick={onSetReminder}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
            >
              <Bell size={14} fill={isWatchlisted ? 'currentColor' : 'none'} />
              {isWatchlisted ? 'Reminder Set' : 'Set a Reminder'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default MobileBidStickyBar;