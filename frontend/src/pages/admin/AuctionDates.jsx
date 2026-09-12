import { useState, useEffect } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const defaultForm = { startDate: "", endDate: "", label: "", notes: "" };

// UTC ISO string  →  browser-local "YYYY-MM-DDTHH:mm" for datetime-local inputs
const toLocalInputValue = (dateLike) => {
    if (!dateLike) return "";
    const d = new Date(dateLike);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

// "YYYY-MM-DDTHH:mm" from datetime-local  →  UTC ISO string with Z
const fromLocalInputToISO = (localValue) => {
    if (!localValue) return null;
    return new Date(localValue).toISOString();
};

const AuctionDates = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // slot or null
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(
                `/api/v1/auction-dates?status=${statusFilter}`,
            );
            if (data.success) setSlots(data.data.auctionDates);
        } catch (err) {
            toast.error("Failed to load auction dates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [statusFilter]);

    const openCreate = () => {
        setEditing(null);
        setForm(defaultForm);
        setShowModal(true);
    };

    const openEdit = (slot) => {
        setEditing(slot);
        setForm({
            startDate: toLocalInputValue(slot.startDate),
            endDate: toLocalInputValue(slot.endDate),
            label: slot.label,
            notes: slot.notes || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                ...form,
                startDate: fromLocalInputToISO(form.startDate),
                endDate: fromLocalInputToISO(form.endDate),
            };

            if (editing) {
                await axiosInstance.put(`/api/v1/auction-dates/${editing._id}`, payload);
                toast.success("Auction date updated");
            } else {
                await axiosInstance.post(`/api/v1/auction-dates`, payload);
                toast.success("Auction date created");
            }
            setShowModal(false);
            fetchSlots();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (slot) => {
        try {
            await axiosInstance.patch(`/api/v1/auction-dates/${slot._id}/toggle`);
            toast.success("Updated");
            fetchSlots();
        } catch {
            toast.error("Failed to toggle");
        }
    };

    const handleDelete = async (slot) => {
        if (!window.confirm(`Delete this slot? ${slot.usageCount} auction(s) reference it.`)) return;
        try {
            await axiosInstance.delete(`/api/v1/auction-dates/${slot._id}`);
            toast.success("Deleted");
            fetchSlots();
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="pt-16 md:py-7">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">Auction Dates</h1>
                            <button
                                onClick={openCreate}
                                className="flex items-center gap-2 bg-[#1e2d3b] text-white px-4 py-2 rounded-lg"
                            >
                                <Plus size={16} /> Add Date
                            </button>
                        </div>

                        <div className="mb-4 flex gap-2">
                            {["all", "upcoming", "active", "past", "inactive"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1 rounded-full text-sm ${statusFilter === s ? "bg-black text-white" : "bg-gray-100"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <p>Loading…</p>
                        ) : slots.length === 0 ? (
                            <p className="text-gray-500">No auction dates yet.</p>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left">Label</th>
                                            <th className="p-3 text-left">Start</th>
                                            <th className="p-3 text-left">End</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {slots.map((s) => (
                                            <tr key={s._id} className="border-t">
                                                <td className="p-3">{s.label}</td>
                                                <td className="p-3">
                                                    {new Date(s.startDate).toLocaleString("en-IE")}
                                                </td>
                                                <td className="p-3">
                                                    {new Date(s.endDate).toLocaleString("en-IE")}
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${s.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-200 text-gray-700"
                                                            }`}
                                                    >
                                                        {s.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="p-3 flex gap-4">
                                                    <button onClick={() => openEdit(s)}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleToggle(s)}>
                                                        {s.isActive ? <PowerOff size={16} /> : <Power size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">
                            {editing ? "Edit Auction Date" : "Add Auction Date"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Label (optional — auto-generated if blank)
                                </label>
                                <input
                                    type="text"
                                    value={form.label}
                                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    rows="2"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-[#1e2d3b] text-white rounded disabled:opacity-50"
                                >
                                    {submitting ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AuctionDates;