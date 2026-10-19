import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

const PreferencesPanel = ({ initialPreferences, onSave, saving: externalSaving }) => {
    const [emailUpdates, setEmailUpdates] = useState(
        initialPreferences?.emailUpdates ?? true
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setEmailUpdates(initialPreferences?.emailUpdates ?? true);
    }, [initialPreferences?.emailUpdates]);

    const handleToggle = async () => {
        const next = !emailUpdates;
        const prev = emailUpdates;
        setEmailUpdates(next); // optimistic
        setSaving(true);

        try {
            const success = await onSave({ emailUpdates: next });
            if (!success) {
                setEmailUpdates(prev); // revert
                toast.error("Failed to update preference");
            } else {
                toast.success(
                    next
                        ? "Email notifications enabled"
                        : "Email notifications disabled"
                );
            }
        } catch (err) {
            setEmailUpdates(prev);
            toast.error("Failed to update preference");
        } finally {
            setSaving(false);
        }
    };

    const isDisabled = saving || externalSaving;

    return (
        <div className="space-y-6">
            <div
                className={`rounded-lg p-4 ${emailUpdates
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
            >
                <div className="flex items-start gap-3">
                    <Mail
                        size={24}
                        className={emailUpdates ? "text-green-600" : "text-gray-500"}
                    />
                    <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                            Email Notifications
                        </h4>
                        <p className="text-sm text-secondary mt-1">
                            When enabled, you'll receive email notifications about
                            new bids, outbids, watchlist activity, offers, and
                            auction reminders.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="pr-4">
                    <p className="font-medium">Enable email notifications</p>
                    <p className="text-sm text-gray-500">
                        Master switch for all notification emails
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={emailUpdates}
                    onClick={handleToggle}
                    disabled={isDisabled}
                    className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors ${emailUpdates ? "bg-orange-500" : "bg-gray-300"
                        } ${isDisabled ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${emailUpdates ? "translate-x-6" : "translate-x-1"
                            }`}
                    />
                </button>
            </div>

            {!emailUpdates && (
                <div className="rounded-lg p-4 bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Important account emails
                        (password reset, payment confirmations, invoices, payouts,
                        and security alerts) will still be sent to keep your
                        account secure.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PreferencesPanel;