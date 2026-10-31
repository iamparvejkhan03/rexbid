import { useEffect, useState } from "react";
import {
  AdminContainer,
  AdminHeader,
  AdminSidebar,
  LoadingSpinner,
} from "../../components";
import {
  Plus,
  Trash2,
  Calendar,
  X,
  Image as ImageIcon,
  BookMarked,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

function AllCatalogues() {
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    closingDate: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchCatalogues = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/api/v1/catalogues");
      if (data.success) setCatalogues(data.data.catalogues);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load catalogues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, []);

  const resetForm = () => {
    setForm({ title: "", closingDate: "", image: null });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.closingDate || !form.image) {
      toast.error("Please fill in all fields and upload an image");
      return;
    }
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("closingDate", form.closingDate);
      fd.append("image", form.image);

      const { data } = await axiosInstance.post(
        "/api/v1/catalogues/create",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success("Catalogue created");
        setShowModal(false);
        resetForm();
        fetchCatalogues();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create catalogue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const { data } = await axiosInstance.delete(
        `/api/v1/catalogues/delete/${id}`
      );
      if (data.success) {
        toast.success("Catalogue deleted");
        fetchCatalogues();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const isPast = (dateStr) => new Date(dateStr) < new Date();

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
                  Catalogues
                </h2>
                <p className="text-gray-600">
                  Group auctions by closing date on your homepage
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {catalogues.length} total
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-white hover:shadow-lg px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
                >
                  <Plus size={18} />
                  Create Catalogue
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold">All Catalogues</h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : catalogues.length === 0 ? (
              <div className="text-center py-16">
                <BookMarked size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">
                  No catalogues yet. Create your first one to get started.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-[#B8862A] hover:underline font-medium"
                >
                  + Create Catalogue
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catalogue
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closing Date
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {catalogues.map((cat) => (
                      <tr key={cat._id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <img
                              src={cat.image?.url}
                              alt={cat.title}
                              className="w-16 h-12 rounded-lg object-cover mr-3 border border-gray-200"
                            />
                            <div className="font-medium text-gray-900 truncate max-w-[280px]">
                              {cat.title}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(cat.closingDate)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {isPast(cat.closingDate) ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Past
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Upcoming
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDelete(cat._id, cat.title)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CREATE MODAL */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Create Catalogue</h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g., Closing on 12th November"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Date *
                    </label>
                    <input
                      type="date"
                      value={form.closingDate}
                      onChange={(e) =>
                        setForm({ ...form, closingDate: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auctions ending on this day will appear in this
                      catalogue.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="catalogue-image-upload"
                      />
                      <label
                        htmlFor="catalogue-image-upload"
                        className="cursor-pointer block"
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ) : (
                          <>
                            <ImageIcon
                              size={36}
                              className="mx-auto text-gray-400 mb-2"
                            />
                            <p className="text-sm text-gray-600">
                              Click to upload image
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? "Creating..." : "Create Catalogue"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AdminContainer>
      </div>
    </section>
  );
}

export default AllCatalogues;