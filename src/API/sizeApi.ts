export const API_BASE_URL = "https://luanvan-7wv1.onrender.com/api";

export const fetchSizes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/kich-thuoc`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      console.error("Lỗi khi tải kích thước");
      return { success: false };
    }
  } catch (error) {
    console.error("Lỗi khi tải kích thước:", error);
    return { success: false };
  }
};

export const deleteSize = async (id: number) => {
  if (!confirm("Bạn có chắc chắn muốn xóa kích thước này?")) {
    return { success: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/size/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: "Lỗi khi xóa kích thước!" };
    }
  } catch (error) {
    console.error("Lỗi khi xóa kích thước:", error);
    return { success: false, error: "Lỗi khi xóa kích thước!" };
  }
};

export const saveSize = async (
  formData: { ten_kich_thuoc: string; mo_ta: string },
  editingItem: { ma_kich_thuoc: number } | null
) => {
  if (!formData.ten_kich_thuoc.trim() || !formData.mo_ta.trim()) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin!" };
  }

  try {
    const payload = {
      ten_kich_thuoc: formData.ten_kich_thuoc.trim(),
      mo_ta: formData.mo_ta.trim(),
    };

    if (editingItem) {
      // Update existing size
      const response = await fetch(
        `${API_BASE_URL}/size/${editingItem.ma_kich_thuoc}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updatedSize = await response.json();
        return { success: true, data: updatedSize };
      } else {
        return { success: false, error: "Lỗi khi cập nhật kích thước!" };
      }
    } else {
      // Create new size
      const response = await fetch(`${API_BASE_URL}/size`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newSize = await response.json();
        return { success: true, data: newSize };
      } else {
        return { success: false, error: "Lỗi khi thêm kích thước!" };
      }
    }
  } catch (error) {
    console.error("Lỗi khi lưu kích thước:", error);
    return { success: false, error: "Lỗi khi lưu kích thước!" };
  }
};
