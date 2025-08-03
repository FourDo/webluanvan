export interface BaiViet {
  data: BaiViet;
  id?: number;
  tieu_de: string;
  slug?: string;
  mo_ta_ngan: string;
  noi_dung: string;
  anh_dai_dien: string;
  hien_thi: boolean;
  luot_xem?: number;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  danh_muc_id?: number;
  danh_muc?: {
    id: number;
    ten_danh_muc: string;
    slug: string;
  };
  tags?: BaiVietTag[];
  tag_ids?: number[];
}

export interface BaiVietTag {
  id: number;
  ten_tag: string;
  slug: string;
}

export interface BaiVietForm {
  tieu_de: string;
  mo_ta_ngan: string;
  noi_dung: string;
  anh_dai_dien: string;
  danh_muc_id: number;
  hien_thi: boolean;
  tag_ids: number[];
}
