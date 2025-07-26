import { useCallback } from "react";
import { recommendationApi } from "../API/recommendationApi";
import type { BehaviorData } from "../API/recommendationApi";

// Tạo session ID duy nhất
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Lấy hoặc tạo session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("behavior_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("behavior_session_id", sessionId);
  }
  return sessionId;
};

// Lấy user ID từ localStorage hoặc cookie
const getUserId = (): number => {
  try {
    // Thử lấy từ localStorage trước
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return (
        userData.ma_nguoi_dung || userData.ma_khach_hang || userData.id || 0
      );
    }

    // Nếu không có trong localStorage, thử lấy từ cookie
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_data="));

    if (cookieValue) {
      const encodedData = cookieValue.split("=")[1];
      const decodedData = decodeURIComponent(encodedData);
      const userData = JSON.parse(decodedData);
      return (
        userData.ma_nguoi_dung || userData.ma_khach_hang || userData.id || 0
      );
    }

    // Trả về 0 cho guest user
    return 0;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return 0;
  }
};

export const useBehaviorTracking = () => {
  const trackBehavior = useCallback(
    async (
      productId: number,
      behaviorType: "xem" | "tim_kiem" | "them_vao_gio",
      searchQuery?: string
    ) => {
      try {
        // Validation
        if (!productId || productId <= 0) {
          console.error("Invalid product ID:", productId);
          return;
        }

        const validBehaviors = ["xem", "tim_kiem", "them_vao_gio"];
        if (!validBehaviors.includes(behaviorType)) {
          console.error("Invalid behavior type:", behaviorType);
          return;
        }

        const userId = getUserId();
        const behaviorData: BehaviorData = {
          ma_nguoi_dung: userId,
          ma_san_pham: productId,
          hanh_vi: behaviorType,
          session_id: getSessionId(),
          timestamp: new Date().toISOString(),
        };

        // Thêm tu_khoa_tim_kiem nếu behavior là tìm kiếm
        if (behaviorType === "tim_kiem" && searchQuery) {
          behaviorData.tu_khoa_tim_kiem = searchQuery;
        }

        console.log("User ID found:", userId);
        console.log("Preparing to track behavior:", behaviorData);

        await recommendationApi.trackBehavior(behaviorData);
      } catch (error) {
        console.error("Failed to track behavior:", error);
      }
    },
    []
  );

  const trackViewProduct = useCallback(
    (productId: number) => {
      trackBehavior(productId, "xem");
    },
    [trackBehavior]
  );

  const trackSearchProduct = useCallback(
    (productId: number, searchQuery: string) => {
      trackBehavior(productId, "tim_kiem", searchQuery);
    },
    [trackBehavior]
  );

  const trackAddToCart = useCallback(
    (productId: number) => {
      trackBehavior(productId, "them_vao_gio");
    },
    [trackBehavior]
  );

  return {
    trackViewProduct,
    trackSearchProduct,
    trackAddToCart,
    trackBehavior,
  };
};
