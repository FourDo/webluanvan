# API Structure Documentation

## 📁 API Files Structure

### 1. **baibaoApi.ts** - Quản lý Bài viết

```typescript
import apiClient from "../ultis/apiClient";
import type { BaiViet, BaiVietForm } from "../types/BaiViet";

export const baibaoApi = {
  getAllBaiViet: () => Promise<BaiViet[]>
  getBaiVietById: (id: number) => Promise<BaiViet>
  createBaiViet: (data: BaiVietForm) => Promise<BaiViet>
  updateBaiViet: (id: number, data: BaiVietForm) => Promise<BaiViet>
  deleteBaiViet: (id: number) => Promise<any>
}
```

**Endpoints:**

- `GET /baiviet` - Lấy danh sách bài viết
- `GET /baiviet/{id}` - Lấy chi tiết bài viết
- `POST /baiviet` - Tạo bài viết mới
- `PUT /baiviet/{id}` - Cập nhật bài viết
- `DELETE /baiviet/{id}` - Xóa bài viết

### 2. **tagApi.ts** - Quản lý Tags

```typescript
import apiClient from "../ultis/apiClient";

export const tagApi = {
  getAllTags: () => Promise<Tag[]>,
};
```

**Endpoints:**

- `GET /tags` - Lấy danh sách tags

### 3. **colorApi.ts** - Quản lý Màu sắc (pattern mẫu)

```typescript
import apiClient from "../ultis/apiClient";

export const colorApi = {
  fetchColors: () => Promise<Color[]>
  deleteColor: (id: number) => Promise<any>
  saveColor: (formData: ColorForm) => Promise<Color>
}
```

## 🔧 API Client Pattern

Tất cả API files đều sử dụng pattern chung:

```typescript
import apiClient from "../ultis/apiClient";

export const [moduleName]Api = {
  [functionName]: (params?) =>
    apiClient
      .[method]<ResponseType>(endpoint, data?)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Error message.");
      }),
};

export default [moduleName]Api;

// Export individual functions for backward compatibility
export const [functionName] = [moduleName]Api.[functionName];
```

## 🔄 Usage Examples

### Trong Components:

```typescript
// Option 1: Named imports (backward compatible)
import { getAllBaiViet, createBaiViet } from "../API/baibaoApi";

// Option 2: Default import
import baibaoApi from "../API/baibaoApi";

// Usage
const articles = await getAllBaiViet();
// OR
const articles = await baibaoApi.getAllBaiViet();
```

### Error Handling:

Tất cả API functions đều throw Error với message phù hợp, cần wrap trong try-catch:

```typescript
try {
  const result = await baibaoApi.getAllBaiViet();
  // Handle success
} catch (error) {
  console.error(error.message); // "Lấy danh sách bài viết thất bại."
}
```

## 📦 Benefits of This Pattern

1. **Consistent Error Handling** - Tất cả lỗi được handle thống nhất
2. **TypeScript Support** - Type safety với generics
3. **Centralized HTTP Client** - Sử dụng apiClient chung
4. **Easy Testing** - Dễ mock cho testing
5. **Backward Compatibility** - Vẫn support named exports
6. **Clean Code** - Code ngắn gọn, dễ đọc
