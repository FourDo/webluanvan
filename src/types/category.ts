interface Category {
  ma_danh_muc: number;
  ten_danh_muc: string;
  mo_ta: string;
  ngay_tao: string;
  slug: string;
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

interface SingleCategoryResponse {
  message: string;
  data: Category;
}

interface CreateCategoryCredentials {
  ten_danh_muc: string;
  mo_ta: string;
}

interface UpdateCategoryCredentials {
  ten_danh_muc?: string;
  mo_ta?: string;
}

export type {
  Category,
  CategoryResponse,
  SingleCategoryResponse,
  CreateCategoryCredentials,
  UpdateCategoryCredentials,
};
