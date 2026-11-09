// Admin: change a user's username and/or email address.
// The server checks the email can receive mail and isn't used by another
// account; if the domain looks wrong the admin can still "Save anyway".
import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

function EditUserIdentityModal({ user, onClose, onSaved, initialEmail }) {
    const [username, setUsername] = useState(user.username || "");
    const [email, setEmail] = useState(initialEmail || user.email || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null); // { message, suggestion, canForce }

    const save = async (force = false) => {
        setSaving(true);
        setError(null);
        try {
            const body = {};
            if (username.trim().toLowerCase() !== (user.username || "")) body.username = username;
            if (email.trim().toLowerCase() !== (user.email || "")) body.email = email;
            if (Object.keys(body).length === 0) {
                onClose();
                return;
            }
            if (force) body.force = true;
            const { data } = await axiosInstance.patch(`/api/v1/admin/users/${user._id}/identity`, body);
            if (data.success) {
                toast.success("User updated");
                onSaved(data.data.user);
                onClose();
            }
        } catch (err) {
            const d = err?.response?.data || {};
            setError({ message: d.message || "Couldn't update the user", suggestion: d.suggestion, canForce: d.canForce });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Edit username &amp; email</h3>
                        <p className="text-sm text-gray-600">
                            {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || user.companyName}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <label htmlFor="editUsername" className="mb-1 block text-sm font-medium text-gray-800">Username</label>
                <input
                    id="editUsername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-4 w-full rounded-lg border border-gray-300 p-2.5"
                />

                <label htmlFor="editEmail" className="mb-1 block text-sm font-medium text-gray-800">Email</label>
                <input
                    id="editEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                />
                <p className="mt-1 text-xs text-gray-500">Changing the email clears any "bounced" mark.</p>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                        <p>{error.message}</p>
                        {error.suggestion && (
                            <button
                                type="button"
                                onClick={() => setEmail(error.suggestion)}
                                className="mt-1 font-semibold underline"
                            >
                                Use {error.suggestion}
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-2">
                    <button
                        disabled={saving}
                        onClick={() => save(false)}
                        className="rounded-lg bg-[#072342] px-4 py-2.5 font-semibold text-white hover:bg-[#0b2d52] disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                    {error?.canForce && (
                        <button
                            disabled={saving}
                            onClick={() => save(true)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Save anyway (I know this address is right)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditUserIdentityModal;
