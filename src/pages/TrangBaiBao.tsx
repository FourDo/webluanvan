import React from "react";
import ArticleSwiper from "../components/ArticleSwiper";

function TrangBaiBao() {
  const popularArticles = [
    {
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
      category: "Tips and Trick",
      title: "Beautiful and Functional Home Terrace Decoration",
      desc: "Home terrace decorations are part of every decoration or overall home design. Interiordesign.id – If by chance your house has enough space or space.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      author: "Morgan Goldberg",
      date: "Friday, 1 April 2022",
    },
    {
      image:
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80",
      category: "Design Inspiration",
      title:
        "Modern Minimalist Home Design: Aesthetics of Modern Home Interiors",
      desc: "Home terrace decorations are part of every decoration or overall home design. Interiordesign.id – If by chance your house has enough space or space.",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      author: "Rizal Ahmad",
      date: "Wednesday, 17 March 2022",
    },
    {
      image:
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=300&q=80",
      category: "Color Guide",
      title:
        "20+ Best Kitchen Paint Colors That Make Kitchen Spaces Look More Fun",
      desc: "Home terrace decorations are part of every decoration or overall home design. Interiordesign.id – If by chance your house has enough space or space.",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      author: "Filipus Pendi",
      date: "Saturday, 29 February 2022",
    },
  ];

  return (
    <div className="relative mt-10 bg-gray-50 bg-cover bg-center font-sa">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col justify-center items-center mb-6 sm:mb-8 text-center">
          <h1 className="mt-8 sm:mt-10 mb-4 sm:mb-6 text-4xl sm:text-5xl font-bold">
            Article
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md sm:max-w-xl">
            We display products based on the latest products we have, if you
            want <br />
            to see our old products please enter the name of the item
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-[1240px] h-[550px]">
          <ArticleSwiper />
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10">
        <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-4">
          <p className="text-xs sm:text-sm text-[#FFB23F] font-semibold mb-2">
            Portofolio
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#151411] leading-snug">
            Today top headlines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Article 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                alt="Bedroom"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <p className="text-gray-400 text-sm mb-1">Design Inspiration</p>
                <h3 className="font-bold text-lg mb-2">
                  Bedroom Design is the Most Personal...
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Is it true that the bedroom design is the most personal
                  reflection of the owner? Many people believe that to be able
                  to judge a person's s...
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Jenny Agnes"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold text-black">
                    By Jenny Agnes
                  </span>
                  <span>·</span>
                  <span>Tuesday, 17 May 2022</span>
                </div>
              </div>
            </div>
            {/* Article 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=600&q=80"
                alt="Living Room"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <p className="text-gray-400 text-sm mb-1">Tips and Trick</p>
                <h3 className="font-bold text-lg mb-2">
                  Create a non-monotonous and dynamic ...
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Quoted from The Healthy Home Economist, a study in 1932 stated
                  that color doesn't really have to be visible to have an
                  effect...
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <img
                    src="https://randomuser.me/api/portraits/women/65.jpg"
                    alt="Juliana Athorn"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold text-black">
                    By Juliana Athorn
                  </span>
                  <span>·</span>
                  <span>Wednesday, 22 January 2022</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Popular last week section */}
      <div className="max-w-7xl mx-auto mt-16 sm:mt-20 md:mt-24 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
        <p className="text-xs sm:text-sm md:text-base text-[#FFB23F] font-semibold mb-2">
          Trending Topics
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#151411] mb-4 sm:mb-6">
          Popular last week
        </h2>
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3 sm:gap-4">
          <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#151411] text-white text-sm sm:text-base font-semibold">
              All
            </button>
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-gray-500 text-sm sm:text-base font-semibold hover:bg-gray-100">
              Tips and Trick
            </button>
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-gray-500 text-sm sm:text-base font-semibold hover:bg-gray-100">
              Interior Design
            </button>
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-gray-500 text-sm sm:text-base font-semibold hover:bg-gray-100">
              Design Inspiration
            </button>
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-gray-500 text-sm sm:text-base font-semibold hover:bg-gray-100">
              Color Guide
            </button>
          </div>
          <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-md text-gray-700 text-sm sm:text-base font-semibold">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="inline-block"
            >
              <path d="M3 6h12M6 9v6m6-6v6" />
            </svg>
            Filter
          </button>
        </div>
        {/* Article list */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {popularArticles.map((article, idx) => (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6" key={idx}>
              <img
                src={article.image}
                alt={article.title}
                className="w-full sm:w-32 md:w-40 h-28 sm:h-24 md:h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">
                  {article.category}
                </p>
                <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
                  {article.desc}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400">
                  <img
                    src={article.avatar}
                    alt={article.author}
                    className="w-5 sm:w-6 h-5 sm:h-6 rounded-full"
                  />
                  <span className="font-semibold text-black">
                    By {article.author}
                  </span>
                  <span>·</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Load More Button */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <button className="px-6 sm:px-8 py-2 sm:py-3 rounded-md border text-sm sm:text-base font-semibold hover:bg-gray-100 transition">
            Load More
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-30 px-4 sm:px-6 md:px-8 ">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between text-center md:text-left">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-0">
            Subscribe our newsletter
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

export default TrangBaiBao;
