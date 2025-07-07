import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation, easeOut } from "framer-motion";
import SwiperContainer from "../components/SwiperContainer";

const TrangChu: React.FC = () => {
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
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm"
                className="flex-1 outline-none text-gray-700 text-sm sm:text-base md:text-lg bg-transparent"
              />
              <button className="bg-[#518581] text-white rounded px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 ml-2 hover:bg-green-800">
                Tìm kiếm
              </button>
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
                Pellentesque etiam blandit in tincidunt at donec. Eget
                <br /> ipsum dignissim placerat nisi, adipiscing mauris <br />
                non purus parturient.
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
                  "Pellentesque etiam blandit in tincidunt at donec. Eget ipsum dignissim placerat nisi, adipiscing mauris non.",
              },
              {
                icon: "/image/2iconcard.png",
                title: "Nhanh Chóng và Đúng Hẹn",
                description:
                  "Pellentesque etiam blandit in tincidunt at donec. Eget ipsum dignissim placerat nisi, adipiscing mauris non.",
              },
              {
                icon: "/image/3iconcard.png",
                title: "Giá Cả Hợp Lý",
                description:
                  "Pellentesque etiam blandit in tincidunt at donec. Eget ipsum dignissim placerat nisi, adipiscing mauris non.",
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
                Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                dignissim
                <br /> placerat nisi, adipiscing mauris non purus parturient.
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
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Sản Phẩm Tiêu Biểu
          </h2>
          <SwiperContainer />
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
                Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                dignissim placerat nisi, adipiscing mauris non purus parturient.
                morbi fermentum, vivamus et accumsan dui tincidunt pulvinar
              </p>
              <button className="bg-[#518581] text-white rounded px-4 py-2 sm:px-6 sm:py-3 mt-6 sm:mt-8 hover:bg-green-800">
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
                        Pellentesque etiam blandit in tincidunt at donec. Eget
                        ipsum dignissim placerat nisi, adipiscing mauris non.
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
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8">
            <div className="w-full md:w-1/2">
              <p className="text-xs sm:text-sm text-[#FFB23F] font-semibold mb-2">
                Bài Viết
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#151411] leading-snug">
                Nội thất tốt nhất đến từ <br /> Lalasia
              </h2>
              <p className="text-base sm:text-lg text-gray-500 mt-6 sm:mt-10">
                Chúng tôi mang đến nội thất chất lượng với thiết kế tinh tế.
              </p>
              <div className="relative w-full max-w-[582px] h-auto max-h-[536px] rounded-lg overflow-hidden shadow-lg mt-6 sm:mt-8">
                <img
                  src="/image/hetcuu.png"
                  alt="Phòng ăn ấm cúng"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-4 sm:p-6 text-white">
                  <p className="text-xs sm:text-sm opacity-70">
                    Mẹo và Thủ Thuật
                  </p>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mt-1">
                    Tạo Không Gian Phòng Ăn Ấm Cúng
                  </h3>
                  <p className="text-xs sm:text-sm mt-1 opacity-80">
                    Trang trí với tông màu trung tính mang lại sự cân bằng cho
                    phòng ăn...
                  </p>
                  <button className="mt-3 sm:mt-4 underline text-xs sm:text-sm">
                    Đọc thêm
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-2">
                  <button className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-white text-gray-600 hover:bg-gray-200">
                    ←
                  </button>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-[#2C7865] text-white hover:bg-[#1e5a4c]">
                    →
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4 sm:gap-5 mt-6 md:mt-0">
              {[
                {
                  image: "/image/hetcuu2.png",
                  category: "Mẹo và Thủ Thuật",
                  title: "6 cách để tạo không gian sống tối giản",
                  author: "Jerremy Jean",
                  avatar: "/image/human1.png",
                  date: "Thứ Sáu, 1 Tháng 4, 2022",
                },
                {
                  image: "/image/hetcuu3.png",
                  category: "Cảm Hứng Thiết Kế",
                  title: "Cách làm nội thất trở nên hiện đại và phong cách hơn",
                  author: "Michaela Augus",
                  avatar: "/image/human1.png",
                  date: "Thứ Sáu, 1 Tháng 4, 2022",
                },
                {
                  image: "/image/hetcuu4.png",
                  category: "Mẹo và Thủ Thuật",
                  title: "Những yếu tố tạo điểm nhấn cho không gian",
                  author: "Kim Gurameh",
                  avatar: "/image/human1.png",
                  date: "Thứ Sáu, 1 Tháng 4, 2022",
                },
              ].map((article, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeLeftVariants}
                  transition={{ delay: idx * 0.2 }}
                  className="flex gap-4 sm:gap-5 items-stretch"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-40 sm:w-48 h-auto sm:h-[200px] md:h-[235px] object-cover rounded"
                  />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {article.category}
                    </p>
                    <h3 className="text-base sm:text-lg font-semibold text-[#151411] mt-1">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Pellentesque etiam blandit in...
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-400">
                      <img
                        src={article.avatar}
                        alt={article.author}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                      />
                      <span className="font-semibold text-[#151411]">
                        bởi {article.author}
                      </span>
                      <span>· {article.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
