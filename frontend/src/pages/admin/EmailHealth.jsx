// Admin → Email problems. Lists users whose email address is mistyped,
// can't receive mail, or has bounced, with one-click fixes. Fixing or
// deactivating these stops the site emailing dead addresses, which hurts
// how Gmail treats all rexbid.ie email.
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Edit, Loader2, RefreshCw, UserX, UserCheck, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import EditUserIdentityModal from "../../components/admin/EditUserIdentityModal";
import axiosInstance from "../../utils/axiosInstance";

const PROBLEM = {
    invalid: { label: "Not an email address", tone: "bg-red-100 text-red-800" },
    no_mail_server: { label: "Domain can't receive email", tone: "bg-red-100 text-red-800" },
    typo: { label: "Looks mistyped", tone: "bg-amber-100 text-amber-800" },
    bounced: { label: "Bounced", tone: "bg-orange-100 text-orange-800" },
};

function EmailHealth() {
    const [issues, setIssues] = useState([]);
    const [checked, setChecked] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // { user, initialEmail }
    const [busyId, setBusyId] = useState(null);
    const [bouncedText, setBouncedText] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/api/v1/admin/email-health");
            if (data.success) {
                setIssues(data.data.issues);
                setChecked(data.data.checked);
            }
        } catch {
            toast.error("Couldn't load email problems");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const applyFix = async (issue) => {
        setBusyId(issue._id);
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/users/${issue._id}/identity`, { email: issue.suggestion });
            if (data.success) {
                toast.success(`Changed to ${issue.suggestion}`);
                load();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Couldn't change the email");
        } finally {
            setBusyId(null);
        }
    };

    const setActive = async (issue, isActive) => {
        setBusyId(issue._id);
        try {
            await axiosInstance.patch(`/api/v1/admin/users/${issue._id}/status`, { isActive });
            toast.success(isActive ? "Account reactivated" : "Account deactivated");
            load();
        } catch {
            toast.error("Couldn't update the account");
        } finally {
            setBusyId(null);
        }
    };

    const markBounced = async () => {
        const emails = bouncedText.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
        if (emails.length === 0) return;
        try {
            const { data } = await axiosInstance.post("/api/v1/admin/email-health/bounced", { emails });
            toast.success(`${data.data.updated} account(s) marked as bounced (${data.data.given} addresses checked)`);
            setBouncedText("");
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Couldn't mark as bounced");
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            {editing && (
                <EditUserIdentityModal
                    user={editing.user}
                    initialEmail={editing.initialEmail}
                    onClose={() => setEditing(null)}
                    onSaved={() => load()}
                />
            )}
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="pt-16 md:py-7">
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Email problems</h1>
                                <p className="mt-2 max-w-2xl text-gray-600">
                                    Accounts whose email is mistyped, can't receive mail, or has bounced. Fix the address,
                                    or deactivate fake accounts. The site doesn't email deactivated or bounced accounts.
                                </p>
                            </div>
                            <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
                                <RefreshCw size={16} /> Check again
                            </button>
                        </div>

                        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                            <label htmlFor="bounced" className="mb-1 block font-semibold text-gray-900">Mark bounced addresses</label>
                            <p className="mb-2 text-sm text-gray-600">
                                Paste addresses from "Delivery Status Notification (Failure)" emails, one per line.
                            </p>
                            <textarea
                                id="bounced"
                                rows={3}
                                value={bouncedText}
                                onChange={(e) => setBouncedText(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                placeholder="someone@gmail.com"
                            />
                            <button onClick={markBounced} className="mt-2 rounded-lg bg-[#072342] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b2d52]">
                                Mark as bounced
                            </button>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white">
                            {loading ? (
                                <div className="flex items-center gap-2 p-6 text-gray-500">
                                    <Loader2 size={18} className="animate-spin" /> Checking email addresses (can take a minute)...
                                </div>
                            ) : issues.length === 0 ? (
                                <div className="flex items-center gap-2 p-6 text-green-700">
                                    <CheckCircle size={18} /> No problems found in {checked} accounts.
                                </div>
                            ) : (
                                <>
                                    <p className="flex items-center gap-2 border-b border-gray-100 p-4 text-sm text-gray-700">
                                        <AlertTriangle size={16} className="text-amber-500" />
                                        {issues.length} of {checked} accounts need attention
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-3">User</th>
                                                    <th className="p-3">Email</th>
                                                    <th className="p-3">Problem</th>
                                                    <th className="p-3">Status</th>
                                                    <th className="p-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {issues.map((i) => (
                                                    <tr key={i._id} className="border-t border-gray-100 align-top">
                                                        <td className="p-3">
                                                            <p className="font-medium text-gray-900">{i.name || "-"}</p>
                                                            <p className="text-xs text-gray-500">@{i.username || "-"} · {i.userType}</p>
                                                        </td>
                                                        <td className="p-3 break-all">
                                                            {i.email}
                                                            {i.suggestion && (
                                                                <p className="mt-1 text-xs text-gray-600">Did they mean <strong>{i.suggestion}</strong>?</p>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${PROBLEM[i.problem]?.tone}`}>
                                                                {PROBLEM[i.problem]?.label}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">{i.isActive ? "Active" : "Deactivated"}</td>
                                                        <td className="p-3">
                                                            <div className="flex flex-wrap justify-end gap-2">
                                                                {i.suggestion && (
                                                                    <button
                                                                        disabled={busyId === i._id}
                                                                        onClick={() => applyFix(i)}
                                                                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                                    >
                                                                        <Wand2 size={14} /> Fix
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setEditing({ user: { ...i, firstName: i.name }, initialEmail: i.email })}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                                                                >
                                                                    <Edit size={14} /> Edit
                                                                </button>
                                                                {i.isActive ? (
                                                                    <button
                                                                        disabled={busyId === i._id}
                                                                        onClick={() => window.confirm(`Deactivate ${i.name || i.email}? They won't be able to log in or get emails.`) && setActive(i, false)}
                                                                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                                                                    >
                                                                        <UserX size={14} /> Deactivate
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        disabled={busyId === i._id}
                                                                        onClick={() => setActive(i, true)}
                                                                        className="inline-flex items-center gap-1 rounded-lg border border-green-300 px-3 py-1.5 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
                                                                    >
                                                                        <UserCheck size={14} /> Reactivate
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
}

export default EmailHealth;
