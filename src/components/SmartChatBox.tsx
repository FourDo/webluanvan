import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { productApi } from "../API/productApi";
import type { Product } from "../types/Product";
import { Link } from "react-router-dom";
import { Send, Bot, X } from "lucide-react";

const API_KEY = "AIzaSyAAP-1OqLhEfCiJrWNH_xmXB2dVp2f-Df4";
const MODEL_NAME = "gemini-2.5-flash-lite";

const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  sender: "user" | "bot";
  text: string | React.ReactNode;
}

const SmartChatBox: React.FC = () => {
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý ảo của cửa hàng. Tôi có thể giúp bạn tìm hiểu về sản phẩm, tư vấn mua sắm và trả lời các câu hỏi. Bạn cần hỗ trợ gì không? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch products when the component mounts
    productApi
      .getProducts()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setProducts(res.data);
        } else if (res.data) {
          setProducts([res.data]);
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chat = genAI.getGenerativeModel({ model: MODEL_NAME });
      const productContext = products
        .map((p) => {
          const firstVariant = p.bienthe?.[0];
          const price = firstVariant?.gia_ban || "0";
          const variants =
            p.bienthe
              ?.map((v) => `${v.ten_mau_sac} (${v.ten_kich_thuoc})`)
              .join(", ") || "";

          return `Tên: ${p.ten_san_pham}
Thương hiệu: ${p.thuong_hieu}
Danh mục: ${p.ten_danh_muc || "Chưa phân loại"}
Chất liệu: ${p.chat_lieu}
Giá: ${parseFloat(price).toLocaleString("vi-VN")} VND
Biến thể có sẵn: ${variants}
Số lượng tồn: ${firstVariant?.so_luong_ton || 0}`;
        })
        .join("\n\n");

      // Kiểm tra nếu khách hỏi về đơn hàng
      const orderKeywords = [
        "đơn hàng",
        "order",
        "mua hàng",
        "thanh toán",
        "giao hàng",
        "đặt hàng",
        "trạng thái đơn",
      ];
      const isOrderInquiry = orderKeywords.some((keyword) =>
        input.toLowerCase().includes(keyword)
      );

      if (isOrderInquiry) {
        const orderResponse =
          "Để được tư vấn và hỗ trợ về đơn hàng, quý khách vui lòng liên hệ trực tiếp với chúng tôi qua số điện thoại: **0782352282**. Đội ngũ tư vấn viên sẽ hỗ trợ bạn 24/7! 📞";
        const botMessage: Message = { sender: "bot", text: orderResponse };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
        return;
      }

      // Kiểm tra nếu khách hỏi cụ thể về thương hiệu
      const brandKeywords = ["thương hiệu", "brand", "hãng", "của"];
      const isBrandSpecific = brandKeywords.some((keyword) =>
        input.toLowerCase().includes(keyword)
      );

      const prompt = `Bạn là một trợ lý mua sắm thông minh cho cửa hàng nội thất. Dưới đây là danh sách sản phẩm với thông tin chi tiết:

${productContext}

Khi khách hàng hỏi về sản phẩm, hãy trả lời một cách thân thiện và cung cấp thông tin hữu ích. Đặc biệt chú ý:
- Khi khách hàng hỏi về sản phẩm "rẻ nhất" hoặc "giá thấp nhất", hãy tìm sản phẩm có giá thấp nhất trong danh mục đó
- Khi khách hàng hỏi về sản phẩm "đắt nhất" hoặc "cao cấp nhất", hãy tìm sản phẩm có giá cao nhất
- KHÔNG BAO GIỜ hiển thị ID sản phẩm cho khách hàng
- ${isBrandSpecific ? "Có thể đề cập đến thương hiệu khi khách hàng hỏi cụ thể" : "Chỉ đề cập tên sản phẩm và giá, không cần nói về thương hiệu trừ khi được hỏi cụ thể"}
- Cung cấp thông tin về chất liệu, kích thước, màu sắc khi phù hợp
- Luôn đề cập đến tên chính xác của sản phẩm để hiển thị hình ảnh
- So sánh giá cả, chất liệu, kích thước khi khách hàng yêu cầu

Khách hàng hỏi: ${input}
Trả lời:`;

      const result = await chat.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const response = await result.response;
      const text = await response.text();

      // Tìm tất cả sản phẩm xuất hiện trong câu trả lời và hiển thị với hình ảnh
      let botResponse: string | React.ReactNode = text;
      const foundProducts: Product[] = [];

      // Tìm các sản phẩm được đề cập trong câu trả lời
      products.forEach((p) => {
        if (text.toLowerCase().includes(p.ten_san_pham.toLowerCase())) {
          foundProducts.push(p);
        }
      });

      // Nếu không tìm thấy sản phẩm cụ thể, tìm theo từ khóa và yêu cầu đặc biệt
      if (foundProducts.length === 0) {
        const keywords = ["sofa", "ghế", "bàn", "tủ", "giường", "kệ", "đèn"];
        const inputLower = input.toLowerCase();
        const textLower = text.toLowerCase();

        // Tìm sản phẩm theo từ khóa
        let matchingProducts: Product[] = [];
        keywords.forEach((keyword) => {
          if (inputLower.includes(keyword) || textLower.includes(keyword)) {
            products.forEach((p) => {
              if (
                p.ten_san_pham.toLowerCase().includes(keyword) &&
                !matchingProducts.some((fp) => fp.ma_san_pham === p.ma_san_pham)
              ) {
                matchingProducts.push(p);
              }
            });
          }
        });

        // Xử lý yêu cầu đặc biệt về giá
        if (matchingProducts.length > 0) {
          if (
            inputLower.includes("rẻ nhất") ||
            inputLower.includes("giá thấp") ||
            inputLower.includes("giá rẻ")
          ) {
            // Sắp xếp theo giá tăng dần và lấy sản phẩm rẻ nhất
            matchingProducts.sort((a, b) => {
              const priceA = parseFloat(a.bienthe?.[0]?.gia_ban || "0");
              const priceB = parseFloat(b.bienthe?.[0]?.gia_ban || "0");
              return priceA - priceB;
            });
            foundProducts.push(matchingProducts[0]);
          } else if (
            inputLower.includes("đắt nhất") ||
            inputLower.includes("giá cao") ||
            inputLower.includes("cao cấp")
          ) {
            // Sắp xếp theo giá giảm dần và lấy sản phẩm đắt nhất
            matchingProducts.sort((a, b) => {
              const priceA = parseFloat(a.bienthe?.[0]?.gia_ban || "0");
              const priceB = parseFloat(b.bienthe?.[0]?.gia_ban || "0");
              return priceB - priceA;
            });
            foundProducts.push(matchingProducts[0]);
          } else {
            // Hiển thị tất cả sản phẩm tìm được, sắp xếp theo giá
            matchingProducts.sort((a, b) => {
              const priceA = parseFloat(a.bienthe?.[0]?.gia_ban || "0");
              const priceB = parseFloat(b.bienthe?.[0]?.gia_ban || "0");
              return priceA - priceB;
            });
            foundProducts.push(...matchingProducts);
          }
        }
      } // Tạo response với links cho tên sản phẩm
      let replaced = false;
      let elements: (string | React.ReactNode)[] = [text];
      products.forEach((p) => {
        elements = elements.flatMap((el) => {
          if (typeof el === "string") {
            const parts = el.split(new RegExp(`(${p.ten_san_pham})`, "gi"));
            if (parts.length > 1) replaced = true;
            return parts.map((part, idx) =>
              part.toLowerCase() === p.ten_san_pham.toLowerCase() ? (
                <Link
                  key={p.ma_san_pham + "-" + idx}
                  to={`/sanpham/${p.ma_san_pham}`}
                  className="text-blue-500 hover:underline font-bold"
                  onClick={() => setIsChatting(false)}
                >
                  {part}
                </Link>
              ) : (
                part
              )
            );
          }
          return el;
        });
      });

      // Tạo component hiển thị sản phẩm với hình ảnh (chỉ tên, giá, hình ảnh)
      const productCards = foundProducts.map((product) => {
        const firstVariant = product.bienthe?.[0];
        const imageUrl =
          firstVariant?.hinh_anh?.[0] || "/placeholder-product.jpg";
        const originalPrice = firstVariant?.gia_ban || "0";
        const discountPercent = firstVariant?.phan_tram_giam;
        const discountedPrice = discountPercent
          ? parseFloat(originalPrice) * (1 - discountPercent / 100)
          : null;

        return (
          <Link
            key={product.ma_san_pham}
            to={`/sanpham/${product.ma_san_pham}`}
            onClick={() => setIsChatting(false)}
            className="block bg-gradient-to-r from-white to-blue-50/30 border border-gray-200/60 rounded-xl p-4 mt-3 hover:shadow-lg hover:border-blue-300/40 transition-all duration-300 transform hover:scale-102 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={product.ten_san_pham}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 shadow-md border border-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-product.jpg";
                  }}
                />
                {discountPercent && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                    -{discountPercent}%
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                  {product.ten_san_pham}
                </h4>
                {isBrandSpecific && (
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    {product.thuong_hieu}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {discountedPrice ? (
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-red-600 bg-red-100/50 px-2 py-1 rounded-lg">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(discountedPrice)}
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(parseFloat(originalPrice))}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-blue-600 bg-blue-100/50 px-2 py-1 rounded-lg">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(parseFloat(originalPrice))}
                    </p>
                  )}
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Có sẵn
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      });

      if (replaced) {
        botResponse = (
          <div>
            <div className="mb-2">{elements}</div>
            {foundProducts.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Sản phẩm liên quan:
                </p>
                {productCards}
              </div>
            )}
          </div>
        );
      } else if (foundProducts.length > 0) {
        botResponse = (
          <div>
            <div className="mb-2">{text}</div>
            <div>
              <p className="text-xs text-gray-600 mb-3 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Sản phẩm liên quan:
              </p>
              {productCards}
            </div>
          </div>
        );
      }

      const botMessage: Message = { sender: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error with Gemini AI:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatting) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsChatting(true);
          }}
          className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-110 animate-pulse hover:animate-none"
          aria-label="Mở hộp thoại chat"
        >
          <Bot size={28} className="relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30 blur-lg animate-pulse"></div>
        </button>
        <div className="absolute -top-12 right-0 bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Trợ lý AI
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl z-50 border border-gray-100 flex flex-col overflow-hidden max-h-[calc(100vh-3rem)] backdrop-blur-lg">
      {/* Header with gradient and glassmorphism effect */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white p-5 flex justify-between items-center flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Trợ lý AI</h3>
            <p className="text-blue-100 text-xs">Luôn sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
          <button
            onClick={() => setIsChatting(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
            title="Đóng chat"
          >
            <X size={20} />
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </header>

      {/* Chat messages area with improved styling */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-blue-50/30 min-h-0 space-y-4"
        style={{ maxHeight: "450px" }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-3 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                <Bot size={18} />
              </div>
            )}
            <div
              className={`max-w-[280px] px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-blue-500/30"
                  : "bg-white/90 text-gray-800 border border-gray-100 rounded-bl-md shadow-gray-500/20"
              }`}
            >
              <div className="text-sm leading-relaxed break-words">
                {msg.text}
              </div>
            </div>
            {msg.sender === "user" && (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                <span className="text-sm font-bold">U</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-end gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
              <Bot size={18} />
            </div>
            <div className="bg-white/90 text-gray-800 border border-gray-100 rounded-2xl rounded-bl-md p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area with modern design */}
      <div className="p-5 border-t border-gray-100/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập tin nhắn của bạn..."
              className="w-full px-5 py-3.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg text-gray-800 placeholder-gray-500"
              disabled={isLoading}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          <button
            onClick={handleSend}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white p-3.5 rounded-full hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:hover:scale-100 group"
            disabled={isLoading}
          >
            <Send
              size={20}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {["Sản phẩm mới", "Giá rẻ nhất", "Sofa cao cấp"].map(
            (suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-full transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartChatBox;
