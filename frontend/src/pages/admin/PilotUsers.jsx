import { useEffect, useState } from "react";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import { Search, Mail, Phone, Calendar, User, Trash2, Users, MoreVertical, Eye } from "lucide-react";
import { dummyUserImg } from "../../assets";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

function PilotUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [stats, setStats] = useState({
        total: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false
    });

    const fetchPilotUsers = async (page = 1, search = searchTerm) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/v1/pilot-users`, {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined
                }
            });

            if (data.success) {
                setUsers(data.data.users);
                setStats(data.data.stats);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Fetch pilot users error:', err);
            toast.error("Failed to load pilot users");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to delete the pilot user with email ${userEmail}? This action cannot be undone.`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/pilot-users/${userId}`);
            if (data.success) {
                toast.success(data.message);
                fetchPilotUsers(); // Refresh the list
            }
        } catch (err) {
            console.error('Delete pilot user error:', err);
            toast.error(err.response?.data?.message || "Failed to delete pilot user");
        }
    };

    const openUserModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeUserModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        fetchPilotUsers();
    }, []);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchPilotUsers(1, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest('.relative')) {
                setActiveDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    {/* Header Section */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">Pilot Users</h2>
                                {/* <p className="text-gray-600">Manage pilot users who have signed up.</p> */}
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination.totalUsers} users found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-500">Total Pilot Users</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">{pagination.totalUsers}</div>
                            <div className="text-sm text-gray-500">Active Signups</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">
                                {users.length > 0 ? Math.ceil(users.length / 2) : 0}
                            </div>
                            <div className="text-sm text-gray-500">Total Contacts</div>
                        </div>
                    </div> */}

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search pilot users by email or phone number..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">All Pilot Users</h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signup Date</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                            <User size={20} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div
                                                                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                                                onClick={() => openUserModal(user)}
                                                            >
                                                                {user.email}
                                                            </div>
                                                            <div className="text-sm text-gray-500">Pilot User</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                    <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(user.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openUserModal(user)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={20} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.email)}
                                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {users.length === 0 && (
                                    <div className="text-center py-12">
                                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No pilot users found</p>
                                        {searchTerm && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                }}
                                                className="text-blue-600 hover:text-blue-800 mt-2"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            Showing page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchPilotUsers(pagination.currentPage - 1)}
                                                disabled={!pagination.hasPrev}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => fetchPilotUsers(pagination.currentPage + 1)}
                                                disabled={!pagination.hasNext}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Detail Modal */}
                    {isModalOpen && selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Pilot User Details</h3>
                                    <button
                                        onClick={closeUserModal}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Header Section */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
                                            <User size={40} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">Pilot User</h4>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Pilot
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{selectedUser.email}</p>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Contact Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Mail size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Email</div>
                                                        <div className="font-medium">{selectedUser.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Phone Number</div>
                                                        <div className="font-medium">{selectedUser.phoneNumber}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Signup Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className="text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Signup Date</div>
                                                        <div className="font-medium">{formatDate(selectedUser.createdAt)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                handleDeleteUser(selectedUser._id, selectedUser.email);
                                                closeUserModal();
                                            }}
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Delete User
                                        </button>
                                        <button
                                            onClick={closeUserModal}
                                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default PilotUsers;