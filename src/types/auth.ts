export interface RegisterCredentials {
  email: string;
  mat_khau: string;
  ho_ten: string;
  so_dien_thoai: string;
  dia_chi: string;
}

export interface RegisterResponse {
  success: string;
  user: {
    ma_nguoi_dung: number;
    email: string;
    ho_ten: string;
    so_dien_thoai: string;
    dia_chi: string;
    vai_tro: string;
    google_id: string | null;
    reset_token_expiry: string | null;
    trang_thai: string;
    ngay_tao: string;
    ngay_cap_nhat: string;
  };
}

export interface LoginResponse {
  data: any;
  access_token: string;
  token: string;
  success: string;
  user: {
    isAdmin: boolean;
    id: number;
    username: string;
    ma_nguoi_dung: number;
    email: string;
    ho_ten: string;
    so_dien_thoai: string;
    dia_chi: string;
    vai_tro: string;
    google_id: string | null;
    reset_token_expiry: string | null;
    trang_thai: string;
    ngay_tao: string;
    ngay_cap_nhat: string;
  };
}

export interface LogoutResponse {
  success: string;
}

export interface LoginCredentials {
  email: string;
  mat_khau: string;
}

export interface UpdateUserCredentials {
  email: string;
  ho_ten: string;
  so_dien_thoai: string;
  dia_chi: string;
}

export interface UpdateUserResponse {
  success: string;
  user: {
    ma_nguoi_dung: number;
    email: string;
    ho_ten: string;
    so_dien_thoai: string;
    dia_chi: string;
    vai_tro: string;
    google_id: string | null;
    reset_token_expiry: string | null;
    trang_thai: string;
    ngay_tao: string;
    ngay_cap_nhat: string;
  };
}
