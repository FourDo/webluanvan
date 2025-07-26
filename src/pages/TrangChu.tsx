import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation, easeOut } from "framer-motion";
import { useNavigate } from "react-router-dom";

import SearchBox from "../components/SearchBox";
import PopularProducts from "../components/PopularProducts";
import ProductRecommendations from "../components/ProductRecommendations";
import { useAuth } from "../context/AuthContext";
import eventApi from "../API/eventApi";
import { getAllBaiViet } from "../API/baibaoApi";
import type { BaiViet } from "../types/BaiViet";

const TrangChu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State cho banner sự kiện
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [eventLoading, setEventLoading] = useState(true);

  // State cho bài viết
  const [articles, setArticles] = useState<BaiViet[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Debug log để kiểm tra user
  useEffect(() => {
    console.log("TrangChu - Current user:", user);
  }, [user]);

  // Fetch active events
  useEffect(() => {
    const fetchActiveEvents = async () => {
      setEventLoading(true);
      try {
        console.log("🔄 Fetching events...");
        const events = await eventApi.fetchEvents();
        console.log("📊 Raw API Response:", events);

        if (Array.isArray(events) && events.length > 0) {
          console.log(`📋 Total events received: ${events.length}`);

          // Lọc chỉ lấy sự kiện còn hiệu lực và đang hiển thị
          const now = new Date();
          console.log("⏰ Current time:", now.toISOString());

          const validEvents = events.filter((event: any) => {
            try {
              const endDate = new Date(event.ngay_ket_thuc);
              const isNotExpired = endDate > now;
              const isVisible = Boolean(event.hien_thi) && event.hien_thi !== 0;

              console.log(`🔍 Event "${event.tieu_de || event.ten_su_kien}":`, {
                endDate: endDate.toISOString(),
                isNotExpired,
                isVisible,
                hien_thi: event.hien_thi,
                passed: isNotExpired && isVisible,
              });

              return isNotExpired && isVisible;
            } catch (err) {
              console.error("❌ Error processing event:", event, err);
              return false;
            }
          });

          // Chỉ lấy 2 sự kiện hot nhất cho trang chủ
          setActiveEvents(validEvents.slice(0, 2));
          console.log(
            `✅ Loaded ${validEvents.length} active events for homepage:`,
            validEvents.map((e) => e.tieu_de || e.ten_su_kien)
          );
        } else {
          console.log("⚠️ No events received or not array");
          setActiveEvents([]);
        }
      } catch (err: any) {
        console.error("💥 Error loading events:", err.message, err);
        setActiveEvents([]);
      } finally {
        setEventLoading(false);
        console.log("🏁 Event loading finished");
      }
    };
    fetchActiveEvents();
  }, []);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      setArticlesLoading(true);
      try {
        console.log("🔄 Fetching articles...");
        const articlesData = await getAllBaiViet();
        console.log("📰 Articles loaded:", articlesData);

        // Lấy 6 bài viết mới nhất để hiển thị đầy đủ
        const latestArticles = articlesData.slice(0, 6);
        setArticles(latestArticles);
      } catch (err: any) {
        console.error("💥 Error loading articles:", err.message, err);
        setArticles([]);
      } finally {
        setArticlesLoading(false);
        console.log("🏁 Articles loading finished");
      }
    };
    fetchArticles();
  }, []);

  const stats = [
    { number: "20+", label: "Năm Kinh Nghiệm" },
    { number: "483", label: "Khách Hàng Hài Lòng" },
    { number: "150+", label: "Dự Án Hoàn Thành" },
  ];

  // Hàm tạo ref và controls cho từng section
  const createSectionAnimation = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const controls = useAnimation();

    useEffect(() => {
      if (isInView) {
        controls.start("visible");
      }
    }, [isInView, controls]);

    return { ref, controls };
  };

  // Tạo animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
  };

  const fadeRightVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOut } },
  };

  const fadeLeftVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOut } },
  };

  const zoomInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: easeOut },
    },
  };

  // Tạo ref và controls cho các section
  const heroRef = createSectionAnimation();

  const searchRef = createSectionAnimation();
  const benefitsRef = createSectionAnimation();
  const cardsRef = createSectionAnimation();
  const productsRef = createSectionAnimation();
  const swiperRef = createSectionAnimation();
  const craftedRef = createSectionAnimation();
  const statsRef = createSectionAnimation();
  const reviewsRef = createSectionAnimation();
  const articlesRef = createSectionAnimation();
  const ctaRef = createSectionAnimation();

  return (
    <div>
      {/* Phần Hero */}
      <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            ref={heroRef.ref}
            initial="hidden"
            animate={heroRef.controls}
            variants={fadeUpVariants}
            className="flex justify-center items-start text-center relative"
          >
            <img
              src="/image/muiten.png"
              alt="Mũi tên"
              className="absolute left-4 top-28 w-[120px] sm:left-10 sm:top-10 sm:w-[10px]"
            />
            <div className="flex-1">
              <h1 className="font-bold tracking-tight mb-8 text-center">
                <span className="block text-4xl md:text-5xl lg:text-6xl text-gray-900 pb-2">
                  Khám Phá Nội Thất Với
                  <br />
                  Gỗ Chất Lượng Cao
                </span>
              </h1>
              <p className="text-lg max-w-2xl mx-auto text-gray-400 mt-6">
                Chúng tôi mang đến những sản phẩm nội thất chất lượng cao với
                thiết kế tinh tế. Mỗi sản phẩm đều được chế tác tỉ mỉ, phù hợp
                với mọi không gian sống. Sự hài lòng của khách hàng luôn là ưu
                tiên hàng đầu. Hãy khám phá bộ sưu tập độc đáo của chúng tôi
                ngay hôm nay.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Banner Sự Kiện - Beautiful Event Banner with Background Image */}
        {!eventLoading && activeEvents.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-48 sm:h-56 md:h-64">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img
                  src={activeEvents[0]?.anh_banner || "/image/anhnen.png"}
                  alt="Event Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 md:px-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-full">
                  <div className="flex-1 py-6">
                    {/* Hot Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        SỰ KIỆN HOT
                      </div>
                      {activeEvents[0]?.ngay_ket_thuc && (
                        <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                          Kết thúc:{" "}
                          {new Date(
                            activeEvents[0].ngay_ket_thuc
                          ).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight">
                      {activeEvents[0]?.tieu_de ||
                        activeEvents[0]?.ten_su_kien ||
                        "Khuyến mãi đặc biệt"}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-sm sm:text-base mb-4 max-w-lg">
                      {activeEvents[0]?.noi_dung ||
                        activeEvents[0]?.mo_ta_ngan ||
                        "Ưu đãi hấp dẫn dành cho bạn - Khám phá ngay!"}
                    </p>

                    {/* Multiple Events Indicator */}
                    {activeEvents.length > 1 && (
                      <div className="flex items-center gap-2 text-white/80 text-xs">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          +{activeEvents.length - 1} sự kiện khác đang diễn ra
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="flex flex-col gap-3 pb-6 sm:pb-0">
                    <button
                      onClick={() => navigate("/sanpham")}
                      className="bg-gradient-to-r from-[#FFB23F] to-[#FF8C42] text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
                    >
                      🎉 Khám Phá Ngay
                    </button>
                    {activeEvents.length > 1 && (
                      <button
                        onClick={() => navigate("/sanpham")}
                        className="text-white/90 hover:text-white text-xs underline underline-offset-2 transition-colors"
                      >
                        Xem tất cả sự kiện →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 opacity-30">
                <div className="w-16 h-16 border-2 border-white/30 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute bottom-4 left-4 opacity-20">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Ô tìm kiếm */}
        <motion.div
          ref={searchRef.ref}
          initial="hidden"
          animate={searchRef.controls}
          variants={fadeUpVariants}
          className="relative max-w-7xl mx-auto h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
        >
          <div className="relative mx-auto w-[90%] sm:w-[95%] md:w-[600px] lg:w-[810px] h-12 sm:h-14 md:h-16 lg:h-[84px] mt-2 sm:mt-4 sm:absolute sm:top-6 md:absolute md:top-9 md:left-1/2 md:transform md:-translate-x-1/2 md:z-10">
            <div className="bg-white rounded-lg shadow-lg flex items-center px-3 sm:px-4 md:px-6 h-full">
              <SearchBox
                placeholder="Tìm kiếm sản phẩm"
                showDropdown={true}
                maxResults={5}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-center items-center w-full max-w-[90%] sm:max-w-[85%] md:max-w-full h-full mx-auto">
            <img
              src="/image/anhnen.png"
              alt="Nội thất"
              className="w-full h-auto max-h-[70%] sm:max-h-[80%] md:max-h-[90%] object-cover"
            />
          </div>
        </motion.div>

        {/* Phần lợi ích */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
          <motion.div
            ref={benefitsRef.ref}
            initial="hidden"
            animate={benefitsRef.controls}
            variants={fadeRightVariants}
            className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8"
          >
            <div className="w-full md:w-1/2">
              <p className="text-sm text-[#FFB23F] font-semibold mb-2">
                Lợi Ích
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#151411] leading-snug">
                Lợi ích khi sử dụng <br /> dịch vụ của chúng tôi
              </h2>
            </div>
            <div className="w-full md:w-1/2 pl-0 sm:pl-6 md:pl-10 text-gray-500 text-base sm:text-lg">
              <p>
                Chúng tôi cam kết mang đến cho bạn những sản phẩm nội thất
                <br /> chất lượng cao với dịch vụ tận tâm và <br />
                giá cả cạnh tranh nhất thị trường.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Cards lợi ích */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 pt-8 sm:pt-10">
          <motion.div
            ref={cardsRef.ref}
            initial="hidden"
            animate={cardsRef.controls}
            variants={fadeUpVariants}
            className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8"
          >
            {[
              {
                icon: "/image/1iconcard.png",
                title: "Nhiều Lựa Chọn",
                description:
                  "Hàng nghìn sản phẩm nội thất đa dạng từ cổ điển đến hiện đại, phù hợp với mọi phong cách và ngân sách của bạn.",
              },
              {
                icon: "/image/2iconcard.png",
                title: "Nhanh Chóng và Đúng Hẹn",
                description:
                  "Dịch vụ giao hàng nhanh chóng trong 24-48 giờ và đúng hẹn cam kết, đảm bảo sản phẩm đến tay bạn an toàn.",
              },
              {
                icon: "/image/3iconcard.png",
                title: "Giá Cả Hợp Lý",
                description:
                  "Cam kết giá cả minh bạch và cạnh tranh nhất thị trường, cùng nhiều chương trình ưu đãi hấp dẫn cho khách hàng.",
              },
            ].map((card, index) => (
              <motion.div
                key={index}
                variants={zoomInVariants}
                transition={{ delay: index * 0.2 }}
                className="w-full md:w-1/3"
              >
                <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 text-start">
                  <div className="flex justify-start mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <img
                        src={card.icon}
                        alt={card.title}
                        className="w-8 h-8 sm:w-10 sm:h-10"
                      />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#151411] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-500">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Phần sản phẩm nổi bật */}
          <motion.div
            ref={productsRef.ref}
            initial="hidden"
            animate={productsRef.controls}
            variants={fadeUpVariants}
            className="pt-10"
          >
            <div>
              <h2 className="font-bold text-[#FFB23F] text-center mb-3">
                Sản Phẩm
              </h2>
              <h2 className="text-3xl text-black font-bold text-center mb-5">
                Sản phẩm nổi bật của chúng tôi
              </h2>
              <h2 className="text-center text-gray-500 text-[18px]">
                Khám phá bộ sưu tập nội thất độc đáo được tuyển chọn kỹ lưỡng
                <br /> từ các thương hiệu uy tín, mang đến chất lượng tuyệt vời
                cho ngôi nhà bạn.
              </h2>
            </div>
          </motion.div>
        </div>

        {/* SwiperContainer */}
        <motion.div
          ref={swiperRef.ref}
          initial="hidden"
          animate={swiperRef.controls}
          variants={fadeUpVariants}
          className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 md:px-8"
        ></motion.div>

        {/* Sản phẩm nổi bật */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariants}
          className="bg-gray-50 py-12"
        >
          <PopularProducts limit={8} />
        </motion.div>

        {/* Gợi ý sản phẩm */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariants}
          className="bg-white py-12"
        >
          <ProductRecommendations limit={8} />
        </motion.div>

        {/* Phần sản phẩm của chúng tôi */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
          <motion.div
            ref={craftedRef.ref}
            initial="hidden"
            animate={craftedRef.controls}
            variants={fadeRightVariants}
            className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8"
          >
            <div className="w-full md:w-1/2">
              <p className="text-sm text-[#FFB23F] font-semibold mb-2">
                Sản Phẩm Của Chúng Tôi
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#151411] leading-snug">
                Được chế tác bởi đội ngũ tài năng và <br /> vật liệu chất lượng
                cao
              </h2>
              <p className="text-base sm:text-lg text-gray-500 mt-6 sm:mt-10">
                Mỗi sản phẩm nội thất đều được chế tác tỉ mỉ từ nguyên liệu cao
                cấp, kết hợp thiết kế hiện đại và tính năng thực dụng để tạo nên
                những không gian sống hoàn hảo cho gia đình bạn.
              </p>
              <button
                className="bg-[#518581] text-white rounded px-4 py-2 sm:px-6 sm:py-3 mt-6 sm:mt-8 hover:bg-green-800"
                onClick={() => navigate("/about-us")}
              >
                Tìm Hiểu Thêm
              </button>
              <img
                src="/image/learnmore2.png"
                alt="Trưng bày sản phẩm"
                className="mt-6 sm:mt-8 w-full max-w-[595px] h-auto rounded-lg"
              />
            </div>
            <motion.div
              ref={statsRef.ref}
              initial="hidden"
              animate={statsRef.controls}
              variants={fadeLeftVariants}
              className="w-full md:w-1/2 flex flex-col items-center text-gray-500 text-base sm:text-lg"
            >
              <div className="flex flex-row sm:flex-row gap-6 sm:gap-10 justify-center w-full mt-6 sm:mt-0">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUpVariants}
                    transition={{ delay: index * 0.2 }}
                    className="text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-black">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
              <img
                src="/image/learnmore1.jpg"
                alt="Trưng bày sản phẩm"
                className="mt-6 w-full h-auto max-h-[400px] object-cover rounded-lg"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Phần đánh giá (marquee) */}
        <motion.div
          ref={reviewsRef.ref}
          initial="hidden"
          animate={reviewsRef.controls}
          variants={fadeUpVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12"
        >
          <div className="relative overflow-x-hidden">
            <div className="flex gap-4 sm:gap-8 py-6 sm:py-8 animate-marquee whitespace-nowrap">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUpVariants}
                    transition={{ delay: index * 0.2 }}
                    className="inline-block w-full sm:w-80 md:w-96 min-w-[280px] sm:min-w-[320px] mx-2 sm:mx-4"
                  >
                    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                      <div className="mb-4">
                        <svg
                          width="32"
                          height="32"
                          className="sm:w-[40px] sm:h-[40px]"
                          fill="none"
                          viewBox="0 0 40 40"
                        >
                          <text x="0" y="32" fontSize="40" fill="#6EE7B7">
                            “
                          </text>
                        </svg>
                      </div>
                      <p className="text-base sm:text-lg break-words max-w-xs text-gray-500 mb-6 sm:mb-8 whitespace-normal">
                        Sản phẩm chất lượng cao, dịch vụ tận tâm và giá cả hợp
                        lý. Tôi rất hài lòng với trải nghiệm mua sắm tại đây.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="/image/human1.png"
                            alt="Janne Cooper"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                          <span className="font-semibold text-[#151411]">
                            Janne Cooper
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-700">4.3</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Phần bài viết */}
        <motion.div
          ref={articlesRef.ref}
          initial="hidden"
          animate={articlesRef.controls}
          variants={fadeUpVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12"
        >
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm text-[#FFB23F] font-semibold mb-2">
              Bài Viết
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#151411] leading-snug mb-4">
              Nội thất tốt nhất đến từ <br /> Nội thất VN
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              Khám phá những bài viết mới nhất về trang trí nội thất, mẹo vặt và
              cảm hứng thiết kế.
            </p>
          </div>

          {/* Articles Grid - 2 cột cân bằng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Cột trái - 3 bài viết */}
            <div className="flex flex-col gap-6">
              {!articlesLoading && articles.length > 0 ? (
                articles.slice(0, 3).map((article, index) => (
                  <div
                    key={article.id}
                    className={`cursor-pointer group transition-all duration-300 ${
                      index === 0 ? "transform hover:scale-[1.02]" : ""
                    }`}
                    onClick={() => navigate(`/baibao/${article.id}`)}
                  >
                    {index === 0 ? (
                      // Bài viết đầu tiếp lớn hơn
                      <div className="relative rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={article.anh_dai_dien || "/image/hetcuu.png"}
                          alt={article.tieu_de}
                          className="w-full h-[250px] sm:h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 p-4 sm:p-6 text-white">
                          <p className="text-xs sm:text-sm opacity-70 mb-1">
                            {article.danh_muc?.ten_danh_muc || "Bài viết"}
                          </p>
                          <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">
                            {article.tieu_de}
                          </h3>
                          <p className="text-sm opacity-80 line-clamp-2 mb-3">
                            {article.mo_ta_ngan ||
                              "Khám phá thêm về nội thất..."}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span>
                              {new Date(
                                article.ngay_tao || ""
                              ).toLocaleDateString("vi-VN")}
                            </span>
                            <span>•</span>
                            <span>{article.luot_xem} lượt xem</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Bài viết nhỏ hơn
                      <div className="flex gap-4 items-start hover:bg-white hover:shadow-sm rounded-lg p-3 transition-all">
                        <img
                          src={article.anh_dai_dien || "/image/hetcuu2.png"}
                          alt={article.tieu_de}
                          className="w-24 sm:w-32 h-20 sm:h-24 object-cover rounded group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">
                            {article.danh_muc?.ten_danh_muc || "Bài viết"}
                          </p>
                          <h3 className="text-sm sm:text-base font-semibold text-[#151411] mt-1 line-clamp-2 group-hover:text-[#518581] transition-colors">
                            {article.tieu_de}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {article.mo_ta_ngan ||
                              "Những mẹo hay để tối ưu hóa không gian sống..."}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span className="font-semibold text-[#151411]">
                              {new Date(
                                article.ngay_tao || ""
                              ).toLocaleDateString("vi-VN")}
                            </span>
                            <span>•</span>
                            <span>{article.luot_xem} lượt xem</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : articlesLoading ? (
                // Loading skeleton cho cột trái
                <>
                  <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-200 animate-pulse h-[300px]">
                    <div className="absolute bottom-0 p-4 sm:p-6">
                      <div className="h-3 bg-gray-300 rounded mb-2 w-20"></div>
                      <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                  {Array(2)
                    .fill(0)
                    .map((_, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-start animate-pulse"
                      >
                        <div className="w-24 sm:w-32 h-20 sm:h-24 bg-gray-200 rounded flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded mb-2 w-16"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2 w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có bài viết nào để hiển thị
                </div>
              )}
            </div>

            {/* Cột phải - 3 bài viết */}
            <div className="flex flex-col gap-6">
              {!articlesLoading && articles.length > 3 ? (
                articles.slice(3, 6).map((article, index) => (
                  <div
                    key={article.id}
                    className={`cursor-pointer group transition-all duration-300 ${
                      index === 0 ? "transform hover:scale-[1.02]" : ""
                    }`}
                    onClick={() => navigate(`/baibao/${article.id}`)}
                  >
                    {index === 0 ? (
                      // Bài viết đầu tiên lớn hơn
                      <div className="relative rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={article.anh_dai_dien || "/image/hetcuu3.png"}
                          alt={article.tieu_de}
                          className="w-full h-[250px] sm:h-[300px] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 p-4 sm:p-6 text-white">
                          <p className="text-xs sm:text-sm opacity-70 mb-1">
                            {article.danh_muc?.ten_danh_muc || "Bài viết"}
                          </p>
                          <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">
                            {article.tieu_de}
                          </h3>
                          <p className="text-sm opacity-80 line-clamp-2 mb-3">
                            {article.mo_ta_ngan ||
                              "Khám phá thêm về nội thất..."}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span>
                              {new Date(
                                article.ngay_tao || ""
                              ).toLocaleDateString("vi-VN")}
                            </span>
                            <span>•</span>
                            <span>{article.luot_xem} lượt xem</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Bài viết nhỏ hơn
                      <div className="flex gap-4 items-start hover:bg-white hover:shadow-sm rounded-lg p-3 transition-all">
                        <img
                          src={article.anh_dai_dien || "/image/hetcuu4.png"}
                          alt={article.tieu_de}
                          className="w-24 sm:w-32 h-20 sm:h-24 object-cover rounded group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">
                            {article.danh_muc?.ten_danh_muc || "Bài viết"}
                          </p>
                          <h3 className="text-sm sm:text-base font-semibold text-[#151411] mt-1 line-clamp-2 group-hover:text-[#518581] transition-colors">
                            {article.tieu_de}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {article.mo_ta_ngan ||
                              "Những mẹo hay để tối ưu hóa không gian sống..."}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span className="font-semibold text-[#151411]">
                              {new Date(
                                article.ngay_tao || ""
                              ).toLocaleDateString("vi-VN")}
                            </span>
                            <span>•</span>
                            <span>{article.luot_xem} lượt xem</span>
                            {article.tags && article.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-[#FFB23F]">
                                  #{article.tags[0].ten_tag}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : articlesLoading ? (
                // Loading skeleton cho cột phải
                <>
                  <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-200 animate-pulse h-[300px]">
                    <div className="absolute bottom-0 p-4 sm:p-6">
                      <div className="h-3 bg-gray-300 rounded mb-2 w-20"></div>
                      <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                  {Array(2)
                    .fill(0)
                    .map((_, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-start animate-pulse"
                      >
                        <div className="w-24 sm:w-32 h-20 sm:h-24 bg-gray-200 rounded flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded mb-2 w-16"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2 w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                </>
              ) : articles.length > 0 && articles.length <= 3 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm">Cần thêm bài viết để hiển thị</p>
                  <p className="text-xs mt-1 opacity-70">
                    Hiện có: {articles.length} bài viết
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* View all articles button */}
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={() => navigate("/baibao")}
              className="bg-[#518581] text-white px-8 py-4 rounded-lg hover:bg-[#406b67] text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Xem tất cả bài viết →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Call to action */}
      <motion.div
        ref={ctaRef.ref}
        initial="hidden"
        animate={ctaRef.controls}
        variants={fadeUpVariants}
        className="mt-8 sm:mt-10 md:mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-center gap-4 sm:gap-6">
            <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800">
              Tham gia ngay để nhận ưu đãi đặc biệt
            </p>
            <button className="bg-teal-600 text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-teal-700 transition">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrangChu;
