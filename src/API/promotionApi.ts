// Giả lập trong file: src/api/promotionApi.ts

// Định nghĩa kiểu dữ liệu
export type Promotion = {
  ma_khuyen_mai: number;
  ten_khuyen_mai: string;
  phan_tram_giam: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
};

export type PromotionFormData = {
  ten_khuyen_mai: string;
  phan_tram_giam: string | number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
};

let mockPromotions: Promotion[] = [
  {
    ma_khuyen_mai: 1,
    ten_khuyen_mai: "Khuyến mãi mùa hè",
    phan_tram_giam: 20,
    ngay_bat_dau: "2025-06-01T10:00:00.000Z",
    ngay_ket_thuc: "2025-06-15T23:59:59.000Z",
  },
  {
    ma_khuyen_mai: 2,
    ten_khuyen_mai: "Chào mừng ngày lễ",
    phan_tram_giam: 15,
    ngay_bat_dau: "2025-04-30T10:00:00.000Z",
    ngay_ket_thuc: "2025-05-05T23:59:59.000Z",
  },
  {
    ma_khuyen_mai: 3,
    ten_khuyen_mai: "Black Friday Sale",
    phan_tram_giam: 50,
    ngay_bat_dau: "2024-11-28T00:00:00.000Z",
    ngay_ket_thuc: "2024-11-30T23:59:59.000Z",
  },
];

const apiRequest = <T>(data: T, delay = 500): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// Giả lập API lấy danh sách khuyến mãi
export const fetchPromotions = async (): Promise<Promotion[]> => {
  console.log("API: Fetching promotions...");
  return apiRequest(mockPromotions);
};

// Giả lập API lưu (thêm/sửa) khuyến mãi
export const savePromotion = async (
  formData: PromotionFormData,
  editingId: number | null
): Promise<Promotion> => {
  console.log("API: Saving promotion...", { formData, editingId });

  if (editingId) {
    // Chế độ sửa
    const updatedPromotion = {
      ...formData,
      ma_khuyen_mai: editingId,
      phan_tram_giam: Number(formData.phan_tram_giam),
    };
    mockPromotions = mockPromotions.map((p) =>
      p.ma_khuyen_mai === editingId ? updatedPromotion : p
    );
    return apiRequest(updatedPromotion);
  } else {
    // Chế độ thêm mới
    const newId =
      mockPromotions.length > 0
        ? Math.max(...mockPromotions.map((p) => p.ma_khuyen_mai)) + 1
        : 1;
    const newPromotion = {
      ...formData,
      ma_khuyen_mai: newId,
      phan_tram_giam: Number(formData.phan_tram_giam),
    };
    mockPromotions.push(newPromotion);
    return apiRequest(newPromotion);
  }
};

// Giả lập API xóa khuyến mãi
export const deletePromotion = async (
  id: number
): Promise<{ success: boolean }> => {
  console.log("API: Deleting promotion with id:", id);
  const initialLength = mockPromotions.length;
  mockPromotions = mockPromotions.filter((p) => p.ma_khuyen_mai !== id);
  if (mockPromotions.length < initialLength) {
    return apiRequest({ success: true });
  } else {
    throw new Error("Không tìm thấy khuyến mãi để xóa.");
  }
};
