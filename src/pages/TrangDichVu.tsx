const TrangDichVu = () => {
  const Service = [
    {
      id: 1,
      name: "Nội Thất Gia Đình",
      text: "Thiết kế và thi công nội thất cho không gian sống gia đình với phong cách hiện đại, ấm cúng và tiện nghi.",
    },
    {
      id: 2,
      name: "Trang Trí Nội Thất",
      text: "Tạo nên không gian sống đẹp mắt với các phụ kiện trang trí cao cấp, mang lại cảm giác thư giãn và sang trọng.",
    },
    {
      id: 3,
      name: "Tủ Bếp Cao Cấp",
      text: "Thiết kế và lắp đặt hệ thống tủ bếp modular với chất liệu cao cấp, tối ưu hóa không gian và công năng sử dụng.",
    },
    {
      id: 4,
      name: "Thiết Kế Nội Thất",
      text: "Dịch vụ thiết kế nội thất chuyên nghiệp với các ý tưởng sáng tạo, phù hợp với phong cách và nhu cầu của từng khách hàng.",
    },
    {
      id: 5,
      name: "Thiết Kế Ngoại Thất",
      text: "Thiết kế và thi công ngoại thất với các giải pháp bền vững, thẩm mỹ cao cho sân vườn, hiên nhà và không gian ngoài trời.",
    },
    {
      id: 6,
      name: "Nội Thất Đặt Làm",
      text: "Chế tác nội thất theo yêu cầu với chất liệu gỗ cao cấp và thiết kế hiện đại, mang đến sự độc đáo cho ngôi nhà của bạn.",
    },
  ];

  const projects = [
    {
      image: "/image/dichvu3.png",
      title: "Thiết Kế Phòng Khách Jeruk Veldevana",
      text: "Chúng tôi thiết kế phòng khách với phong cách hiện đại, sử dụng tông màu ấm và nội thất gỗ tự nhiên",
    },
    {
      image: "/image/dichvu4.png",
      title: "Không Gian Làm Việc Chung Ấm Cúng",
      text: "Thiết kế không gian co-working với môi trường thoải mái, tận dụng ánh sáng tự nhiên và bố trí thông minh",
    },
  ];

  return (
    <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col justify-center items-center mb-6 sm:mb-8 text-center">
          <h1 className="mt-8 sm:mt-10 mb-4 sm:mb-6 text-4xl sm:text-5xl font-bold">
            Dịch vụ của chúng tôi
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md sm:max-w-xl">
            Sản phẩm được chế tác bởi những người thợ thủ công tài năng và sử
            dụng chất liệu cao cấp với tình yêu thương bên trong
          </p>
        </div>
      </div>

      {/* Hero Image */}
      <div className="flex justify-center items-center w-full h-[300px] sm:h-[450px] md:h-[550px]">
        <img
          src="/image/dichvu.png"
          alt="Service Banner"
          className="object-cover w-full max-w-[1200px] h-full"
        />
      </div>

      {/* Divider */}
      <div className="flex justify-center items-center w-full">
        <div className="mt-8 h-[1px] w-full max-w-[1200px] bg-gray-200 rounded-full"></div>
      </div>

      {/* Service List */}
      <div className="flex justify-center w-full px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-[1200px] mt-8 sm:mt-12">
          {Service.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col px-2 sm:px-3 md:px-4 group"
            >
              <span className="text-4xl sm:text-5xl font-bold text-[#518581] mb-2 group-hover:text-[#3d6360] transition-colors duration-300">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="font-bold text-base sm:text-lg mb-2 group-hover:text-[#518581] transition-colors duration-300">
                {item.name}
              </span>
              <span className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10">
        <div className="flex flex-col sm:flex-row md:flex-row justify-between items-start gap-4 sm:gap-6 md:gap-8">
          <div className="w-full sm:w-1/2 md:w-1/2">
            <p className="text-xs sm:text-sm text-[#FFB23F] font-semibold mb-2">
              Dự Án Tiêu Biểu
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#151411] leading-snug">
              Những dự án tuyệt vời <br /> mà chúng tôi đã thực hiện
            </h2>
            <div className="relative w-full max-w-[582px] h-auto max-h-[400px] sm:max-h-[500px] md:max-h-[536px] rounded-lg overflow-hidden shadow-lg mt-4 sm:mt-6 md:mt-8 group">
              <img
                src="/image/dichvu2.png"
                alt="Phòng ngủ ấm cúng"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-3 sm:p-4 md:p-6 text-white">
                <h3 className="text-sm sm:text-base md:text-xl font-bold mt-1">
                  Phòng Ngủ Chị Siska Kohl
                </h3>
                <p className="text-xs sm:text-sm md:text-base mt-1 opacity-80">
                  Chúng tôi bắt đầu cải tạo phòng ngủ với phong cách tối giản và
                  sử dụng sự kết hợp giữa màu trắng và chất liệu gỗ tự nhiên
                </p>
                <button className="mt-2 sm:mt-3 md:mt-4 underline text-xs sm:text-sm hover:text-[#FFB23F] transition-colors">
                  Xem Chi Tiết
                </button>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 md:w-1/2 flex flex-col gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-0">
            <div className="flex flex-col items-end justify-center">
              <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-2 text-right">
                Với nhiều năm kinh nghiệm trong lĩnh vực thiết kế nội thất,
                chúng tôi cam kết mang đến những giải pháp tối ưu nhất cho không
                gian sống của bạn.
              </p>
              <p className="text-[#518581] mt-3 sm:mt-4 cursor-pointer hover:underline hover:text-[#3d6360] transition-all">
                Xem Tất Cả Dự Án
              </p>
            </div>

            {projects.map((project, idx) => (
              <div
                key={idx}
                className="relative w-full max-w-3xl mx-auto mt-6 sm:mt-8 md:mt-10 rounded overflow-hidden group cursor-pointer"
              >
                <img
                  src={project.image}
                  className="w-full h-[180px] sm:h-[200px] md:h-[235px] object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={project.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-3 sm:p-4 md:p-6 text-white z-10">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base mt-1 opacity-90">
                    {project.text}
                  </p>
                  <button className="mt-2 sm:mt-3 underline text-xs sm:text-sm hover:text-[#FFB23F] transition-colors">
                    Xem Chi Tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 md:px-8 py-12">
        <div className="bg-gradient-to-r from-[#518581] to-[#3d6360] rounded-2xl p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between text-center md:text-left">
            <div className="mb-6 md:mb-0">
              <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-white mb-2">
                Bạn có muốn làm việc
                <br className="hidden md:block" /> cùng chúng tôi?
              </h2>
              <p className="text-white/80 text-sm sm:text-base">
                Hãy liên hệ với chúng tôi để được tư vấn miễn phí
              </p>
            </div>
            <button className="bg-white text-[#518581] font-semibold px-8 py-4 rounded-lg flex items-center gap-2 text-base md:text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
              Liên Hệ Ngay
              <span className="ml-2 text-xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrangDichVu;
