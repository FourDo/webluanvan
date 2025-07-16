export interface BaiViet {
    id?: number;
    tieu_de: string;
    mo_ta_ngan: string;
    noi_dung: string;
    anh_dai_dien: string;
    danh_muc_id: number;
    hien_thi: boolean;
    tags?: number[];    // Khi tạo mới
    tag_ids?: number[]; // Khi sửa
  } 