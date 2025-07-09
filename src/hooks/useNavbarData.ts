import { useState, useEffect } from 'react';
import categoryApi from '../API/categoryApi';
import { getProducts } from '../API/productApi';
import { 
  saveWithTimestamp, 
  getWithTimestamp, 
  clearNavbarData 
} from '../utils/sessionStorage';

interface Category {
  ma_danh_muc: number;
  ten_danh_muc: string;
}

interface Product {
  ma_san_pham: number;
  ten_san_pham: string;
  ten_danh_muc: string | null;
}

interface NavbarData {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  loading: boolean;
  error: string | null;
}

export const useNavbarData = (): NavbarData => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Kiểm tra session storage trước
        const savedCategories = getWithTimestamp('navbar_categories');
        const savedProducts = getWithTimestamp('navbar_products');

        // Nếu có dữ liệu đã lưu và không quá cũ, sử dụng dữ liệu đó
        if (savedCategories && savedProducts) {
          setCategories(savedCategories);
          setProductsByCategory(savedProducts);
          setLoading(false);
          return;
        }

        // Nếu không có dữ liệu hoặc dữ liệu cũ, fetch từ API
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getAll(),
          getProducts()
        ]);

        // Log dữ liệu trả về để debug
        console.log('categoryApi.getAll() trả về:', catRes);
        console.log('getProducts() trả về:', prodRes);

        if (Array.isArray(catRes.data) && Array.isArray(prodRes.data)) {
          setCategories(catRes.data);
          
          // Gom sản phẩm theo tên danh mục
          const grouped: Record<string, Product[]> = {};
          prodRes.data.forEach((p: any) => {
            if (!p.ten_danh_muc) return;
            if (!grouped[p.ten_danh_muc]) grouped[p.ten_danh_muc] = [];
            grouped[p.ten_danh_muc].push({
              ma_san_pham: p.ma_san_pham,
              ten_san_pham: p.ten_san_pham,
              ten_danh_muc: p.ten_danh_muc,
            });
          });
          
          setProductsByCategory(grouped);
          
          // Lưu vào session storage với timestamp
          saveWithTimestamp('navbar_categories', catRes.data);
          saveWithTimestamp('navbar_products', grouped);
        } else {
          // Log lỗi chi tiết
          console.error('catRes:', catRes);
          console.error('prodRes:', prodRes);
          throw new Error('Dữ liệu trả về không đúng định dạng');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu navbar:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        
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
    error
  };
}; 