import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Mail, User } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const ReminderModal = ({ isOpen, onClose, auction }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset state whenever the modal is reopened
    useEffect(() => {
        if (isOpen) {
            setName('');
            setEmail('');
            setSuccess(false);
            setSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setSubmitting(true);
            const { data } = await axiosInstance.post('/api/v1/reminders', {
                name: name.trim(),
                email: email.trim(),
                auctionId: auction._id,
            });

            if (data.success) {
                setSuccess(true);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Failed to set reminder'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div className="text-center py-6">
                        <CheckCircle
                            className="mx-auto text-green-500 mb-3"
                            size={48}
                        />
                        <h3 className="text-xl font-semibold mb-2">
                            Reminder Set
                        </h3>
                        <p className="text-gray-600 mb-1">
                            We'll email you 2 hours before this auction ends.
                        </p>
                        <p className="text-sm text-gray-400 mb-5 truncate">
                            {email}
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-1">
                            <Bell size={22} className="text-primary" />
                            <h3 className="text-xl font-semibold">
                                Set a Reminder
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">
                            We'll send you an email 2 hours before{' '}
                            <span className="font-medium text-gray-700">
                                {auction.title}
                            </span>{' '}
                            ends. No account needed.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="reminder-name"
                                    className="block text-sm font-medium text-secondary mb-1"
                                >
                                    Your Name
                                </label>
                                <div className="relative">
                                    <User
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        id="reminder-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        placeholder="e.g., John Smith"
                                        maxLength={100}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="reminder-email"
                                    className="block text-sm font-medium text-secondary mb-1"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        id="reminder-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    'Setting reminder...'
                                ) : (
                                    <>
                                        <Bell size={18} />
                                        Set Reminder
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                We'll only use this to send one reminder for
                                this auction. Unsubscribe link included.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReminderModal;