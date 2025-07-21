import type { Product } from "../types/Product";

export interface PopularProductsResponse {
  message?: string;
  data: {
    method: string;
    products: Product[];
  };
  success: boolean;
}

export interface RecommendationResponse {
  message?: string;
  data: {
    message: string;
    method: string;
    recommendations: Product[];
    total_count: number;
    user_id: number | null;
  };
  success: boolean;
}

export const recommendationApi = {
  // Lấy sản phẩm nổi bật (popular products)
  getPopularProducts: async (
    limit: number = 10
  ): Promise<PopularProductsResponse> => {
    try {
      const response = await fetch(
        `http://localhost:5000/products/popular?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch popular products");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching popular products:", error);
      throw new Error("Lấy danh sách sản phẩm nổi bật thất bại.");
    }
  },

  // Lấy gợi ý sản phẩm cho user đã đăng nhập
  getUserRecommendations: async (
    userId: number,
    method: "hybrid" | "collaborative" | "content" = "hybrid",
    limit: number = 10
  ): Promise<RecommendationResponse> => {
    try {
      const response = await fetch(
        `http://localhost:5000/recommendations/${userId}?method=${method}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user recommendations");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      throw new Error("Lấy gợi ý sản phẩm thất bại.");
    }
  },

  // Lấy gợi ý sản phẩm cho khách chưa đăng nhập
  getGuestRecommendations: async (
    limit: number = 10
  ): Promise<RecommendationResponse> => {
    try {
      const response = await fetch(
        `http://localhost:5000/recommendations?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch guest recommendations");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching guest recommendations:", error);
      throw new Error("Lấy gợi ý sản phẩm thất bại.");
    }
  },
};
