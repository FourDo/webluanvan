import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import SwiperContainer from "../components/SwiperContainer";

const TrangChu: React.FC = () => {
  const stats = [
    { number: "20+", label: "Years Experience" },
    { number: "483", label: "Happy Client" },
    { number: "150+", label: "Project Finished" },
  ];
  // Dummy data for danhSachSanPham to avoid error
  const danhSachSanPham = [
    { id: 1, name: "Product 1" },
    { id: 2, name: "Product 2" },
    { id: 3, name: "Product 3" },
    { id: 4, name: "Product 4" },
  ];
  const sanPhamNoiBat = danhSachSanPham.slice(0, 3);

  return (
    <div>
      {/* Phần Hero */}
      <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex justify-center items-start text-center relative">
            <img
              src="/image/muiten.png"
              alt="Mũi tên"
              className=" absolute left-4 top-28 w-[120px] sm:left-10 sm:top-10 sm:w-[10px]"
            />
            <div className="flex-1">
              <h1 className="font-bold tracking-tight mb-8 text-center">
                <span className="block  text-4xl md:text-5xl lg:text-6xl text-gray-900 pb-2 ">
                  Discover Furniture With
                  <br />
                  High Quality Wood
                </span>
              </h1>
              <p className="text-lg max-w-2xl mx-auto text-gray-400 mt-6">
                Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                dignissim placerat nisi, adipiscing mauris non. Purus parturient
                viverra nunc, tortor sit laoreet. Quam tincidunt aliquam
                adipiscing tempor.
              </p>
            </div>
          </div>
        </div>

        {/* Ô tìm kiếm nổi đè lên ảnh nền, nằm dưới nội dung */}
        <div className="relative max-w-7xl mx-auto h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
          <div className="relative mx-auto w-[90%] sm:w-[95%] md:w-[600px] lg:w-[810px] h-12 sm:h-14 md:h-16 lg:h-[84px] mt-2 sm:mt-4 sm:absolute sm:top-6 md:absolute md:top-9 md:left-1/2 md:transform md:-translate-x-1/2 md:z-10">
            <div className="bg-white rounded-lg shadow-lg flex items-center px-3 sm:px-4 md:px-6 h-full">
              <input
                type="text"
                placeholder="Search property"
                className="flex-1 outline-none text-gray-700 text-sm sm:text-base md:text-lg bg-transparent"
              />
              <button className="bg-[#518581] text-white rounded px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 ml-2 hover:bg-green-800">
                Search
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
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8">
            <div className="w-full md:w-1/2">
              <p className="text-sm text-[#FFB23F] font-semibold mb-2">
                Benefits
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#151411] leading-snug">
                Benefits when using <br /> our services
              </h2>
            </div>
            <div className="w-full md:w-1/2 pl-0 sm:pl-6 md:pl-10 text-gray-500 text-base sm:text-lg">
              <p>
                Pellentesque etiam blandit in tincidunt at donec. Eget
                <br /> ipsum dignissim placerat nisi, adipiscing mauris <br />
                non purus parturient.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 pt-8 sm:pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8">
            <div className="w-full md:w-1/3">
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 text-start">
                <div className="flex justify-start mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <img
                      src="/image/1iconcard.png"
                      alt="Many Choices"
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#151411] mb-2">
                  Many Choices
                </h3>
                <p className="text-base sm:text-lg text-gray-500">
                  Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                  dignissim placerat nisi, adipiscing mauris non.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 text-start">
                <div className="flex justify-start mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <img
                      src="/image/2iconcard.png"
                      alt="Fast and On Time"
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#151411] mb-2">
                  Fast and On Time
                </h3>
                <p className="text-base sm:text-lg text-gray-500">
                  Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                  dignissim placerat nisi, adipiscing mauris non.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 text-start">
                <div className="flex justify-start mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <img
                      src="/image/3iconcard.png"
                      alt="Affordable Price"
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#151411] mb-2">
                  Affordable Price
                </h3>
                <p className="text-base sm:text-lg text-gray-500">
                  Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                  dignissim placerat nisi, adipiscing mauris non.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <div>
              <h2 className=" font-bold text-[#FFB23F] text-center mb-3">
                Products
              </h2>
              <h2 className=" text-3xl text-black font-bold text-center mb-5">
                Our popular product
              </h2>
              <h2 className="text-center text-gray-500 text-[18px]">
                Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                dignissim
                <br /> placerat nisi, adipiscing mauris non purus parturient.
              </h2>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Featured Products
          </h2>
          <SwiperContainer />
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8">
            <div className="w-full md:w-1/2">
              <p className="text-sm text-[#FFB23F] font-semibold mb-2">
                Our Product
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#151411] leading-snug">
                Crafted by talented and <br /> high quality material
              </h2>
              <p className="text-base sm:text-lg text-gray-500 mt-6 sm:mt-10">
                Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                dignissim placerat nisi, adipiscing mauris non purus parturient.
                morbi fermentum, vivamus et accumsan dui tincidunt pulvinar
              </p>
              <button className="bg-[#518581] text-white rounded px-4 py-2 sm:px-6 sm:py-3 mt-6 sm:mt-8 hover:bg-green-800">
                Learn More
              </button>
              <img
                src="/image/learnmore2.png"
                alt="Product showcase"
                className="mt-6 sm:mt-8 w-full max-w-[595px] h-auto rounded-lg"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center text-gray-500 text-base sm:text-lg">
              <div className="flex flex-row sm:flex-row  gap-6 sm:gap-10 justify-center w-full mt-6 sm:mt-0">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-black">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <img
                src="/image/learnmore1.jpg"
                alt="Product showcase"
                className="mt-6 w-full h-auto max-h-[400px] object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12">
          <div className="relative overflow-x-hidden">
            <div className="flex gap-4 sm:gap-8 py-6 sm:py-8 animate-marquee whitespace-nowrap">
              {/* Card 1 */}
              <div className="inline-block w-full sm:w-80 md:w-96 min-w-[280px] sm:min-w-[320px] mx-2 sm:mx-4">
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
                    Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                    dignissim placerat nisi, adipiscing mauris non.
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
              </div>
              {/* Card 2 - Lặp lại để hiệu ứng marquee liên tục */}
              <div className="inline-block w-full sm:w-80 md:w-96 min-w-[280px] sm:min-w-[320px] mx-2 sm:mx-4">
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
                    Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                    dignissim placerat nisi, adipiscing mauris non.
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
              </div>
              {/* Có thể thêm nhiều thẻ hơn để hiệu ứng marquee mượt mà */}
              <div className="inline-block w-full sm:w-80 md:w-96 min-w-[280px] sm:min-w-[320px] mx-2 sm:mx-4">
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
                    Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                    dignissim placerat nisi, adipiscing mauris non.
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
              </div>
              <div className="inline-block w-full sm:w-80 md:w-96 min-w-[280px] sm:min-w-[320px] mx-2 sm:mx-4">
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
                    Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                    dignissim placerat nisi, adipiscing mauris non.
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
              </div>
              <div className="inline-block w-full sm:w-80 md:w-96 min-w-[280px] sm:min-w-[320px] mx-2 sm:mx-4">
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
                    Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                    dignissim placerat nisi, adipiscing mauris non.
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
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8">
            <div className="w-full md:w-1/2">
              <p className="text-xs sm:text-sm text-[#FFB23F] font-semibold mb-2">
                Articles
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#151411] leading-snug">
                The best furniture comes <br /> from Lalasia
              </h2>
              <p className="text-base sm:text-lg text-gray-500 mt-6 sm:mt-10">
                Pellentesque etiam blandit in tincidunt at donec.
              </p>
              <div className="relative w-full max-w-[582px] h-auto max-h-[536px] rounded-lg overflow-hidden shadow-lg mt-6 sm:mt-8">
                <img
                  src="/image/hetcuu.png"
                  alt="Phòng ăn ấm cúng"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                {/* Nội dung chữ */}
                <div className="absolute bottom-0 p-4 sm:p-6 text-white">
                  <p className="text-xs sm:text-sm opacity-70">
                    Tips and Trick
                  </p>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mt-1">
                    Create Cozy Dinning Room Vibes
                  </h3>
                  <p className="text-xs sm:text-sm mt-1 opacity-80">
                    Decorating with neutral tones brings balance to the dining
                    room...
                  </p>
                  <button className="mt-3 sm:mt-4 underline text-xs sm:text-sm">
                    Read more
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
                  category: "Tips and Trick",
                  title: "6 ways to give your home minimalistic vibes",
                  author: "Jerremy Jean",
                  avatar: "/image/human1.png",
                  date: "Friday, 1 April 2022",
                },
                {
                  image: "/image/hetcuu3.png",
                  category: "Design Inspiration",
                  title: "How to make your interiors cooler and more stylish",
                  author: "Michaela Augus",
                  avatar: "/image/human1.png",
                  date: "Friday, 1 April 2022",
                },
                {
                  image: "/image/hetcuu4.png",
                  category: "Tips and Trick",
                  title: "Elements to add character to your space",
                  author: "Kim Gurameh",
                  avatar: "/image/human1.png",
                  date: "Friday, 1 April 2022",
                },
              ].map((article, idx) => (
                <div key={idx} className="flex gap-4 sm:gap-5 items-stretch">
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
                        by {article.author}
                      </span>
                      <span>· {article.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 md:mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between text-center gap-4 sm:gap-6">
              <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800">
                Join with me to get special discount
              </p>
              <button className="bg-teal-600 text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-teal-700 transition">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrangChu;
