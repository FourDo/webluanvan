import apiClient from "../ultis/apiClient";

export interface Tag {
  id: number;
  ten_tag: string;
  slug: string;
  mo_ta?: string | null;
}

export interface TagResponse {
  data: Tag[];
}

export const tagApi = {
  // Lấy danh sách tags
  getAllTags: () =>
    apiClient
      .get<TagResponse>("/tag")
      .then((res) => res.data.data) // Lấy array từ response.data.data
      .catch(() => {
        throw new Error("Lấy danh sách tags thất bại.");
      }),
};

export default tagApi;

// Export function riêng lẻ để tương thích
export const getAllTags = tagApi.getAllTags;
