import React, { useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  toolbar?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  height = "200px",
  toolbar = true,
}) => {
  const quillRef = useRef<ReactQuill>(null);

  // Custom image handler
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();

        if (!quill || !range) return;

        try {
          // Hiển thị loading placeholder
          quill.insertText(
            range.index,
            "Đang upload hình ảnh...",
            "italic",
            true
          );

          // Upload lên Cloudinary
          const imageUrl = await uploadImageToCloudinary(file);

          // Replace loading text với hình ảnh thật
          quill.deleteText(range.index, "Đang upload hình ảnh...".length);
          quill.insertEmbed(range.index, "image", imageUrl);
          quill.setSelection(range.index + 1, 0);
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Có lỗi xảy ra khi upload hình ảnh");

          // Remove loading text on error
          quill.deleteText(range.index, "Đang upload hình ảnh...".length);
        }
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: toolbar
        ? {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link", "image"],
              ["clean"],
            ],
            handlers: {
              image: imageHandler, // Custom image handler
            },
          }
        : false,
    }),
    [toolbar]
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  return (
    <div
      className="rich-text-editor"
      style={
        {
          "--editor-height": height,
        } as React.CSSProperties
      }
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .rich-text-editor .ql-editor {
            min-height: ${height};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          .rich-text-editor .ql-toolbar {
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-radius: 8px 8px 0 0;
          }
          .rich-text-editor .ql-container {
            border-bottom: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-radius: 0 0 8px 8px;
          }
          .rich-text-editor .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }
        `,
        }}
      />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
