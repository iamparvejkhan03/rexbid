import { useState, useEffect } from "react";
import {
    AdminContainer,
    AdminHeader,
    AdminSidebar,
    LoadingSpinner,
} from "../../components";
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Send,
    Calendar,
    X,
    AlertCircle,
    Clock,
    Users,
    FileText,
    Tag,
    CheckCircle,
    XCircle,
    Mail,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import EmailCampaignFormModal from "../../components/admin/EmailCampaignFormModal";

const GROUP_LABELS = {
    all_sellers: "All Sellers",
    all_companies: "All Companies",
    sellers_and_companies: "Sellers & Companies",
    all_bidders: "All Bidders",
    all_users: "All Users",
};

const summarizeRecipients = (recipients) => {
    const groups = recipients?.groups || [];
    const userIds = recipients?.specificUserIds || [];
    const parts = [];
    groups.forEach((g) => {
        if (GROUP_LABELS[g]) parts.push(GROUP_LABELS[g]);
    });
    if (userIds.length > 0) {
        parts.push(`${userIds.length} specific user${userIds.length > 1 ? "s" : ""}`);
    }
    return parts.length ? parts.join(", ") : "None";
};

function EmailCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [sendConfirm, setSendConfirm] = useState(null);
    const [cancelConfirm, setCancelConfirm] = useState(null);
    const [detailsCampaign, setDetailsCampaign] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const params = { limit: 100 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const { data } = await axiosInstance.get("/api/v1/admin/email/campaigns", {
                params,
            });
            if (data.success) setCampaigns(data.data.campaigns);
        } catch (error) {
            toast.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);

    const fetchCampaignDetails = async (campaignId) => {
        setDetailsLoading(true);
        setShowDetailsModal(true);
        setDetailsCampaign(null);
        try {
            const { data } = await axiosInstance.get(
                `/api/v1/admin/email/campaigns/${campaignId}`
            );
            if (data.success) {
                setDetailsCampaign({
                    ...data.data.campaign,
                    sample: data.data.stats?.sample || [],
                    totalRecipients: data.data.stats?.totalRecipients || 0,
                });
            }
        } catch (error) {
            toast.error("Failed to load campaign details");
            setShowDetailsModal(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await axiosInstance.delete(
                `/api/v1/admin/email/campaigns/${deleteConfirm._id}`
            );
            toast.success("Campaign deleted");
            setDeleteConfirm(null);
            fetchCampaigns();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete");
        }
    };

    const handleSendNow = async () => {
        if (!sendConfirm) return;
        try {
            await axiosInstance.post(
                `/api/v1/admin/email/campaigns/${sendConfirm._id}/send`
            );
            toast.success("Campaign sending started");
            setSendConfirm(null);
            fetchCampaigns();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to start campaign"
            );
        }
    };

    const handleCancelScheduled = async () => {
        if (!cancelConfirm) return;
        try {
            await axiosInstance.post(
                `/api/v1/admin/email/campaigns/${cancelConfirm._id}/cancel`
            );
            toast.success("Campaign cancelled");
            setCancelConfirm(null);
            fetchCampaigns();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel");
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            draft: "bg-gray-100 text-gray-800",
            scheduled: "bg-blue-100 text-blue-800",
            sending: "bg-yellow-100 text-yellow-800",
            sent: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
            cancelled: "bg-gray-300 text-gray-700",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100"
                    }`}
            >
                {status}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString();
    };

    const canEdit = (status) => ["draft", "scheduled"].includes(status);
    const canSendNow = (status) => status === "draft";
    const canCancel = (status) => status === "scheduled";
    const canDelete = (status) => status !== "sending";

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">
                                    Email Campaigns
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingCampaign(null);
                                    setShowModal(true);
                                }}
                                className="mt-4 md:mt-0 flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-3 rounded-lg transition-colors"
                            >
                                <Plus size={20} /> New Campaign
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1 relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search campaigns by title..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div>
                                <select
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="sending">Sending</option>
                                    <option value="sent">Sent</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Campaigns Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Subject
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Recipients
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Schedule
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Stats
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign._id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6 font-medium max-w-xs truncate">
                                                {campaign.title}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                                                {summarizeRecipients(campaign.recipients)}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(campaign.status)}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                {campaign.scheduleDate
                                                    ? new Date(campaign.scheduleDate).toLocaleString()
                                                    : "Immediate"}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className="text-green-600">
                                                    {campaign.stats.sent}
                                                </span>{" "}
                                                /{" "}
                                                <span className="text-gray-600">
                                                    {campaign.stats.total}
                                                </span>
                                                {campaign.stats.failed > 0 && (
                                                    <span className="text-red-600 ml-1">
                                                        ({campaign.stats.failed} failed)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => fetchCampaignDetails(campaign._id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {canEdit(campaign.status) && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingCampaign(campaign);
                                                                setShowModal(true);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {canSendNow(campaign.status) && (
                                                        <button
                                                            onClick={() => setSendConfirm(campaign)}
                                                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                                                            title="Send Now"
                                                        >
                                                            <Send size={16} />
                                                        </button>
                                                    )}
                                                    {canCancel(campaign.status) && (
                                                        <button
                                                            onClick={() => setCancelConfirm(campaign)}
                                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                            title="Cancel Schedule"
                                                        >
                                                            <Clock size={16} />
                                                        </button>
                                                    )}
                                                    {canDelete(campaign.status) && (
                                                        <button
                                                            onClick={() => setDeleteConfirm(campaign)}
                                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {campaigns.length === 0 && !loading && (
                                <div className="text-center py-12 text-gray-500">
                                    No campaigns found
                                </div>
                            )}
                            {loading && (
                                <div className="flex justify-center py-12">
                                    <LoadingSpinner />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Campaign Form Modal */}
                    <EmailCampaignFormModal
                        isOpen={showModal}
                        onClose={() => {
                            setShowModal(false);
                            setEditingCampaign(null);
                        }}
                        onSuccess={fetchCampaigns}
                        campaign={editingCampaign}
                    />

                    {/* Delete Confirmation */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                    <h3 className="text-lg font-semibold">Delete Campaign</h3>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete{" "}
                                    <strong>"{deleteConfirm.title}"</strong>? This action cannot be
                                    undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Send Now Confirmation */}
                    {sendConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <Send className="h-6 w-6 text-green-600" />
                                    <h3 className="text-lg font-semibold">Send Campaign Now</h3>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Send <strong>"{sendConfirm.title}"</strong> immediately to all
                                    resolved recipients?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSendConfirm(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendNow}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Send Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancel Scheduled Confirmation */}
                    {cancelConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="h-6 w-6 text-red-600" />
                                    <h3 className="text-lg font-semibold">Cancel Schedule</h3>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Cancel the scheduled send for{" "}
                                    <strong>"{cancelConfirm.title}"</strong>?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCancelConfirm(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Keep
                                    </button>
                                    <button
                                        onClick={handleCancelScheduled}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                                    >
                                        Cancel Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== CAMPAIGN DETAILS MODAL ========== */}
                    {showDetailsModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                    <h3 className="text-xl font-semibold">Campaign Details</h3>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {detailsLoading || !detailsCampaign ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    <div className="p-6 space-y-6">
                                        {/* Subject & Status */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-2xl font-bold text-gray-900">
                                                    {detailsCampaign.title}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Created {formatDate(detailsCampaign.createdAt)}
                                                </p>
                                            </div>
                                            <div>{getStatusBadge(detailsCampaign.status)}</div>
                                        </div>

                                        {/* Email Body Preview */}
                                        <div>
                                            <h5 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <FileText size={18} /> Email Body
                                            </h5>
                                            <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto prose prose-sm max-w-none">
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: detailsCampaign.body,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Schedule & Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h5 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                    <Calendar size={18} /> Schedule
                                                </h5>
                                                <p>
                                                    {detailsCampaign.scheduleDate
                                                        ? new Date(
                                                            detailsCampaign.scheduleDate
                                                        ).toLocaleString()
                                                        : "Immediate (sent manually)"}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Sent at:{" "}
                                                    {detailsCampaign.sentAt
                                                        ? new Date(detailsCampaign.sentAt).toLocaleString()
                                                        : "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                    <Users size={18} /> Statistics
                                                </h5>
                                                <div className="flex gap-4 text-sm flex-wrap">
                                                    <div>
                                                        <span className="text-gray-500">Total:</span>
                                                        <span className="ml-1 font-semibold">
                                                            {detailsCampaign.stats.total}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Sent:</span>
                                                        <span className="ml-1 text-green-600 font-semibold flex-inline items-center gap-1">
                                                            <CheckCircle size={12} className="inline" />{" "}
                                                            {detailsCampaign.stats.sent}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Failed:</span>
                                                        <span className="ml-1 text-red-600 font-semibold flex-inline items-center gap-1">
                                                            <XCircle size={12} className="inline" />{" "}
                                                            {detailsCampaign.stats.failed}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recipients */}
                                        <div>
                                            <h5 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                <Tag size={18} /> Recipients
                                            </h5>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                {(detailsCampaign.recipients?.groups || []).length >
                                                    0 && (
                                                        <div>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                Groups:
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {detailsCampaign.recipients.groups.map((g) => (
                                                                    <span
                                                                        key={g}
                                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                                                    >
                                                                        {GROUP_LABELS[g] || g}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                {(detailsCampaign.recipients?.specificUserIds || [])
                                                    .length > 0 && (
                                                        <div>
                                                            <p className="text-sm text-gray-600">
                                                                <strong>Specific Users:</strong>{" "}
                                                                {detailsCampaign.recipients.specificUserIds.length}{" "}
                                                                user
                                                                {detailsCampaign.recipients.specificUserIds
                                                                    .length > 1
                                                                    ? "s"
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    )}
                                                <p className="text-sm pt-2 border-t border-gray-200">
                                                    <strong>Resolved recipients:</strong>{" "}
                                                    {detailsCampaign.totalRecipients} (excludes
                                                    unsubscribed users, admins, cashiers, staff)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sample Recipients */}
                                        {detailsCampaign.sample &&
                                            detailsCampaign.sample.length > 0 && (
                                                <div>
                                                    <h5 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                        <Users size={18} /> Sample Recipients (first 5)
                                                    </h5>
                                                    <div className="overflow-x-auto border rounded-lg">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                        Name
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                        Username
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                        Email
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {detailsCampaign.sample.map((user, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="px-4 py-2 text-sm">
                                                                            {user.firstName} {user.lastName}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                                            {user.username || "-"}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                                            {user.email}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        {detailsCampaign.totalRecipients > 5 && (
                                                            <p className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t">
                                                                + {detailsCampaign.totalRecipients - 5} more
                                                                recipients
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {detailsCampaign.status === "draft" && (
                                            <div className="text-sm text-gray-500 italic">
                                                Recipients will be resolved when the campaign is sent.
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => setShowDetailsModal(false)}
                                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default EmailCampaigns;