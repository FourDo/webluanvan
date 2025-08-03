import { useState, useEffect } from "react";
import categoryApi from "../API/categoryApi";
import { productApi } from "../API/productApi";
import {
  saveWithTimestamp,
  getWithTimestamp,
  clearNavbarData,
} from "../utils/sessionStorage";

interface Category {
  ma_danh_muc: number;
  ten_danh_muc: string;
}

interface Product {
  ma_san_pham: number;
  ten_san_pham: string;
  ten_danh_muc: string | null;
  image: string; // Thêm trường image
}

interface NavbarData {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  loading: boolean;
  error: string | null;
}

export const useNavbarData = (): NavbarData => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Kiểm tra session storage trước
        const savedCategories = getWithTimestamp("navbar_categories");
        const savedProducts = getWithTimestamp("navbar_products");

        // Nếu có dữ liệu đã lưu và không quá cũ, sử dụng dữ liệu đó
        if (savedCategories && savedProducts) {
          // Kiểm tra xem dữ liệu có trường image không, nếu không thì clear cache
          const firstCategory = Object.keys(savedProducts)[0];
          const hasImageField = savedProducts[firstCategory]?.[0]?.image;

          if (hasImageField) {
            setCategories(savedCategories);
            setProductsByCategory(savedProducts);
            setLoading(false);
            return;
          } else {
            // Clear cache cũ không có image
            clearNavbarData();
          }
        }

        // Nếu không có dữ liệu hoặc dữ liệu cũ, fetch từ API
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getProducts(),
        ]);

        if (Array.isArray(catRes.data) && Array.isArray(prodRes.data)) {
          setCategories(catRes.data);

          // Gom sản phẩm theo tên danh mục
          const grouped: Record<string, Product[]> = {};
          prodRes.data.forEach((p: any) => {
            if (!p.ten_danh_muc) return;

            // Tìm hình ảnh từ variant đầu tiên có hình
            let image = "/image/hetcuu3.png"; // Default fallback image

            // Tìm variant có hình ảnh
            if (p.bienthe && Array.isArray(p.bienthe) && p.bienthe.length > 0) {
              const variantWithImage = p.bienthe.find(
                (variant: any) =>
                  variant.hinh_anh &&
                  Array.isArray(variant.hinh_anh) &&
                  variant.hinh_anh.length > 0
              );

              if (variantWithImage && variantWithImage.hinh_anh[0]) {
                image = variantWithImage.hinh_anh[0];
              }
            }

            if (!grouped[p.ten_danh_muc]) grouped[p.ten_danh_muc] = [];
            grouped[p.ten_danh_muc].push({
              ma_san_pham: p.ma_san_pham,
              ten_san_pham: p.ten_san_pham,
              ten_danh_muc: p.ten_danh_muc,
              image: image,
            });
          });

          setProductsByCategory(grouped);

          // Lưu vào session storage với timestamp
          saveWithTimestamp("navbar_categories", catRes.data);
          saveWithTimestamp("navbar_products", grouped);
        } else {
          // Log lỗi chi tiết
          console.error("catRes:", catRes);
          console.error("prodRes:", prodRes);
          throw new Error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu navbar:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");

        // Xóa dữ liệu cũ nếu có lỗi
        clearNavbarData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    categories,
    productsByCategory,
    loading,
    error,
  };
};
