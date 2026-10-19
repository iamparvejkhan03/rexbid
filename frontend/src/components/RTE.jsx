import { Controller } from "react-hook-form";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

function RTE({ name = "content", control, defaultValue = "", placeholder, rules }) {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={rules}
            render={({ field: { onChange, onBlur, value } }) => (
                <div className="[&_.ql-editor]:min-h-[400px] [&_.ql-editor]:max-h-[600px] [&_.ql-editor]:overflow-y-auto">
                <ReactQuill
                    theme="snow"
                    value={value ?? ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    modules={{
                        toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ align: [] }],
                            ["link", "image"],
                            ["clean"],
                        ],
                    }}
                    style={{ minHeight: 300 }}
                />
                </div>
            )}
        />
    );
}

export default RTE;