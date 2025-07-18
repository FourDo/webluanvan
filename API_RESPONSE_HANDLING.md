# API Response Handling - Bài Báo System

## 🔧 **Cấu trúc Response từ Backend**

Tất cả API endpoints đều trả về dữ liệu theo format:

```json
{
  "data": [...]  // hoặc object single
}
```

## 📡 **API Endpoints**

### 1. **Tags API**

- **Endpoint**: `GET /api/tag`
- **Response**:

```json
{
  "data": [
    {
      "id": 1,
      "ten_tag": "Trang trí",
      "slug": "trang-tri",
      "mo_ta": null
    }
  ]
}
```

### 2. **Danh Mục Bài Viết API**

- **Endpoint**: `GET /api/danhmucbv`
- **Response**:

```json
{
  "data": [
    {
      "id": 4,
      "ten_danh_muc": "Bếp Gia Đình",
      "slug": "bep-gia-dinh",
      "mo_ta": null,
      "hien_thi": 0,
      "so_bai_viet": 1
    }
  ]
}
```

### 3. **Bài Viết API**

- **List**: `GET /api/baiviet`
- **Detail**: `GET /api/baiviet/{id}`
- **Create**: `POST /api/baiviet`
- **Update**: `PUT /api/baiviet/{id}`
- **Delete**: `DELETE /api/baiviet/{id}`

## 🔄 **Response Handling Strategy**

### **API Layer**

```typescript
// Tự động extract data từ response.data.data
getAllTags: () =>
  apiClient
    .get<TagResponse>("/tag")
    .then((res) => res.data.data) // ← Extract here
    .catch(() => {
      throw new Error("Lấy danh sách tags thất bại.");
    });
```

### **Component Layer**

```typescript
// Component chỉ cần gọi trực tiếp
const tagResponse = await tagApi.getAllTags();
setTags(tagResponse); // Đã là array rồi
```

## 📋 **Files Updated**

### 1. **`tagApi.ts`**

- ✅ Endpoint: `/tag` (không phải `/tags`)
- ✅ Response handling: `res.data.data`
- ✅ Interface: Thêm `mo_ta?: string | null`

### 2. **`danhmucbvApi.ts`** (Mới)

- ✅ Endpoint: `/danhmucbv`
- ✅ Full CRUD operations
- ✅ Response handling: `res.data.data`
- ✅ Interface: `DanhMucBaiViet`

### 3. **`baibaoApi.ts`**

- ✅ Response handling cải thiện
- ✅ Type safety với generics
- ✅ Consistent error handling

### 4. **`QLBaiBaoEnhanced.tsx`**

- ✅ Sử dụng `danhmucbvApi` thay vì `categoryApi`
- ✅ Loại bỏ `.data` handling trong component
- ✅ Type safety với `DanhMucBaiViet[]`

## 🎯 **Benefits**

1. **Consistent Response Handling**: Tất cả API đều handle response cùng cách
2. **Type Safety**: Interface rõ ràng cho mọi data structure
3. **Error Handling**: Thông báo lỗi thống nhất
4. **Clean Components**: Component không cần biết về response structure
5. **Maintainable**: Dễ maintain và extend

## 📝 **Usage Examples**

```typescript
// Lấy tags
const tags = await tagApi.getAllTags(); // Trả về Tag[]

// Lấy categories
const categories = await danhmucbvApi.getAll(); // Trả về DanhMucBaiViet[]

// Lấy bài viết
const articles = await baibaoApi.getAllBaiViet(); // Trả về BaiViet[]
const article = await baibaoApi.getBaiVietById(1); // Trả về BaiViet

// Trong component
useEffect(() => {
  const fetchData = async () => {
    try {
      const [articles, categories, tags] = await Promise.all([
        baibaoApi.getAllBaiViet(),
        danhmucbvApi.getAll(),
        tagApi.getAllTags(),
      ]);

      // Sử dụng trực tiếp, không cần .data
      setBaiBaos(articles);
      setCategories(categories);
      setTags(tags);
    } catch (error) {
      console.error(error);
    }
  };

  fetchData();
}, []);
```

Hệ thống đã được cập nhật để hoạt động hoàn hảo với cấu trúc API thực tế! 🚀
