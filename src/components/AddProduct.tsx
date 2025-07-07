import React, { useState, useEffect } from "react";
import axios from "axios";
import { addProduct } from "../API/productApi";
import type { Product, InputVariant, Variant } from "../types/Product";
import categoryApi from "../API/categoryApi";
import { fetchColors } from "../API/colorApi";
import { fetchSizes } from "../API/sizeApi";
import {
  Plus,
  X,
  Upload,
  Package,
  Tag,
  Palette,
  Ruler,
  DollarSign,
  Hash,
  FileText,
  Building2,
  AlertCircle,
  CheckCircle2,
  Image,
  Trash2,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";

interface Color {
  ten_mau_sac: string;
  hex_code: string;
}

interface Size {
  ten_kich_thuoc: string;
}

const AddProduct: React.FC = () => {
  const [newProduct, setNewProduct] = useState<
    Omit<Product, "ma_san_pham" | "ngay_tao" | "ngay_cap_nhat">
  >({
    ten_san_pham: "",
    thuong_hieu: "",
    mo_ta_ngan: "",
    chat_lieu: "",
    trang_thai_hoat_dong: "hoat_dong",
    ma_khuyen_mai: null,
    ten_danh_muc: "",
    bienthe: [],
  });

  const initialVariantState: InputVariant = {
    ten_mau_sac: "",
    hex_code: "",
    ten_kich_thuoc: "",
    gia_ban: 0,
    so_luong_ton: 0,
    trang_thai_hoat_dong_btsp: "hoat_dong",
    hinh_anh: [],
  };
  const [newVariant, setNewVariant] =
    useState<InputVariant>(initialVariantState);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"product" | "variants">("product");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, colorRes, sizeRes] = await Promise.all([
          categoryApi.getAll(),
          fetchColors(),
          fetchSizes(),
        ]);

        if (categoryRes.data) {
          setCategories(categoryRes.data.map((cat: any) => cat.ten_danh_muc));
        }
        if (colorRes.success && colorRes.data) {
          setColors(colorRes.data);
        }
        if (sizeRes.success && sizeRes.data) {
          setSizes(sizeRes.data);
        }
      } catch (err) {
        setError(
          "Không thể tải dữ liệu cần thiết (danh mục, màu, size). Vui lòng thử lại."
        );
        console.error("Data Fetching Error:", err);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "product_upload");
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dwyfyxxwq/image/upload`,
          formData
        );
        newImages.push(response.data.secure_url);
      }
      setNewVariant({
        ...newVariant,
        hinh_anh: [...newVariant.hinh_anh, ...newImages],
      });
    } catch (error) {
      setError("Upload ảnh thất bại. Vui lòng thử lại.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setNewVariant({
      ...newVariant,
      hinh_anh: newVariant.hinh_anh.filter((_, i) => i !== index),
    });
  };

  const addVariant = () => {
    setError(null);
    setSuccess(null);

    if (!newVariant.ten_mau_sac?.trim())
      return setError("Vui lòng chọn màu sắc.");
    if (!newVariant.ten_kich_thuoc?.trim())
      return setError("Vui lòng chọn kích thước.");
    if (newVariant.gia_ban <= 0) return setError("Giá bán phải lớn hơn 0.");
    if (newVariant.so_luong_ton < 0)
      return setError("Số lượng tồn phải lớn hơn hoặc bằng 0.");
    if (!newVariant.hinh_anh.length)
      return setError("Biến thể phải có ít nhất một ảnh.");
    if (!newVariant.hex_code?.trim())
      return setError("Mã màu (hex_code) không hợp lệ.");

    const variantForState: Variant = {
      ten_mau_sac: newVariant.ten_mau_sac,
      hex_code: newVariant.hex_code,
      ten_kich_thuoc: newVariant.ten_kich_thuoc,
      gia_ban: newVariant.gia_ban.toString(), // Chuyển number thành string
      so_luong_ton: newVariant.so_luong_ton,
      trang_thai_hoat_dong_btsp: newVariant.trang_thai_hoat_dong_btsp,
      hinh_anh: newVariant.hinh_anh,
    };

    setNewProduct({
      ...newProduct,
      bienthe: [...newProduct.bienthe, variantForState],
    });
    setNewVariant(initialVariantState);
    setSelectedColor("");
    setSelectedSize("");
    setSuccess("Thêm biến thể thành công!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const removeVariant = (index: number) => {
    setNewProduct({
      ...newProduct,
      bienthe: newProduct.bienthe.filter((_, i) => i !== index),
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedColorName = e.target.value;
    const selectedColorObject = colors.find(
      (c) => c.ten_mau_sac === selectedColorName
    );
    setSelectedColor(selectedColorName);
    setNewVariant({
      ...newVariant,
      ten_mau_sac: selectedColorName,
      hex_code: selectedColorObject ? selectedColorObject.hex_code : "",
    });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSizeName = e.target.value;
    setSelectedSize(selectedSizeName);
    setNewVariant({
      ...newVariant,
      ten_kich_thuoc: selectedSizeName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Kiểm tra dữ liệu sản phẩm
    if (!newProduct.ten_san_pham?.trim())
      return setError("Vui lòng nhập tên sản phẩm.");
    if (!newProduct.thuong_hieu?.trim())
      return setError("Vui lòng nhập thương hiệu.");
    if (!newProduct.mo_ta_ngan?.trim())
      return setError("Vui lòng nhập mô tả ngắn.");
    if (!newProduct.chat_lieu?.trim())
      return setError("Vui lòng nhập chất liệu.");
    if (!newProduct.ten_danh_muc?.trim())
      return setError("Vui lòng chọn danh mục.");
    if (!newProduct.bienthe.length)
      return setError("Sản phẩm phải có ít nhất một biến thể.");

    // Kiểm tra dữ liệu biến thể
    for (let i = 0; i < newProduct.bienthe.length; i++) {
      const variant = newProduct.bienthe[i];
      if (!variant.ten_mau_sac?.trim()) {
        return setError(`Biến thể ${i + 1}: Vui lòng cung cấp tên màu sắc.`);
      }
      if (!variant.ten_kich_thuoc?.trim()) {
        return setError(`Biến thể ${i + 1}: Vui lòng cung cấp kích thước.`);
      }
      if (!variant.hex_code?.trim()) {
        return setError(
          `Biến thể ${i + 1}: Vui lòng cung cấp mã màu (hex_code).`
        );
      }
      if (!variant.gia_ban || parseFloat(variant.gia_ban) <= 0) {
        return setError(`Biến thể ${i + 1}: Giá bán phải lớn hơn 0.`);
      }
      if (variant.so_luong_ton < 0) {
        return setError(
          `Biến thể ${i + 1}: Số lượng tồn phải lớn hơn hoặc bằng 0.`
        );
      }
      if (!variant.hinh_anh.length) {
        return setError(`Biến thể ${i + 1}: Phải có ít nhất một ảnh.`);
      }
    }

    // Tạo productForApi với định dạng InputProduct
    const productForApi: Omit<
      Product,
      "ma_san_pham" | "ngay_tao" | "ngay_cap_nhat"
    > = {
      ten_san_pham: newProduct.ten_san_pham,
      thuong_hieu: newProduct.thuong_hieu,
      mo_ta_ngan: newProduct.mo_ta_ngan,
      chat_lieu: newProduct.chat_lieu,
      trang_thai_hoat_dong: newProduct.trang_thai_hoat_dong,
      ma_khuyen_mai: newProduct.ma_khuyen_mai,
      ten_danh_muc: newProduct.ten_danh_muc,
      bienthe: newProduct.bienthe.map((v) => ({
        ten_mau_sac: v.ten_mau_sac,
        hex_code: v.hex_code,
        ten_kich_thuoc: v.ten_kich_thuoc,
        gia_ban: v.gia_ban.toString(), // Chuyển number thành string cho API
        so_luong_ton: v.so_luong_ton,
        trang_thai_hoat_dong_btsp: v.trang_thai_hoat_dong_btsp,
        hinh_anh: v.hinh_anh,
      })),
    };

    try {
      const response = await addProduct(productForApi);
      console.log("Thêm sản phẩm thành công:", response);
      setSuccess("Thêm sản phẩm thành công!");
      setNewProduct({
        ten_san_pham: "",
        thuong_hieu: "",
        mo_ta_ngan: "",
        chat_lieu: "",
        trang_thai_hoat_dong: "hoat_dong",
        ma_khuyen_mai: null,
        ten_danh_muc: "",
        bienthe: [],
      });
      setNewVariant(initialVariantState);
      setSelectedColor("");
      setSelectedSize("");
      setActiveTab("product");
    } catch (error: any) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      setError(error.message || "Lỗi khi thêm sản phẩm.");
    }
  };

  // Thêm hàm xử lý sắp xếp lại ảnh:
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(newVariant.hinh_anh);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setNewVariant({ ...newVariant, hinh_anh: reordered });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md mb-6 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Thêm Sản Phẩm Mới
              </h1>
              <p className="text-gray-500 mt-1">
                Tạo và quản lý sản phẩm của bạn một cách dễ dàng
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("product")}
              className={`flex-1 p-4 text-center font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${
                activeTab === "product"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Package className="w-5 h-5" />
              Thông Tin Sản Phẩm
            </button>
            <button
              onClick={() => setActiveTab("variants")}
              className={`flex-1 p-4 text-center font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${
                activeTab === "variants"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Tag className="w-5 h-5" />
              Biến Thể ({newProduct.bienthe.length})
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {activeTab === "product" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Thông Tin Cơ Bản
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4" />
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      value={newProduct.ten_san_pham}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          ten_san_pham: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="VD: Áo Thun Cổ Tròn"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Building2 className="w-4 h-4" />
                      Thương hiệu
                    </label>
                    <input
                      type="text"
                      value={newProduct.thuong_hieu}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          thuong_hieu: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="VD: Coolmate"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4" />
                      Mô tả ngắn
                    </label>
                    <textarea
                      value={newProduct.mo_ta_ngan}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          mo_ta_ngan: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Mô tả ngắn về sản phẩm..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Tag className="w-4 h-4" />
                      Chất liệu
                    </label>
                    <input
                      type="text"
                      value={newProduct.chat_lieu}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          chat_lieu: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="VD: 100% Cotton"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Package className="w-4 h-4" />
                      Danh mục
                    </label>
                    <select
                      value={newProduct.ten_danh_muc ?? ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          ten_danh_muc: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("variants")}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Tiếp Theo: Thêm Biến Thể
                  </button>
                </div>
              </div>
            )}

            {activeTab === "variants" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Thêm Biến Thể Mới
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Palette className="w-4 h-4" />
                        Màu sắc
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedColor}
                          onChange={handleColorChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn màu</option>
                          {colors.map((color, index) => (
                            <option key={index} value={color.ten_mau_sac}>
                              {color.ten_mau_sac}
                            </option>
                          ))}
                        </select>
                        {newVariant.hex_code && (
                          <div
                            className="w-10 h-10 rounded-md border border-gray-300"
                            style={{ backgroundColor: newVariant.hex_code }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Ruler className="w-4 h-4" />
                        Kích thước
                      </label>
                      <select
                        value={selectedSize}
                        onChange={handleSizeChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Chọn size</option>
                        {sizes.map((size, index) => (
                          <option key={index} value={size.ten_kich_thuoc}>
                            {size.ten_kich_thuoc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <DollarSign className="w-4 h-4" />
                        Giá bán (VND)
                      </label>
                      <input
                        type="number"
                        value={newVariant.gia_ban}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            gia_ban: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Hash className="w-4 h-4" />
                        Số lượng tồn
                      </label>
                      <input
                        type="number"
                        value={newVariant.so_luong_ton}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            so_luong_ton: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Upload className="w-4 h-4" />
                        Upload ảnh
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                      />
                      {uploading && (
                        <div className="flex items-center gap-2 text-blue-600 mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Đang upload...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {newVariant.hinh_anh.length > 0 && (
                    <div className="mb-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Image className="w-4 h-4" />
                        Ảnh đã chọn ({newVariant.hinh_anh.length})
                      </label>
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                          {(provided) => (
                            <div
                              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {newVariant.hinh_anh.map((img, index) => (
                                <Draggable
                                  key={img}
                                  draggableId={img}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`relative group aspect-square ${
                                        snapshot.isDragging
                                          ? "ring-2 ring-blue-400"
                                          : ""
                                      }`}
                                    >
                                      <img
                                        src={img}
                                        alt={`variant-${index}`}
                                        className="w-full h-full object-cover rounded-md border border-gray-300"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={uploading}
                    className="w-full mt-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    Thêm Biến Thể
                  </button>
                </div>

                {newProduct.bienthe.length > 0 && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Danh Sách Biến Thể
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {newProduct.bienthe.map((variant, index) => (
                        <div
                          key={index}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-lg border border-gray-200 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${variant.hinh_anh[0]})`,
                              }}
                            />
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {variant.ten_mau_sac} - {variant.ten_kich_thuoc}
                              </h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {parseFloat(
                                    variant.gia_ban
                                  ).toLocaleString()}{" "}
                                  VND
                                </span>
                                <span className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  {variant.so_luong_ton} sản phẩm
                                </span>
                                <span className="flex items-center gap-1">
                                  <Palette className="w-3 h-3" />
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{
                                      backgroundColor: variant.hex_code,
                                    }}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab("product")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold w-full sm:w-auto"
                  >
                    ← Quay Lại
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || newProduct.bienthe.length === 0}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Hoàn Tất & Thêm Sản Phẩm
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
