import React from 'react';
import { AlertCircle, ShieldAlert, Mail, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Link } from 'react-router-dom';

const AccountInactiveBanner = () => {
    const { user } = useAuth();
    const [fetchedUser, setFetchedUser] = useState(null);

    const fetchUser = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/users/profile');
            if (data.success) {
                setFetchedUser(data.data.user);
            } else {
                setError('Failed to fetch profile data');
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchUser();
    }, [user])

    // Only show if user is a bidder and account is inactive
    if (!fetchedUser || fetchedUser.userType !== 'bidder' || fetchedUser.isActive !== false) {
        return null;
    }

    return (
        <div className="bg-[#E8B86B]/10 border-l-4 border-[#D19F3E] p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <ShieldAlert className="h-6 w-6 text-[#D19F3E]" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-semibold text-[#E8B86B]">
                        Account Pending Approval
                    </h3>
                    <div className="mt-2 text-sm text-[#E8B86B]">
                        <div className="flex flex-col gap-2">
                            <p className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Your account is currently inactive and requires admin approval.</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>You can browse auctions but cannot place bids until your account is approved.</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>You will receive an email notification once your account is activated.</span>
                            </p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <Link
                        to={`/contact`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-[#E8B86B] bg-[#D19F3E]/15 hover:bg-[#D19F3E]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D19F3E]/40"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountInactiveBanner;