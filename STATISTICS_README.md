# Hệ thống Thống kê và Báo cáo nâng cao

## Tổng quan

Hệ thống thống kê và báo cáo được nâng cấp với các tính năng phân tích chi tiết doanh thu, sản phẩm và hành vi khách hàng.

## Các tính năng chính

### 1. 📊 Dashboard Tổng quan (`/admin`)

- **KPI Cards**: Hiển thị các chỉ số quan trọng:

  - Tổng doanh thu với tỷ lệ tăng trưởng
  - Số lượng sản phẩm đã bán
  - Tỷ lệ đơn hoàn trả
  - Tỷ lệ thành công đơn hàng

- **Biểu đồ doanh thu theo tháng**: Hiển thị xu hướng doanh thu với thanh tiến trình trực quan
- **Top sản phẩm bán chạy**: Danh sách các sản phẩm bán nhiều nhất với thống kê chi tiết
- **Phân tích khách hàng**: Thống kê khách mới, khách quay lại và các chỉ số hành vi

### 2. 📈 Báo cáo Chi tiết (`/admin/baocao`)

#### a) Tab Tổng quan

- **KPI Cards nâng cao** với gradient và icon động
- **Biểu đồ doanh thu tương tác** với:
  - Filter theo thời gian (tháng/quý/năm)
  - Chọn năm cụ thể
  - Hiển thị tỷ lệ tăng trưởng
  - Progress bar động

#### b) Tab Doanh thu

- **Chi tiết doanh thu**: Tổng doanh thu, doanh thu trung bình, số đơn hàng
- **Trạng thái đơn hàng**: Phân tích chi tiết theo trạng thái (thành công, đang xử lý, hủy)

#### c) Tab Sản phẩm

- **Top sản phẩm bán chạy** với:
  - Xếp hạng trực quan
  - Thống kê số lượng và doanh thu
  - Tỷ lệ thị phần
  - Hình ảnh sản phẩm

#### d) Tab Khách hàng

- **Phân tích khách hàng**:
  - Khách mới, khách quay lại, khách trung thành
  - Đơn hàng trung bình/khách
  - Giá trị trung bình/đơn
  - Chu kỳ mua hàng
- **Segmentation**: Phân khúc khách hàng với biểu đồ progress bar

## Cấu trúc API

### Interfaces chính

```typescript
interface ThongKeTongHopData {
  doanhThu: DoanhThuData;
  soLuongBanRa: SoLuongBanRaData;
  donHoanTra: DonHoanTraData;
  thongKeDonHang: ThongKeDonHangData;
  doanhThuTheoThang: DoanhThuTheoThoiGianData[];
  doanhThuTheoQuy: DoanhThuTheoThoiGianData[];
  doanhThuTheoNam: DoanhThuTheoThoiGianData[];
  sanPhamBanChay: SanPhamBanChayData[];
  hanhViKhachHang: HanhViKhachHangData;
}
```

### API Endpoints được hỗ trợ

1. `GET /thongke/tongdoanhthu` - Tổng doanh thu
2. `GET /thongke/tongslbanra` - Tổng số lượng bán ra
3. `GET /thongke/sodonhoantra1thang` - Đơn hoàn trả 1 tháng
4. `GET /thongke/donhang` - Thống kê đơn hàng
5. `GET /thongke/doanhthu/thang?nam=2024` - Doanh thu theo tháng
6. `GET /thongke/doanhthu/quy?nam=2024` - Doanh thu theo quý
7. `GET /thongke/doanhthu/nam` - Doanh thu theo năm
8. `GET /thongke/sanpham/banchay?limit=10` - Sản phẩm bán chạy
9. `GET /thongke/khachhang/hanhvi` - Hành vi khách hàng

## Components mới

### 1. `AdvancedReports.tsx`

- Component chính cho báo cáo nâng cao
- Quản lý tabs và filters
- Hiển thị các biểu đồ và thống kê chi tiết

### 2. `RevenueChart.tsx`

- Component biểu đồ doanh thu có thể tái sử dụng
- Hỗ trợ hiển thị theo tháng/quý/năm
- Progress bar với animation
- Indicators tăng trưởng

### 3. `DashboardContent.tsx` (cập nhật)

- Tích hợp dữ liệu từ API mới
- Thêm nút chuyển đến báo cáo chi tiết
- Hiển thị thống kê realtime

## Tính năng UI/UX

### 1. **Responsive Design**

- Hoạt động tốt trên desktop, tablet và mobile
- Grid layout linh hoạt

### 2. **Interactive Elements**

- Hover effects trên cards và buttons
- Loading states với skeleton loading
- Error handling với retry functionality

### 3. **Visual Indicators**

- Progress bars với gradient
- Growth indicators (↗️ ↘️)
- Color coding theo trạng thái
- Icons phân loại rõ ràng

### 4. **Animation & Transitions**

- Smooth transitions cho progress bars
- Fade in/out effects
- Micro-interactions

## Cách sử dụng

### 1. Truy cập Dashboard

- Đăng nhập admin và vào `/admin`
- Xem tổng quan nhanh các KPI chính
- Click "Báo cáo chi tiết" để xem phân tích sâu

### 2. Sử dụng Báo cáo nâng cao

- Truy cập `/admin/baocao`
- Chọn filter thời gian (tháng/quý/năm)
- Chuyển đổi giữa các tabs để xem khía cạnh khác nhau
- Sử dụng nút "Xuất BC" để export dữ liệu

### 3. Tương tác với biểu đồ

- Hover để xem chi tiết
- Quan sát indicators tăng trưởng
- So sánh dữ liệu qua các kỳ

## Fallback & Error Handling

### Mock Data

- Hệ thống có mock data backup khi API không khả dụng
- Data realtime được ưu tiên, fallback khi cần thiết

### Error States

- Loading skeletons khi đang tải dữ liệu
- Error messages với retry buttons
- Graceful degradation

## Cải tiến trong tương lai

1. **Real-time Updates**: WebSocket integration
2. **Advanced Charts**: Thêm line charts, pie charts
3. **Export Features**: PDF, Excel export
4. **Predictive Analytics**: Machine learning insights
5. **Custom Dashboards**: Drag & drop dashboard builder
6. **Notifications**: Alert system cho các chỉ số quan trọng

## Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Hooks
- **API Client**: Axios (trong apiClient)

---

✨ **Hệ thống này cung cấp cái nhìn toàn diện về hiệu suất kinh doanh với giao diện trực quan và dễ sử dụng.**
