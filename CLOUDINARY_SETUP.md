# Hướng dẫn cấu hình Cloudinary Upload

## Bước 1: Thông tin Cloudinary hiện tại

- **Cloud Name**: `dubtdbe8z`
- **Upload Preset**: `webluanvan_upload`
- **API URL**: `https://api.cloudinary.com/v1_1/dubtdbe8z/image/upload`

## Bước 2: Kiểm tra Upload Preset

1. Đăng nhập vào Cloudinary Dashboard
2. Vào **Settings** > **Upload**
3. Tìm preset có tên `webluanvan_upload`
4. Đảm bảo cấu hình:
   - **Signing Mode**: `Unsigned` (quan trọng!)
   - **Resource type**: `Image`
   - **Format**: `Auto`
   - **Quality**: `Auto`

## Bước 3: Tạo Upload Preset (nếu chưa có)

Nếu preset `webluanvan_upload` chưa tồn tại:

1. Click **Add upload preset**
2. Cấu hình:
   - **Preset name**: `webluanvan_upload`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `webluanvan` (tự động tổ chức file)
   - **Format**: `Auto`
   - **Quality**: `Auto`
   - **Resource type**: `Image`

## Bước 4: Code đã được cập nhật

````typescript
// src/utils/cloudinaryUpload.ts
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "webluanvan_upload");

  const response = await axios.post(
    "https://api.cloudinary.com/v1_1/dubtdbe8z/image/upload",
    formData
  );

  return response.data.secure_url;
};
```## Bước 5: Test upload

1. Vào form tạo/sửa bài báo
2. Upload ảnh đại diện hoặc chèn ảnh trong Rich Text
3. Kiểm tra hình ảnh có hiển thị từ Cloudinary URL không

## Cấu hình nâng cao (tùy chọn)

### Giới hạn kích thước file:

```typescript
// Trong upload preset settings
"transformation": [
  {
    "width": 1200,
    "height": 800,
    "crop": "limit",
    "quality": "auto",
    "format": "auto"
  }
]
````

### Auto-optimize:

- Enable **Auto optimization**
- Enable **Auto format**
- Enable **Auto quality**

### Security:

- Có thể chuyển sang **Signed mode** sau khi test xong
- Thêm **Allowed formats**: jpg, png, webp, gif

## Kiểm tra hoạt động:

1. **Upload thành công**: Hình ảnh hiển thị với URL dạng `https://res.cloudinary.com/dwyfyxxwq/image/upload/...`
2. **Lưu database**: Nội dung Rich Text chứa Cloudinary URLs
3. **Hiển thị public**: Hình ảnh load nhanh và tối ưu

## Troubleshooting:

- **Lỗi 401**: Kiểm tra Upload Preset có đúng tên không
- **Lỗi CORS**: Đảm bảo preset là Unsigned
- **Upload chậm**: Kiểm tra kết nối mạng
- **File quá lớn**: Giảm kích thước hoặc tăng limit trong preset
