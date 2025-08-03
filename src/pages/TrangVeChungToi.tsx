import { motion } from "framer-motion";
import { Users, Award, Target, Heart, CheckCircle, Star } from "lucide-react";

const TrangVeChungToi = () => {
  const stats = [
    { number: "15+", label: "Năm Kinh Nghiệm", icon: Award },
    { number: "500+", label: "Khách Hàng Hài Lòng", icon: Users },
    { number: "200+", label: "Dự Án Hoàn Thành", icon: CheckCircle },
    { number: "50+", label: "Đối Tác Tin Cậy", icon: Star },
  ];

  const values = [
    {
      icon: Heart,
      title: "Tận Tâm",
      description:
        "Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu, tận tâm trong từng chi tiết.",
    },
    {
      icon: Award,
      title: "Chất Lượng",
      description:
        "Cam kết sử dụng nguyên liệu cao cấp và quy trình sản xuất tiêu chuẩn quốc tế.",
    },
    {
      icon: Target,
      title: "Sáng Tạo",
      description:
        "Không ngừng đổi mới và sáng tạo để mang đến những sản phẩm độc đáo, hiện đại.",
    },
    {
      icon: Users,
      title: "Đội Ngũ",
      description:
        "Đội ngũ thợ thủ công giàu kinh nghiệm và đầy đam mê với nghề.",
    },
  ];

  const team = [
    {
      name: "Nguyễn Văn An",
      position: "Giám Đốc Sáng Tạo",
      image: "/image/human1.png",
      description:
        "Với hơn 20 năm kinh nghiệm trong lĩnh vực thiết kế nội thất.",
    },
    {
      name: "Trần Thị Bình",
      position: "Trưởng Phòng Sản Xuất",
      image: "/image/human2.png",
      description: "Chuyên gia về quy trình sản xuất và kiểm soát chất lượng.",
    },
    {
      name: "Lê Minh Công",
      position: "Kiến Trúc Sư Trưởng",
      image: "/image/human1.png",
      description: "Tốt nghiệp xuất sắc từ Đại học Kiến trúc Hà Nội.",
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="relative mt-10 bg-gray-50 font-sa">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#518581] to-[#3d6360] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Về Chúng Tôi
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Hành trình 15 năm kiến tạo không gian sống đẹp với tình yêu và sự
              tận tâm
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Stats Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <Icon className="w-12 h-12 text-[#518581] mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-[#FFB23F] font-semibold text-sm uppercase tracking-wider">
              Câu Chuyện Của Chúng Tôi
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-4 mb-6">
              Khởi Nguồn Từ Đam Mê
              <br />
              Kiến Tạo Không Gian Đẹp
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Được thành lập vào năm 2009, NộiThấtVN bắt đầu từ một xưởng gỗ
                nhỏ với ước mơ mang đến những sản phẩm nội thất chất lượng cao
                cho mọi gia đình Việt Nam.
              </p>
              <p>
                Trải qua 15 năm phát triển, chúng tôi đã không ngừng học hỏi,
                cải tiến và mở rộng quy mô để trở thành một trong những thương
                hiệu nội thất uy tín hàng đầu tại Việt Nam.
              </p>
              <p>
                Với đội ngũ thợ thủ công giàu kinh nghiệm và các nhà thiết kế
                tài năng, chúng tôi luôn đặt chất lượng và sự hài lòng của khách
                hàng lên hàng đầu.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="/image/learnmore1.jpg"
              alt="Xưởng sản xuất nội thất"
              className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#518581] text-white p-6 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm">Năm Kinh Nghiệm</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#FFB23F] font-semibold text-sm uppercase tracking-wider">
              Giá Trị Cốt Lõi
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-4 mb-6">
              Những Giá Trị Mà Chúng Tôi Theo Đuổi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mỗi sản phẩm chúng tôi tạo ra đều mang trong mình những giá trị
              cốt lõi và cam kết về chất lượng.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-[#518581] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3d6360] transition-colors duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#FFB23F] font-semibold text-sm uppercase tracking-wider">
            Đội Ngũ Của Chúng Tôi
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-4 mb-6">
            Những Con Người Tài Năng
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm và đầy đam mê với nghề.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {team.map((member, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-[#518581] font-semibold mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#518581] to-[#3d6360] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Bắt Đầu Hành Trình Tạo Nên Ngôi Nhà Mơ Ước
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Hãy để chúng tôi đồng hành cùng bạn kiến tạo không gian sống hoàn
              hảo với những sản phẩm nội thất chất lượng cao.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#518581] font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                Xem Sản Phẩm
              </button>
              <button className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-[#518581] transition-all">
                Liên Hệ Tư Vấn
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TrangVeChungToi;
