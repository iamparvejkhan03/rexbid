import { useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function RTE({
    name = "content",
    control,
    defaultValue = "",
    placeholder,
    rules,
    imageUploadUrl,
}) {
    const quillRef = useRef(null);

    const imageHandler = useMemo(() => {
        if (!imageUploadUrl) return null;

        return () => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;

                if (file.size > MAX_IMAGE_BYTES) {
                    toast.error("Image must be under 5MB");
                    return;
                }

                const formData = new FormData();
                formData.append("image", file);

                const toastId = toast.loading("Uploading image...");
                try {
                    const { data } = await axiosInstance.post(
                        imageUploadUrl,
                        formData,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );

                    if (!data.success || !data.data?.url) {
                        throw new Error(data.message || "Upload failed");
                    }

                    const quill = quillRef.current?.getEditor();
                    if (!quill) throw new Error("Editor not ready");

                    const range = quill.getSelection(true) || {
                        index: quill.getLength(),
                        length: 0,
                    };
                    quill.insertEmbed(range.index, "image", data.data.url, "user");
                    quill.setSelection(range.index + 1);

                    toast.success("Image uploaded", { id: toastId });
                } catch (error) {
                    console.error("Image upload failed:", error);
                    toast.error(
                        error.response?.data?.message || error.message || "Upload failed",
                        { id: toastId }
                    );
                }
            };
        };
    }, [imageUploadUrl]);

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ align: [] }],
                    ["link", "image"],
                    ["clean"],
                ],
                ...(imageHandler && { handlers: { image: imageHandler } }),
            },
        }),
        [imageHandler]
    );

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={rules}
            render={({ field: { onChange, onBlur, value } }) => (
                <div className="[&_.ql-editor]:min-h-[400px] [&_.ql-editor]:max-h-[600px] [&_.ql-editor]:overflow-y-auto">
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={value ?? ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        modules={modules}
                        style={{ minHeight: 300 }}
                    />
                </div>
            )}
        />
    );
}

export default RTE;