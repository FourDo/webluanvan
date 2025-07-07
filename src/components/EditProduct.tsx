import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import _ from "lodash";
import {
  getProductById,
  updateProduct,
  addVariant as apiAddVariant,
  updateVariant as apiUpdateVariant,
  deleteVariant as apiDeleteVariant,
} from "../API/productApi";
import categoryApi from "../API/categoryApi";
import { fetchColors } from "../API/colorApi";
import { fetchSizes } from "../API/sizeApi";
import type {
  Product,
  ProductForEdit,
  VariantForEdit,
  InputVariant,
} from "../types/Product";
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
  Trash2,
  Save,
  Loader2,
  Edit2,
} from "lucide-react";

interface Color {
  ten_mau_sac: string;
  hex_code: string;
}
interface Size {
  ten_kich_thuoc: string;
}

const EditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductForEdit | null>(null);
  const [originalProduct, setOriginalProduct] = useState<ProductForEdit | null>(
    null
  );
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);
  const [isAddingVariant, setIsAddingVariant] = useState<boolean>(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null
  );
  const [editingVariant, setEditingVariant] = useState<InputVariant | null>(
    null
  );

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
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"product" | "variants">("product");

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setError("Không tìm thấy ID sản phẩm.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const productFromApi: Product = await getProductById(Number(productId));
        const productDataForEdit: ProductForEdit = {
          ...productFromApi,
          ten_danh_muc: productFromApi.ten_danh_muc ?? "",
          bienthe:
            productFromApi.bienthe?.map((v: any) => ({
              ma_bien_the_san_pham: v.ma_bien_the_san_pham ?? v.id,
              ten_mau_sac: v.ten_mau_sac ?? "",
              hex_code: v.hex_code ?? "",
              ten_kich_thuoc: v.ten_kich_thuoc ?? "",
              gia_ban: Number(v.gia_ban) || 0,
              so_luong_ton: Number(v.so_luong_ton) || 0,
              trang_thai_hoat_dong_btsp:
                v.trang_thai_hoat_dong_btsp ?? "hoat_dong",
              hinh_anh: Array.isArray(v.hinh_anh) ? v.hinh_anh : [],
            })) ?? [],
        };

        setProduct(productDataForEdit);
        setOriginalProduct(_.cloneDeep(productDataForEdit));

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
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  // Thêm hoặc cập nhật biến thể
  const addOrUpdateVariant = () => {
    if (!product) return;
    setError(null);
    setSuccess(null);

    const variantToProcess = editingVariant || newVariant;

    // Validate dữ liệu
    if (!variantToProcess.ten_mau_sac?.trim()) {
      return setError("Vui lòng chọn màu sắc.");
    }
    if (!variantToProcess.ten_kich_thuoc?.trim()) {
      return setError("Vui lòng chọn kích thước.");
    }
    if (variantToProcess.gia_ban <= 0) {
      return setError("Giá bán phải lớn hơn 0.");
    }
    if (variantToProcess.so_luong_ton < 0) {
      return setError("Số lượng tồn phải lớn hơn hoặc bằng 0.");
    }
    if (!variantToProcess.hinh_anh.length) {
      return setError("Biến thể phải có ít nhất một ảnh.");
    }
    if (!variantToProcess.hex_code?.trim()) {
      return setError("Mã màu (hex_code) không hợp lệ.");
    }

    const variantToAdd: VariantForEdit = {
      ma_bien_the_san_pham: editingVariant
        ? product.bienthe[editingVariantIndex!].ma_bien_the_san_pham
        : undefined,
      ten_mau_sac: variantToProcess.ten_mau_sac,
      hex_code: variantToProcess.hex_code,
      ten_kich_thuoc: variantToProcess.ten_kich_thuoc,
      gia_ban: Number(variantToProcess.gia_ban),
      so_luong_ton: variantToProcess.so_luong_ton,
      trang_thai_hoat_dong_btsp: variantToProcess.trang_thai_hoat_dong_btsp,
      hinh_anh: variantToProcess.hinh_anh,
    };

    if (editingVariantIndex !== null) {
      // Cập nhật biến thể
      const updatedVariants = [...product.bienthe];
      updatedVariants[editingVariantIndex] = variantToAdd;
      setProduct({
        ...product,
        bienthe: updatedVariants,
      });
      setSuccess("Cập nhật biến thể thành công!");
    } else {
      // Thêm biến thể mới
      setProduct({
        ...product,
        bienthe: [...product.bienthe, variantToAdd],
      });
      setSuccess("Thêm biến thể thành công!");
    }

    // Reset form
    setNewVariant(initialVariantState);
    setEditingVariant(null);
    setEditingVariantIndex(null);
    setIsAddingVariant(false);
    setSelectedColor("");
    setSelectedSize("");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Xóa biến thể
  const removeVariant = (index: number) => {
    if (!product) return;
    const variant = product.bienthe[index];
    if (variant.ma_bien_the_san_pham) {
      setDeletedVariantIds((prev) => [...prev, variant.ma_bien_the_san_pham!]);
    }
    setProduct({
      ...product,
      bienthe: product.bienthe.filter((_, i) => i !== index),
    });
  };

  // Bắt đầu chỉnh sửa biến thể
  const startEditingVariant = (index: number) => {
    if (!product) return;
    const variant = product.bienthe[index];
    setEditingVariant({
      ten_mau_sac: variant.ten_mau_sac,
      hex_code: variant.hex_code,
      ten_kich_thuoc: variant.ten_kich_thuoc,
      gia_ban: variant.gia_ban,
      so_luong_ton: variant.so_luong_ton,
      trang_thai_hoat_dong_btsp: variant.trang_thai_hoat_dong_btsp,
      hinh_anh: variant.hinh_anh,
    });
    setEditingVariantIndex(index);
    setSelectedColor(variant.ten_mau_sac);
    setSelectedSize(variant.ten_kich_thuoc);
    setIsAddingVariant(true);
  };

  // Upload ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
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
      const targetVariant = editingVariant || newVariant;
      setEditingVariant(
        editingVariant
          ? {
              ...editingVariant,
              hinh_anh: [...editingVariant.hinh_anh, ...newImages],
            }
          : null
      );
      setNewVariant({
        ...newVariant,
        hinh_anh: [...targetVariant.hinh_anh, ...newImages],
      });
    } catch (error) {
      setError("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedColorName = e.target.value;
    const selectedColorObject = colors.find(
      (c) => c.ten_mau_sac === selectedColorName
    );
    setSelectedColor(selectedColorName);
    const targetVariant = editingVariant || newVariant;
    const updatedVariant = {
      ...targetVariant,
      ten_mau_sac: selectedColorName,
      hex_code: selectedColorObject ? selectedColorObject.hex_code : "",
    };
    setEditingVariant(editingVariant ? updatedVariant : null);
    setNewVariant(updatedVariant);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSizeName = e.target.value;
    setSelectedSize(selectedSizeName);
    const targetVariant = editingVariant || newVariant;
    const updatedVariant = {
      ...targetVariant,
      ten_kich_thuoc: selectedSizeName,
    };
    setEditingVariant(editingVariant ? updatedVariant : null);
    setNewVariant(updatedVariant);
  };

  const removeImage = (index: number) => {
    const targetVariant = editingVariant || newVariant;
    const updatedImages = targetVariant.hinh_anh.filter((_, i) => i !== index);
    setEditingVariant(
      editingVariant ? { ...editingVariant, hinh_anh: updatedImages } : null
    );
    setNewVariant({
      ...newVariant,
      hinh_anh: updatedImages,
    });
  };

  // Hủy chỉnh sửa hoặc thêm biến thể
  const cancelVariantForm = () => {
    setIsAddingVariant(false);
    setEditingVariant(null);
    setEditingVariantIndex(null);
    setNewVariant(initialVariantState);
    setSelectedColor("");
    setSelectedSize("");
  };

  // Submit cập nhật sản phẩm và các biến thể
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !product || !originalProduct) {
      setError("Dữ liệu sản phẩm không hợp lệ.");
      return;
    }
    setError(null);
    setSuccess(null);

    if (!product.ten_san_pham?.trim()) {
      return setError("Vui lòng nhập tên sản phẩm.");
    }
    if (!product.thuong_hieu?.trim()) {
      return setError("Vui lòng nhập thương hiệu.");
    }
    if (!product.ten_danh_muc?.trim()) {
      return setError("Vui lòng chọn danh mục.");
    }
    if (!product.bienthe.length) {
      return setError("Sản phẩm phải có ít nhất một biến thể.");
    }

    const { bienthe, ...productMain } = product;
    try {
      console.log("productMain gửi lên:", productMain);
      console.log("Tên danh mục gửi lên:", product.ten_danh_muc, "|");
      await updateProduct(Number(productId), {
        ...product,
        // Không cần truyền ma_danh_muc nếu backend không yêu cầu
      });

      const promises: Promise<any>[] = [];

      for (const variant of product.bienthe) {
        const variantDataPayload: InputVariant = {
          ten_mau_sac: variant.ten_mau_sac,
          hex_code: variant.hex_code,
          ten_kich_thuoc: variant.ten_kich_thuoc,
          gia_ban: Number(variant.gia_ban),
          so_luong_ton: variant.so_luong_ton,
          trang_thai_hoat_dong_btsp: variant.trang_thai_hoat_dong_btsp,
          hinh_anh: variant.hinh_anh,
        };
        if (!variant.ma_bien_the_san_pham) {
          promises.push(apiAddVariant(Number(productId), variantDataPayload));
        } else {
          const originalVariant = originalProduct.bienthe.find(
            (v) => v.ma_bien_the_san_pham === variant.ma_bien_the_san_pham
          );
          if (originalVariant && !_.isEqual(variant, originalVariant)) {
            promises.push(
              apiUpdateVariant(variant.ma_bien_the_san_pham, variantDataPayload)
            );
          }
        }
      }

      for (const variantId of deletedVariantIds) {
        promises.push(apiDeleteVariant(variantId));
      }

      await Promise.all(promises);

      setSuccess("Cập nhật sản phẩm thành công!");
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Lỗi khi cập nhật sản phẩm.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl text-gray-700">
          Đang tải dữ liệu sản phẩm...
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800">
            Không thể tải sản phẩm
          </h2>
          <p className="text-red-700 mt-2">
            {error || "Sản phẩm không tồn tại hoặc có lỗi xảy ra."}
          </p>
          <button
            onClick={() => navigate("/admin/products")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay về danh sách
          </button>
        </div>
      </div>
    );
  }

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
                Chỉnh Sửa Sản Phẩm
              </h1>
              <p className="text-gray-500 mt-1">
                Cập nhật thông tin chi tiết cho sản phẩm:{" "}
                <span className="font-semibold text-gray-700">
                  {product.ten_san_pham}
                </span>
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
              Biến Thể ({product.bienthe.length})
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {activeTab === "product" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4" />
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      value={product.ten_san_pham}
                      onChange={(e) =>
                        setProduct({ ...product, ten_san_pham: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      value={product.thuong_hieu}
                      onChange={(e) =>
                        setProduct({ ...product, thuong_hieu: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4" />
                      Mô tả ngắn
                    </label>
                    <textarea
                      value={product.mo_ta_ngan}
                      onChange={(e) =>
                        setProduct({ ...product, mo_ta_ngan: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
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
                      value={product.chat_lieu}
                      onChange={(e) =>
                        setProduct({ ...product, chat_lieu: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Package className="w-4 h-4" />
                      Danh mục
                    </label>
                    <select
                      value={product.ten_danh_muc ?? ""}
                      onChange={(e) =>
                        setProduct({ ...product, ten_danh_muc: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                  >
                    Tiếp Theo: Chỉnh Sửa Biến Thể
                  </button>
                </div>
              </div>
            )}
            {activeTab === "variants" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingVariant(true);
                      setEditingVariant(null);
                      setEditingVariantIndex(null);
                      setNewVariant(initialVariantState);
                      setSelectedColor("");
                      setSelectedSize("");
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Thêm Biến Thể Mới
                  </button>

                  {isAddingVariant && (
                    <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {editingVariantIndex !== null ? (
                          <>
                            <Edit2 className="w-5 h-5" />
                            Chỉnh Sửa Biến Thể
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Thêm Biến Thể Mới
                          </>
                        )}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Palette className="w-4 h-4" />
                            Màu sắc
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={
                                editingVariant
                                  ? editingVariant.ten_mau_sac
                                  : selectedColor
                              }
                              onChange={handleColorChange}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Chọn màu</option>
                              {colors.map((color, index) => (
                                <option key={index} value={color.ten_mau_sac}>
                                  {color.ten_mau_sac}
                                </option>
                              ))}
                            </select>
                            {(editingVariant?.hex_code ||
                              newVariant.hex_code) && (
                              <div
                                className="w-10 h-10 rounded-md border border-gray-300"
                                style={{
                                  backgroundColor:
                                    editingVariant?.hex_code ||
                                    newVariant.hex_code,
                                }}
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
                            value={
                              editingVariant
                                ? editingVariant.ten_kich_thuoc
                                : selectedSize
                            }
                            onChange={handleSizeChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                            value={
                              editingVariant
                                ? editingVariant.gia_ban
                                : newVariant.gia_ban
                            }
                            onChange={(e) => {
                              const updatedVariant = {
                                ...(editingVariant || newVariant),
                                gia_ban: Number(e.target.value),
                              };
                              setEditingVariant(
                                editingVariant ? updatedVariant : null
                              );
                              setNewVariant(updatedVariant);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                            value={
                              editingVariant
                                ? editingVariant.so_luong_ton
                                : newVariant.so_luong_ton
                            }
                            onChange={(e) => {
                              const updatedVariant = {
                                ...(editingVariant || newVariant),
                                so_luong_ton: Number(e.target.value),
                              };
                              setEditingVariant(
                                editingVariant ? updatedVariant : null
                              );
                              setNewVariant(updatedVariant);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                          {(editingVariant?.hinh_anh.length ||
                            newVariant.hinh_anh.length) > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(
                                editingVariant?.hinh_anh || newVariant.hinh_anh
                              ).map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={image}
                                    alt={`Preview ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4">
                        <button
                          type="button"
                          onClick={addOrUpdateVariant}
                          disabled={uploading}
                          className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {editingVariantIndex !== null ? (
                            <>
                              <Save className="w-5 h-5" />
                              Lưu Biến Thể
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              Thêm Biến Thể
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelVariantForm}
                          className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {product.bienthe.length > 0 && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Danh Sách Biến Thể
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {product.bienthe.map((variant, index) => (
                        <div
                          key={index}
                          className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-lg border bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${variant.hinh_anh[0] || "/fallback-image.jpg"})`,
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
                                    variant.gia_ban.toString()
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
                                    className="w-4 h-4 rounded-full border"
                                    style={{
                                      backgroundColor: variant.hex_code,
                                    }}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditingVariant(index)}
                              className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab("product")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold w-full sm:w-auto"
                  >
                    ← Quay Lại
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || product.bienthe.length === 0}
                    className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    Lưu Thay Đổi
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

export default EditProduct;
