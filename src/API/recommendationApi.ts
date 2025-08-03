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

// Interface cho tracking behavior
export interface BehaviorData {
  ma_nguoi_dung: number; // Bắt buộc, sử dụng 0 cho guest user
  ma_san_pham: number;
  hanh_vi: "xem" | "tim_kiem" | "them_vao_gio";
  session_id?: string;
  timestamp?: string;
  tu_khoa_tim_kiem?: string; // Chỉ dùng cho hanh_vi = 'tim_kiem'
}

export interface TrackBehaviorResponse {
  message: string;
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

  // Track hành vi đơn lẻ
  trackBehavior: async (
    behaviorData: BehaviorData
  ): Promise<TrackBehaviorResponse> => {
    try {
      const requestData = {
        ...behaviorData,
        timestamp: behaviorData.timestamp || new Date().toISOString(),
      };

      console.log("Tracking behavior data:", requestData);

      const response = await fetch("http://localhost:5000/track/behavior", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Track behavior error response:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          requestData: requestData,
        });
        throw new Error(
          `Failed to track behavior: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Track behavior success:", result);
      return result;
    } catch (error) {
      console.error("Error tracking behavior:", error);
      // Không throw error để không ảnh hưởng đến UX
      return { message: "Failed to track behavior", success: false };
    }
  },

  // Track nhiều hành vi cùng lúc
  trackBatchBehaviors: async (
    behaviors: BehaviorData[]
  ): Promise<TrackBehaviorResponse> => {
    try {
      const requestData = {
        behaviors: behaviors.map((behavior) => ({
          ...behavior,
          timestamp: behavior.timestamp || new Date().toISOString(),
        })),
      };

      console.log("Tracking batch behaviors data:", requestData);

      const response = await fetch("http://localhost:5000/track/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Track batch behaviors error response:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          requestData: requestData,
        });
        throw new Error(
          `Failed to track batch behaviors: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Track batch behaviors success:", result);
      return result;
    } catch (error) {
      console.error("Error tracking batch behaviors:", error);
      return { message: "Failed to track batch behaviors", success: false };
    }
  },
};
