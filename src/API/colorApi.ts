export const API_BASE_URL = "https://luanvan-7wv1.onrender.com/api";

export const fetchColors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/color`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      console.error("Lỗi khi tải màu sắc");
      return { success: false };
    }
  } catch (error) {
    console.error("Lỗi khi tải màu sắc:", error);
    return { success: false };
  }
};

export const deleteColor = async (id: number) => {
  if (!confirm("Bạn có chắc chắn muốn xóa màu sắc này?")) {
    return { success: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/color/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: "Lỗi khi xóa màu sắc!" };
    }
  } catch (error) {
    console.error("Lỗi khi xóa màu sắc:", error);
    return { success: false, error: "Lỗi khi xóa màu sắc!" };
  }
};

export const saveColor = async (
  formData: { ten_mau_sac: string; mo_ta: string },
  editingItem: { ma_mau_sac: number } | null
) => {
  if (!formData.ten_mau_sac.trim() || !formData.mo_ta.trim()) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin!" };
  }

  try {
    const payload = {
      ten_mau_sac: formData.ten_mau_sac.trim(),
      mo_ta: formData.mo_ta.trim(),
    };

    if (editingItem) {
      // Update existing color
      const response = await fetch(
        `${API_BASE_URL}/color/${editingItem.ma_mau_sac}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updatedColor = await response.json();
        return { success: true, data: updatedColor };
      } else {
        return { success: false, error: "Lỗi khi cập nhật màu sắc!" };
      }
    } else {
      // Create new color
      const response = await fetch(`${API_BASE_URL}/color`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newColor = await response.json();
        return { success: true, data: newColor };
      } else {
        return { success: false, error: "Lỗi khi thêm màu sắc!" };
      }
    }
  } catch (error) {
    console.error("Lỗi khi lưu màu sắc:", error);
    return { success: false, error: "Lỗi khi lưu màu sắc!" };
  }
};
