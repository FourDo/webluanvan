import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableImage } from "./SortableImage";
import RichTextEditor from "./RichTextEditor";
import { productApi } from "../API/productApi";
import categoryApi from "../API/categoryApi";
import { colorApi } from "../API/colorApi";
import { sizeApi } from "../API/sizeApi";
import type { ProductForEdit, VariantForEdit } from "../types/Product";
import {
  ArrowLeft,
  Save,
  Image,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";

interface Color {
  ten_mau_sac: string;
  hex_code: string;
}

interface Size {
  ten_kich_thuoc: string;
}

interface InputVariant {
  ten_mau_sac: string;
  hex_code: string;
  ten_kich_thuoc: string;
  gia_ban: number;
  so_luong_ton: number;
  trang_thai_hoat_dong_btsp: string;
  hinh_anh: string[];
}

const EditProductEnhanced: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [product, setProduct] = useState<ProductForEdit | null>(null);
  const [originalProduct, setOriginalProduct] = useState<ProductForEdit | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState<VariantForEdit | null>(
    null
  );
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null
  );
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);
  const [newVariant, setNewVariant] = useState<VariantForEdit>({
    ten_mau_sac: "",
    hex_code: "",
    ten_kich_thuoc: "",
    gia_ban: 0,
    gia_khuyen_mai: null,
    phan_tram_giam: null,
    so_luong_ton: 0,
    trang_thai_hoat_dong_btsp: "hoat_dong",
    hinh_anh: [],
  });

  const initialVariantState: VariantForEdit = {
    ten_mau_sac: "",
    hex_code: "",
    ten_kich_thuoc: "",
    gia_ban: 0,
    gia_khuyen_mai: null,
    phan_tram_giam: null,
    so_luong_ton: 0,
    trang_thai_hoat_dong_btsp: "hoat_dong",
    hinh_anh: [],
  };

  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"product" | "variants">("product");
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchInitialData();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, colorsRes, sizesRes] = await Promise.all([
        categoryApi.getAll(),
        colorApi.fetchColors(),
        sizeApi.fetchSizes(),
      ]);

      setCategories(categoriesRes.data.map((cat: any) => cat.ten_danh_muc));
      setColors(colorsRes);
      setSizes(sizesRes);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Lỗi khi tải dữ liệu ban đầu");
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProductById(Number(productId));
      const productForEdit: ProductForEdit = {
        ...response,
        bienthe: response.bienthe.map((variant) => ({
          ...variant,
          ma_bien_the: variant.ma_bien_the, // Mapping đúng field name từ API
          gia_ban: parseFloat(variant.gia_ban),
          gia_khuyen_mai: variant.gia_khuyen_mai
            ? parseFloat(variant.gia_khuyen_mai)
            : null,
          trang_thai_hoat_dong_btsp:
            variant.trang_thai_hoat_dong_btsp || "hoat_dong",
        })),
      };
      setProduct(productForEdit);
      setOriginalProduct(JSON.parse(JSON.stringify(productForEdit))); // Deep copy
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Lỗi khi tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // AI Generate Description
  const generateAIDescription = async () => {
    if (!product?.ten_san_pham?.trim()) {
      setError("Vui lòng nhập tên sản phẩm trước khi tạo mô tả AI!");
      return;
    }

    setAiGenerating(true);
    setError(null);
    try {
      const response = await axios.post(
        "https://luanvan-7wv1.onrender.com/api/ai/generate",
        {
          ten_san_pham: product.ten_san_pham,
          thuong_hieu: product.thuong_hieu,
          chat_lieu: product.chat_lieu,
        },
        {
          timeout: 30000, // 30 seconds timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.mo_ta) {
        setProduct({
          ...product,
          mo_ta_ngan: response.data.mo_ta,
        });
        setSuccess("Đã tạo mô tả sản phẩm bằng AI thành công!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("API không trả về mô tả sản phẩm. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error generating AI description:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message =
            error.response.data?.message ||
            error.response.data?.error ||
            "Unknown server error";

          switch (status) {
            case 500:
              setError(
                `Lỗi server (500): ${message}. Kiểm tra server AI và API key.`
              );
              break;
            case 404:
              setError("API endpoint không tồn tại. Kiểm tra đường dẫn API.");
              break;
            case 400:
              setError(`Dữ liệu không hợp lệ: ${message}`);
              break;
            default:
              setError(`Lỗi API (${status}): ${message}`);
          }
        } else if (error.request) {
          // Network error
          setError(
            "Không thể kết nối đến server AI. Kiểm tra server có đang chạy tại http://127.0.0.1:8000"
          );
        } else {
          setError(`Lỗi khi gửi request: ${error.message}`);
        }
      } else {
        setError("Lỗi không xác định khi tạo mô tả sản phẩm bằng AI!");
      }
    } finally {
      setAiGenerating(false);
    }
  };

  // Image upload handler
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

  // Drag and drop handler for add variant images
  const handleAddVariantImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeIndex = parseInt(
        active.id.toString().replace("add-variant-image-", "")
      );
      const overIndex = parseInt(
        over.id.toString().replace("add-variant-image-", "")
      );

      if (!isNaN(activeIndex) && !isNaN(overIndex)) {
        setNewVariant({
          ...newVariant,
          hinh_anh: arrayMove(newVariant.hinh_anh, activeIndex, overIndex),
        });
      }
    }
  };

  // Drag and drop handler for edit variant images
  const handleEditVariantImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && editingVariant) {
      const activeIndex = parseInt(
        active.id.toString().replace("edit-variant-image-", "")
      );
      const overIndex = parseInt(
        over.id.toString().replace("edit-variant-image-", "")
      );

      if (!isNaN(activeIndex) && !isNaN(overIndex)) {
        setEditingVariant({
          ...editingVariant,
          hinh_anh: arrayMove(editingVariant.hinh_anh, activeIndex, overIndex),
        });
      }
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    if (editingVariant) {
      // If we're editing a variant, only update editingVariant
      const updatedImages = editingVariant.hinh_anh.filter(
        (_, i) => i !== index
      );
      setEditingVariant({
        ...editingVariant,
        hinh_anh: updatedImages,
      });
    } else {
      // If we're adding a new variant, only update newVariant
      const updatedImages = newVariant.hinh_anh.filter((_, i) => i !== index);
      setNewVariant({
        ...newVariant,
        hinh_anh: updatedImages,
      });
    }
  };

  // Add or update variant (from user's code)
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
      ma_bien_the:
        editingVariantIndex !== null
          ? product.bienthe[editingVariantIndex].ma_bien_the
          : undefined,
      ten_mau_sac: variantToProcess.ten_mau_sac,
      hex_code: variantToProcess.hex_code,
      ten_kich_thuoc: variantToProcess.ten_kich_thuoc,
      gia_ban: Number(variantToProcess.gia_ban),
      gia_khuyen_mai: variantToProcess.gia_khuyen_mai,
      phan_tram_giam: variantToProcess.phan_tram_giam,
      so_luong_ton: variantToProcess.so_luong_ton,
      trang_thai_hoat_dong_btsp: variantToProcess.trang_thai_hoat_dong_btsp,
      hinh_anh: variantToProcess.hinh_anh,
    };
    if (editingVariantIndex !== null) {
      const updatedVariants = [...product.bienthe];
      updatedVariants[editingVariantIndex] = variantToAdd;
      setProduct({
        ...product,
        bienthe: updatedVariants,
      });
      setSuccess("Cập nhật biến thể thành công!");
    } else {
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
    setTimeout(() => setSuccess(null), 3000);
  };

  // Xóa biến thể
  const removeVariant = (index: number) => {
    if (!product) return;
    const variant = product.bienthe[index];
    if (variant.ma_bien_the) {
      setDeletedVariantIds((prev) => [...prev, variant.ma_bien_the!]);
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
      gia_khuyen_mai: variant.gia_khuyen_mai,
      phan_tram_giam: variant.phan_tram_giam,
      so_luong_ton: variant.so_luong_ton,
      trang_thai_hoat_dong_btsp: variant.trang_thai_hoat_dong_btsp,
      hinh_anh: variant.hinh_anh,
    });
    setEditingVariantIndex(index);
    setIsAddingVariant(false); // Đảm bảo không hiển thị form thêm
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedColorName = e.target.value;
    const selectedColorObject = colors.find(
      (c) => c.ten_mau_sac === selectedColorName
    );
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
    const targetVariant = editingVariant || newVariant;
    const updatedVariant = {
      ...targetVariant,
      ten_kich_thuoc: selectedSizeName,
    };
    setEditingVariant(editingVariant ? updatedVariant : null);
    setNewVariant(updatedVariant);
  };

  // Hủy chỉnh sửa hoặc thêm biến thể
  const cancelVariantForm = () => {
    setIsAddingVariant(false);
    setEditingVariant(null);
    setEditingVariantIndex(null);
    setNewVariant(initialVariantState);
  };

  // Submit cập nhật sản phẩm và các biến thể
  const handleSubmit = async () => {
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
    setIsSubmitting(true);
    try {
      await productApi.updateProduct(Number(productId), productMain);

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
        if (variant.ma_bien_the === undefined || variant.ma_bien_the === null) {
          promises.push(
            productApi.addVariant(Number(productId), variantDataPayload)
          );
        } else {
          const originalVariant = originalProduct.bienthe.find(
            (v) => v.ma_bien_the === variant.ma_bien_the
          );
          if (originalVariant) {
            if (!isEqual(variant, originalVariant)) {
              promises.push(
                productApi.updateVariant(
                  variant.ma_bien_the,
                  variantDataPayload
                )
              );
            }
          } else {
            promises.push(
              productApi.addVariant(Number(productId), variantDataPayload)
            );
          }
        }
      }

      // Xóa các biến thể đã bị xóa
      for (const variantId of deletedVariantIds) {
        promises.push(productApi.deleteVariant(variantId));
      }

      await Promise.all(promises);

      setSuccess("Cập nhật sản phẩm thành công!");
      setTimeout(() => {
        navigate("/admin/sanpham");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Lỗi khi cập nhật sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function for deep comparison
  const isEqual = (obj1: any, obj2: any): boolean => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600 mb-4">
            Sản phẩm có thể đã bị xóa hoặc không tồn tại.
          </p>
          <button
            onClick={() => navigate("/admin/sanpham")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/ql-san-pham")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Chỉnh sửa sản phẩm
                </h1>
                <p className="text-sm text-gray-500">{product.ten_san_pham}</p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle2 size={16} />
                <span className="text-sm">{success}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit All Button */}
            <button
              onClick={handleSubmit}
              disabled={uploading || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu tất cả thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "product" && (
              <>
                {/* Basic Product Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin cơ bản
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên sản phẩm *
                      </label>
                      <input
                        type="text"
                        value={product.ten_san_pham}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            ten_san_pham: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thương hiệu *
                      </label>
                      <input
                        type="text"
                        value={product.thuong_hieu}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            thuong_hieu: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Mô tả sản phẩm *
                        </label>
                        <button
                          type="button"
                          onClick={generateAIDescription}
                          disabled={
                            aiGenerating || !product.ten_san_pham?.trim()
                          }
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <Sparkles
                            size={16}
                            className={aiGenerating ? "animate-spin" : ""}
                          />
                          {aiGenerating ? "Đang tạo..." : "AI Generate"}
                        </button>
                      </div>
                      <RichTextEditor
                        value={product.mo_ta_ngan}
                        onChange={(value) =>
                          setProduct({ ...product, mo_ta_ngan: value })
                        }
                        placeholder="Mô tả chi tiết về sản phẩm..."
                        height="200px"
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Sử dụng editor để định dạng mô tả sản phẩm với HTML hoặc
                        nhấn nút AI Generate để tự động tạo mô tả.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chất liệu *
                        </label>
                        <input
                          type="text"
                          value={product.chat_lieu}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              chat_lieu: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Danh mục *
                        </label>
                        <select
                          value={product.ten_danh_muc || ""}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              ten_danh_muc: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((category, index) => (
                            <option
                              key={`category-${category}-${index}`}
                              value={category}
                            >
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "variants" && (
              <>
                {/* Variants Management */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quản lý biến thể ({product.bienthe.length})
                      </h3>
                      <button
                        onClick={() => setIsAddingVariant(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Thêm biến thể mới
                      </button>
                    </div>
                  </div>

                  {/* Add New Variant Form */}
                  {isAddingVariant && !editingVariant && (
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Thêm biến thể mới
                      </h4>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Màu sắc *
                            </label>
                            <select
                              value={newVariant.ten_mau_sac}
                              onChange={(e) => handleColorChange(e)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Chọn màu sắc</option>
                              {colors.map((color, index) => (
                                <option
                                  key={`add-color-${color.ten_mau_sac}-${index}`}
                                  value={color.ten_mau_sac}
                                >
                                  {color.ten_mau_sac}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kích thước *
                            </label>
                            <select
                              value={newVariant.ten_kich_thuoc}
                              onChange={handleSizeChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Chọn kích thước</option>
                              {sizes.map((size, index) => (
                                <option
                                  key={`add-size-${size.ten_kich_thuoc}-${index}`}
                                  value={size.ten_kich_thuoc}
                                >
                                  {size.ten_kich_thuoc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Giá bán *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newVariant.gia_ban}
                              onChange={(e) =>
                                setNewVariant({
                                  ...newVariant,
                                  gia_ban: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số lượng tồn *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newVariant.so_luong_ton}
                              onChange={(e) =>
                                setNewVariant({
                                  ...newVariant,
                                  so_luong_ton: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh biến thể *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                              <label className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-500">
                                  Tải ảnh lên
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  disabled={uploading}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>

                          {/* Image Preview with Drag & Drop */}
                          {newVariant.hinh_anh.length > 0 && (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleAddVariantImageDragEnd}
                            >
                              <SortableContext
                                items={newVariant.hinh_anh.map(
                                  (_, index) => `add-variant-image-${index}`
                                )}
                                strategy={horizontalListSortingStrategy}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                  {newVariant.hinh_anh.map((image, index) => (
                                    <SortableImage
                                      key={`add-variant-image-${index}`}
                                      id={`add-variant-image-${index}`}
                                      image={image}
                                      index={index}
                                      onRemove={removeImage}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={addOrUpdateVariant}
                            disabled={uploading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save size={16} />
                            Lưu biến thể
                          </button>
                          <button
                            onClick={cancelVariantForm}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Variant Form */}
                  {editingVariant && (
                    <div className="p-6 border-b border-gray-200 bg-blue-50">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Chỉnh sửa biến thể: {editingVariant.ten_mau_sac} -{" "}
                        {editingVariant.ten_kich_thuoc}
                      </h4>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Màu sắc *
                            </label>
                            <select
                              value={editingVariant.ten_mau_sac}
                              onChange={handleColorChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Chọn màu sắc</option>
                              {colors.map((color, index) => (
                                <option
                                  key={`edit-color-${color.ten_mau_sac}-${index}`}
                                  value={color.ten_mau_sac}
                                >
                                  {color.ten_mau_sac}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kích thước *
                            </label>
                            <select
                              value={editingVariant.ten_kich_thuoc}
                              onChange={handleSizeChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Chọn kích thước</option>
                              {sizes.map((size, index) => (
                                <option
                                  key={`edit-size-${size.ten_kich_thuoc}-${index}`}
                                  value={size.ten_kich_thuoc}
                                >
                                  {size.ten_kich_thuoc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Giá bán *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editingVariant.gia_ban}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  gia_ban: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số lượng tồn *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editingVariant.so_luong_ton}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  so_luong_ton: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Image Upload for Edit */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh biến thể *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                              <label className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-500">
                                  Thêm ảnh
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  disabled={uploading}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Image Preview with Drag & Drop for Edit */}
                          {editingVariant.hinh_anh.length > 0 && (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleEditVariantImageDragEnd}
                            >
                              <SortableContext
                                items={editingVariant.hinh_anh.map(
                                  (_, index) => `edit-variant-image-${index}`
                                )}
                                strategy={horizontalListSortingStrategy}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                  {editingVariant.hinh_anh.map(
                                    (image, index) => (
                                      <SortableImage
                                        key={`edit-variant-image-${index}`}
                                        id={`edit-variant-image-${index}`}
                                        image={image}
                                        index={index}
                                        onRemove={removeImage}
                                      />
                                    )
                                  )}
                                </div>
                              </SortableContext>
                            </DndContext>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={addOrUpdateVariant}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save size={16} />
                            Cập nhật
                          </button>
                          <button
                            onClick={cancelVariantForm}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Variants List */}
                  <div className="divide-y divide-gray-200">
                    {product.bienthe.map((variant, index) => (
                      <div key={variant.ma_bien_the || index} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                              {variant.hinh_anh
                                .slice(0, 3)
                                .map((image, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={image}
                                    alt={`${variant.ten_mau_sac} ${variant.ten_kich_thuoc}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                ))}
                              {variant.hinh_anh.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                  +{variant.hinh_anh.length - 3}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {variant.ten_cac_bien_the ||
                                  `${variant.ten_mau_sac} - ${variant.ten_kich_thuoc}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                Giá: {variant.gia_ban.toLocaleString()}đ • SL:{" "}
                                {variant.so_luong_ton}
                              </div>
                              <div className="text-xs text-gray-400">
                                {variant.hinh_anh.length} ảnh
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditingVariant(index)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Sửa biến thể"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => removeVariant(index)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Xóa biến thể"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Điều hướng
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("product")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === "product"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  📝 Thông tin sản phẩm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("variants")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === "variants"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  🎨 Biến thể ({product.bienthe.length})
                </button>
              </div>
            </div>

            {/* Product Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Trạng thái sản phẩm
              </h3>
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={product.trang_thai_hoat_dong === "hoat_dong"}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        trang_thai_hoat_dong: e.target.checked
                          ? "hoat_dong"
                          : "khong_hoat_dong",
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Hiển thị sản phẩm
                  </span>
                </label>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Thống kê
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Biến thể:</span>
                  <span className="font-medium">{product.bienthe.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng tồn kho:</span>
                  <span className="font-medium">
                    {product.bienthe.reduce(
                      (total, variant) => total + variant.so_luong_ton,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng ảnh:</span>
                  <span className="font-medium">
                    {product.bienthe.reduce(
                      (total, variant) => total + variant.hinh_anh.length,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductEnhanced;
