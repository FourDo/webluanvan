import React, { useEffect, useState } from "react";
import { getAllBaiViet } from "../API/baibaoApi";
import type { BaiViet } from "../types/BaiViet";
import { Link } from "react-router-dom";

const BaiBaoList: React.FC = () => {
  const [baiviets, setBaiviets] = useState<BaiViet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBaiViet()
      .then(setBaiviets)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Danh sách bài báo</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {baiviets.map((bv) => (
          <div
            key={bv.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              width: 320,
              padding: 16,
            }}
          >
            <img
              src={bv.anh_dai_dien}
              alt={bv.tieu_de}
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />
            <h3>
              <Link to={`/baibao/${bv.id}`}>{bv.tieu_de}</Link>
            </h3>
            <p>{bv.mo_ta_ngan}</p>
            <div>
              <small>Danh mục: {bv.danh_muc?.ten_danh_muc}</small>
            </div>
            <div>
              {bv.tags?.map((tag) => (
                <span key={tag.id} style={{ marginRight: 8, color: "#007bff" }}>
                  #{tag.ten_tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BaiBaoList;
