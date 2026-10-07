import { Gavel, Zap, Banknote, Clock, Gift, Users, ShieldCheck, Bell, Loader, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MobileBidStickyBar = ({
  currentBid,
  timeRemaining,
  onBidClick,          // still used for "View Auction Details" on non-active
  convertedBuyNowPrice,
  onBuyNowClick,
  onMakeOfferClick,
  allowOffers,
  auctionType,
  status,
  auction,
  userCurrency = 'EUR',
  onSetReminder,
  isWatchlisted,
  watchlistCount,
  views,
  // ✅ NEW PROPS for inline mobile bidding
  bidAmount,
  setBidAmount,
  minBidAmount,
  onPlaceBid,
  bidding,
}) => {
  const { days, hours, minutes, seconds, status: timeStatus } = timeRemaining;
  const isActive = timeStatus === 'counting-down' || timeStatus === 'always-available';

  const [liveTimer, setLiveTimer] = useState({
    days: days || 0,
    hours: hours || 0,
    minutes: minutes || 0,
    seconds: seconds || 0,
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isActive || timeStatus !== 'counting-down') return;
    const interval = setInterval(() => {
      setLiveTimer(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, timeStatus]);

  useEffect(() => {
    if (isActive && timeStatus === 'counting-down') {
      setLiveTimer({
        days: days || 0,
        hours: hours || 0,
        minutes: minutes || 0,
        seconds: seconds || 0,
      });
    }
  }, [days, hours, minutes, seconds, isActive, timeStatus]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currencySymbol = userCurrency === 'GBP' ? '£' : '€';

  const showBuyNow = auctionType === 'buy_now' && convertedBuyNowPrice && isActive && !auction?.winner && auction?.status === 'active';
  const showMakeOffer = allowOffers && isActive && !auction?.winner && auction?.status === 'active';
  const showBidForm = (auctionType === 'standard' || auctionType === 'reserve') && isActive && !auction?.winner && auction?.status === 'active';
  const isGiveaway = auctionType === 'giveaway';
  const showGiveawayClaim = isGiveaway && isActive && !auction?.winner && auction?.status === 'active';

  const isReserveMet = (auction?.convertedCurrentPrice || auction?.currentPrice || 0) >= (auction?.reservePrice || 0);

  const formatEndDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="lg:hidden bg-white border border-gray-200 rounded-lg shadow-sm mb-6 mt-8">
      <div className="p-4">

        {/* Top Row: Price & Timer */}
        <div className="flex justify-between items-start overflow-hidden mb-4 gap-4">
          <div className="flex flex-col flex-1">
            <p className="text-xs text-black font-semibold mb-1">
              {isGiveaway ? '' : auctionType === 'buy_now' ? 'Buy Now Price' : auction.status === 'sold' ? 'Final Bid' : auction?.bidCount > 0 ? 'Current Bid' : 'Starting Bid'}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {isGiveaway ? (
                <span className="text-green-600">GIVEAWAY 🎁</span>
              ) : auctionType === 'buy_now' ? (
                formatCurrency(auction?.convertedBuyNowPrice || convertedBuyNowPrice)
              ) : (
                formatCurrency(currentBid)
              )}
            </p>

            {auctionType === 'reserve' && auction && (
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium w-fit ${isReserveMet
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-orange-50 text-blue-600 border border-blue-200'
                }`}>
                {isReserveMet ? '✓ Reserve Met' : 'Reserve Applies'}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start flex-shrink-0">
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

        {/* ============ NEW: Inline Mobile Bid Input ============ */}
        {showBidForm && (
          <div className="flex flex-col gap-2 w-full mt-4">
            <div className="flex-1 min-w-0 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                {currencySymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={bidAmount || ''}
                autoFocus
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-2 focus:outline-primary text-sm"
                placeholder={`Min ${minBidAmount?.toFixed(0)}`}
                min={minBidAmount?.toFixed(0)}
              />
            </div>
            <button
              type="button"
              onClick={onPlaceBid}
              disabled={bidding}
              className="bg-[#D19F3E] hover:bg-[#b88a32] text-white py-2.5 px-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60 whitespace-nowrap transition-colors"
            >
              {bidding ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Gavel size={18} />
              )}
              <span>Place Bid</span>
            </button>
          </div>
        )}

        {onSetReminder && isActive && <button
          type="button"
          onClick={onSetReminder}
          className={`mt-2 w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-lg border transition-colors ${user && isWatchlisted
            ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
            : 'bg-white border-gray-300 text-primary hover:bg-gray-100'
            }`}
        >
          <Bell size={14} fill={user && isWatchlisted ? 'currentColor' : 'none'} />
          <span>
            {user && isWatchlisted
              ? 'Reminder Set'
              : 'Set a Reminder'}
          </span>
        </button>}

        <button
          type="button"
          onClick={() => navigate('/delivery-partner-quote')}
          className="mt-2 w-full bg-[#000] hover:bg-[#000]/90 text-white py-2.5 px-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60 whitespace-nowrap transition-colors"
        >
          <>
            <Truck size={16} />
            <span>Request Delivery Quote</span>
          </>
        </button>

        {/* Middle Row: Other Action Buttons */}
        {(showMakeOffer || showBuyNow || showGiveawayClaim || (!isActive && !auction?.winner)) && (
          <div className="flex gap-2 w-full mt-3">
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

            {/* {!isActive && !auction?.winner && (
              <button
                onClick={onBidClick}
                className="flex-1 bg-gray-700 hover:bg-gray-500 text-white py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center text-sm font-medium transition-colors"
              >
                View Auction Details
              </button>
            )} */}
          </div>
        )}

        {/* Bottom Row: Stats & Reminder */}
        {/* <div className="flex items-center justify-between text-[13px] font-medium text-gray-700 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {watchlistCount || auction?.watchlistCount || 0} watching
            </span>
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
        </div> */}

      </div>
    </div>
  );
};

export default MobileBidStickyBar;