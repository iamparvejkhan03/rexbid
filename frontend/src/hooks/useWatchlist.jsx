import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

export const useWatchlist = (auctionId, auction = null) => {
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Check initial watchlist status
    useEffect(() => {
        const checkWatchlistStatus = async () => {
            if (!auctionId) return;

            const accessToken = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');
            const parsedUser = JSON.parse(user);

            if (!accessToken || parsedUser.userType !== 'bidder') {
                setIsWatchlisted(false);
                setLoading(false);
                return;
            }

            try {
                const { data } = await axiosInstance.get(`/api/v1/watchlist/status/${auctionId}`);
                if (data.success) {
                    setIsWatchlisted(data.data.isWatchlisted);
                    setWatchlistCount(data.data.watchlistCount);
                }
            } catch (error) {
                console.error('Error checking watchlist status:', error);
            }
        };

        checkWatchlistStatus();
    }, [auctionId]);

    const toggleWatchlist = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const { data } = await axiosInstance.post(`/api/v1/watchlist/toggle/${auctionId}`);

            if (data.success) {
                setIsWatchlisted(data.data.isWatchlisted);
                setWatchlistCount(data.data.watchlistCount);

                // add_to_wishlist — only on ADD, not remove
                if (data.data.isWatchlisted && auction?._id) {
                    const itemPrice = Number(
                        auction.convertedCurrentPrice ||
                        auction.convertedBuyNowPrice ||
                        auction.convertedStartPrice ||
                        0
                    );

                    gtag('event', 'add_to_wishlist', {
                        currency: auction.baseCurrency || 'USD',
                        value: itemPrice,
                        items: [{
                            item_id: auction._id,
                            item_name: auction.title,
                            item_category: auction.categories?.[0] || '',
                            item_category2: auction.categories?.[1] || '',
                            price: itemPrice,
                            quantity: 1
                        }]
                    });
                }

                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update watchlist');
            console.error('Toggle watchlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        isWatchlisted,
        watchlistCount,
        loading,
        toggleWatchlist
    };
};