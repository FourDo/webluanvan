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

// Lấy user ID từ localStorage
const getUserId = (): number | undefined => {
  try {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData.ma_khach_hang || userData.id;
    }
    return undefined;
  } catch {
    return undefined;
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
        const userId = getUserId();
        if (!userId) {
          console.warn("No user ID found, skipping behavior tracking");
          return;
        }

        const behaviorData: BehaviorData = {
          ma_nguoi_dung: userId,
          ma_san_pham: productId,
          hanh_vi: behaviorType,
          session_id: getSessionId(),
          timestamp: new Date().toISOString(),
          ...(behaviorType === "tim_kiem" &&
            searchQuery && { search_query: searchQuery }),
        };

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
