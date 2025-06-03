function TrangDichVu() {
  const Service = [
    {
      id: 1,
      name: "Furniture",
      text: "At the ultimate smart home, you're met with technology before you even step through the front door.",
    },
    {
      id: 2,
      name: "Home Decoration",
      text: " Create A Calming Summer Escape With Our Luxurious Home Accessories For The Balmy Evenings.",
    },
    {
      id: 3,
      name: "Kitchen Cabinet",
      text: "Introducing the modular kitchen cabinet system. Start with our huge selection of base and wall cabinets.",
    },
    {
      id: 4,
      name: "Interior Design",
      text: "Innovative products often feature innovative designs that play with the patterns we are familiar.",
    },
    {
      id: 5,
      name: "Exterior Design",
      text: "These stylish and resilient products provide up-to-date options for roofing, siding, decking, and outdoor spaces.",
    },
    {
      id: 6,
      name: "Custom Furniture",
      text: "With Quality Materials and Modern Designs, we have Designs for all Tastes. we bring you World Class Designs.",
    },
  ];

  return (
    <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col justify-center items-center mb-6 sm:mb-8 text-center">
          <h1 className="mt-8 sm:mt-10 mb-4 sm:mb-6 text-4xl sm:text-5xl font-bold">
            Services
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md sm:max-w-xl">
            The product crafted by talented crafter and using high <br />
            quality material with love inside
          </p>
        </div>
      </div>
      <div className="flex justify-center items-center w-full h-[300px] sm:h-[450px] md:h-[550px]">
        <img
          src="/image/dichvu.png"
          alt="Service Banner"
          className="object-cover w-full max-w-[1200px] h-full"
        />
      </div>

      <div className="flex justify-center items-center w-full">
        <div className="mt-8 h-[1px] w-full max-w-[1200px] bg-gray-200 rounded-full"></div>
      </div>

      {/* Service List */}
      <div className="flex justify-center w-full px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-[1200px] mt-8 sm:mt-12">
          {Service.map((item, idx) => (
            <div key={item.id} className="flex flex-col px-2 sm:px-3 md:px-4">
              <span className="text-4xl sm:text-5xl font-bold text-[#518581] mb-2">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="font-bold text-base sm:text-lg mb-2">
                {item.name}
              </span>
              <span className="text-gray-400 text-sm sm:text-base">
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
              Portofolio
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#151411] leading-snug">
              Amazing project we’ve <br /> done before
            </h2>
            <div className="relative w-full max-w-[582px] h-auto max-h-[400px] sm:max-h-[500px] md:max-h-[536px] rounded-lg overflow-hidden shadow-lg mt-4 sm:mt-6 md:mt-8">
              <img
                src="/image/dichvu2.png"
                alt="Phòng ăn ấm cúng"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-3 sm:p-4 md:p-6 text-white">
                <h3 className="text-sm sm:text-base md:text-xl font-bold mt-1">
                  Siska Kohl’s Bedroom
                </h3>
                <p className="text-xs sm:text-sm md:text-base mt-1 opacity-80">
                  We start renovating her bedroom with minimalist concept and
                  using combination white and wooden material
                </p>
                <button className="mt-2 sm:mt-3 md:mt-4 underline text-xs sm:text-sm">
                  See Detail
                </button>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/2 flex flex-col gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-0">
            <div className="flex flex-col items-end justify-center">
              <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-2">
                Pellentesque etiam blandit in tincidunt at donec. Eget ipsum
                dignissim placerat nisi, adipiscing mauris non.
              </p>
              <p className="text-[#518581] mt-3 sm:mt-4">View Portofolio</p>
            </div>
            {[
              {
                image: "/image/dichvu3.png",
                title: "Jeruk Veldevana Living Room Design",
                text: "We start renovating her bedroom with minimalist concept and using combination white and wooden material",
              },
              {
                image: "/image/dichvu4.png",
                title: "Cozy Co-working space",
                text: "We start renovating her bedroom with minimalist concept and using combination white and wooden material",
              },
            ].map((article, idx) => (
              <div
                key={idx}
                className="relative w-full max-w-3xl mx-auto mt-6 sm:mt-8 md:mt-10 rounded overflow-hidden"
              >
                <img
                  src={article.image}
                  className="w-full h-[180px] sm:h-[200px] md:h-[235px] object-cover"
                  alt={article.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-3 sm:p-4 md:p-6 text-white z-10">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base mt-1 opacity-90">
                    {article.text}
                  </p>
                  <button className="mt-2 sm:mt-3 underline text-xs sm:text-sm">
                    See Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-30 px-4 sm:px-6 md:px-8 ">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between text-center md:text-left">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-0">
            Are you interested
            <br className="hidden md:block" /> work with us?
          </h2>
          <button className="bg-[#518581] text-white font-semibold px-8 py-3 rounded-md flex items-center gap-2 text-base md:text-lg hover:bg-[#406b67] transition-all">
            Let’s Talk
            <span className="ml-2 text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrangDichVu;
