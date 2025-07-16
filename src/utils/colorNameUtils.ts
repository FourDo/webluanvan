// Bản đồ tên màu từ tiếng Anh sang tiếng Việt
const colorNameMapping: { [key: string]: string } = {
  // Màu cơ bản
  red: "Đỏ",
  blue: "Xanh dương",
  green: "Xanh lá",
  yellow: "Vàng",
  orange: "Cam",
  purple: "Tím",
  pink: "Hồng",
  brown: "Nâu",
  black: "Đen",
  white: "Trắng",
  gray: "Xám",
  grey: "Xám",
  silver: "Bạc",
  gold: "Vàng kim",
  navy: "Xanh hải quân",
  maroon: "Đỏ thẫm",
  olive: "Xanh ô liu",
  lime: "Xanh chanh",
  aqua: "Xanh nước",
  teal: "Xanh mòng két",
  fuchsia: "Hồng tím",
  cyan: "Xanh lơ",
  magenta: "Đỏ tía",

  // Các sắc thái màu đỏ
  crimson: "Đỏ thẫm",
  scarlet: "Đỏ tươi",
  coral: "Đỏ san hô",
  salmon: "Hồng cá hồi",
  rose: "Hồng",
  cherry: "Đỏ anh đào",
  ruby: "Đỏ ruby",
  wine: "Đỏ rượu vang",
  brick: "Đỏ gạch",
  fire: "Đỏ lửa",
  blood: "Đỏ máu",
  tomato: "Đỏ cà chua",

  // Các sắc thái màu xanh
  turquoise: "Xanh ngọc lam",
  azure: "Xanh thiên thanh",
  cobalt: "Xanh coban",
  royal: "Xanh hoàng gia",
  steel: "Xanh thép",
  powder: "Xanh nhạt",
  sky: "Xanh trời",
  midnight: "Xanh đêm",
  sapphire: "Xanh sapphire",
  ocean: "Xanh đại dương",
  electric: "Xanh điện",
  mint: "Xanh bạc hà",
  emerald: "Xanh ngọc lục bảo",
  forest: "Xanh rừng",
  jade: "Xanh ngọc bích",
  sea: "Xanh biển",

  // Các sắc thái màu vàng
  golden: "Vàng kim",
  lemon: "Vàng chanh",
  butter: "Vàng bơ",
  cream: "Kem",
  honey: "Vàng mật ong",
  amber: "Vàng hổ phách",
  mustard: "Vàng mù tạt",
  canary: "Vàng kim tước",
  wheat: "Vàng lúa mì",
  corn: "Vàng bắp",

  // Các sắc thái màu tím
  violet: "Tím",
  lavender: "Tím lavender",
  plum: "Tím mận",
  grape: "Tím nho",
  orchid: "Tím lan",
  lilac: "Tím nhạt",
  amethyst: "Tím thạch anh",
  indigo: "Chàm",

  // Các sắc thái màu nâu
  chocolate: "Nâu chocolate",
  coffee: "Nâu cà phê",
  caramel: "Nâu caramel",
  tan: "Nâu rám",
  bronze: "Nâu đồng",
  copper: "Nâu đồng đỏ",
  sand: "Nâu cát",
  chestnut: "Nâu hạt dẻ",
  mahogany: "Nâu gỗ gụ",
  sienna: "Nâu đất",
  umber: "Nâu thẫm",
  sepia: "Nâu nâu",

  // Các sắc thái màu xám
  charcoal: "Xám than",
  slate: "Xám đá phiến",
  smoke: "Xám khói",
  ash: "Xám tro",
  pewter: "Xám thiếc",
  platinum: "Xám bạch kim",
  iron: "Xám sắt",
  graphite: "Xám than chì",

  // Các màu đặc biệt
  beige: "Be",
  ivory: "Ngà",
  pearl: "Ngọc trai",
  snow: "Trắng tuyết",
  vanilla: "Vani",
  peach: "Đào",
  apricot: "Mơ",
  raspberry: "Mâm xôi",
  strawberry: "Dâu",
  watermelon: "Dưa hấu",
  avocado: "Bơ",
  banana: "Chuối",
  coconut: "Dừa",
  papaya: "Đu đủ",
  mango: "Xoài",

  // Màu sắc khác
  neon: "Neon",
  pastel: "Pastel",
  metallic: "Kim loại",
  matte: "Mờ",
  glossy: "Bóng",
  transparent: "Trong suốt",
  opaque: "Đục",
};

// Mapping từ tên màu tiếng Việt sang hex code
const vietnameseToHexMapping: { [key: string]: string } = {
  // Màu cơ bản
  đỏ: "#FF0000",
  "xanh dương": "#0000FF",
  "xanh lá": "#008000",
  vàng: "#FFFF00",
  cam: "#FFA500",
  tím: "#800080",
  hồng: "#FFC0CB",
  nâu: "#A52A2A",
  đen: "#000000",
  trắng: "#FFFFFF",
  xám: "#808080",
  bạc: "#C0C0C0",
  "vàng kim": "#FFD700",
  "xanh hải quân": "#000080",
  "đỏ thẫm": "#800000",
  "xanh ô liu": "#808000",
  "xanh chanh": "#00FF00",
  "xanh nước": "#00FFFF",
  "xanh mòng két": "#008080",
  "hồng tím": "#FF00FF",
  "xanh lơ": "#00FFFF",
  "đỏ tía": "#FF00FF",

  // Các sắc thái màu đỏ
  "đỏ tươi": "#FF2400",
  "đỏ san hô": "#FF7F50",
  "hồng cá hồi": "#FA8072",
  "đỏ anh đào": "#DE3163",
  "đỏ ruby": "#E0115F",
  "đỏ rượu vang": "#722F37",
  "đỏ gạch": "#CB4154",
  "đỏ lửa": "#FF4500",
  "đỏ máu": "#8B0000",
  "đỏ cà chua": "#FF6347",

  // Các sắc thái màu xanh
  "xanh ngọc lam": "#40E0D0",
  "xanh thiên thanh": "#F0FFFF",
  "xanh coban": "#0047AB",
  "xanh hoàng gia": "#4169E1",
  "xanh thép": "#4682B4",
  "xanh nhạt": "#B0E0E6",
  "xanh trời": "#87CEEB",
  "xanh đêm": "#191970",
  "xanh sapphire": "#0F52BA",
  "xanh đại dương": "#006994",
  "xanh điện": "#007FFF",
  "xanh bạc hà": "#98FB98",
  "xanh ngọc lục bảo": "#50C878",
  "xanh rừng": "#228B22",
  "xanh ngọc bích": "#00A86B",
  "xanh biển": "#006994",

  // Các sắc thái màu vàng
  "vàng chanh": "#FFF700",
  "vàng bơ": "#FFDB58",
  kem: "#FFFDD0",
  "vàng mật ong": "#FFB347",
  "vàng hổ phách": "#FFBF00",
  "vàng mù tạt": "#FFDB58",
  "vàng kim tước": "#FFFF31",
  "vàng lúa mì": "#F5DEB3",
  "vàng bắp": "#FBEC5D",

  // Các sắc thái màu tím
  "tím lavender": "#E6E6FA",
  "tím mận": "#8E4585",
  "tím nho": "#6F2DA8",
  "tím lan": "#DA70D6",
  "tím nhạt": "#DDA0DD",
  "tím thạch anh": "#9966CC",
  chàm: "#4B0082",

  // Các sắc thái màu nâu
  "nâu chocolate": "#D2691E",
  "nâu cà phê": "#6F4E37",
  "nâu caramel": "#AF6E4D",
  "nâu rám": "#D2B48C",
  "nâu đồng": "#CD7F32",
  "nâu đồng đỏ": "#B87333",
  "nâu cát": "#C2B280",
  "nâu hạt dẻ": "#954535",
  "nâu gỗ gụ": "#C04000",
  "nâu đất": "#A0522D",
  "nâu thẫm": "#704214",

  // Các sắc thái màu xám
  "xám than": "#36454F",
  "xám đá phiến": "#708090",
  "xám khói": "#848884",
  "xám tro": "#B2BEB5",
};

/**
 * Chuyển đổi tên màu tiếng Việt thành hex code
 * @param vietnameseName - Tên màu tiếng Việt
 * @returns Mã hex tương ứng hoặc null nếu không tìm thấy
 */
export const getHexFromVietnameseName = (
  vietnameseName: string
): string | null => {
  if (!vietnameseName) return null;

  const normalizedName = vietnameseName.toLowerCase().trim();
  return vietnameseToHexMapping[normalizedName] || null;
};

// Fallback function để lấy tên màu từ hex code mà không cần thư viện
const getColorNameFromHex = (hexCode: string): string => {
  // Chuẩn hóa hex code
  const hex = hexCode.replace("#", "").toLowerCase();

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Định nghĩa các màu cơ bản với RGB values
  const basicColors = [
    { name: "Đen", r: 0, g: 0, b: 0 },
    { name: "Trắng", r: 255, g: 255, b: 255 },
    { name: "Đỏ", r: 255, g: 0, b: 0 },
    { name: "Xanh lá", r: 0, g: 255, b: 0 },
    { name: "Xanh dương", r: 0, g: 0, b: 255 },
    { name: "Vàng", r: 255, g: 255, b: 0 },
    { name: "Cam", r: 255, g: 165, b: 0 },
    { name: "Tím", r: 128, g: 0, b: 128 },
    { name: "Hồng", r: 255, g: 192, b: 203 },
    { name: "Nâu", r: 165, g: 42, b: 42 },
    { name: "Xám", r: 128, g: 128, b: 128 },
    { name: "Xanh lơ", r: 0, g: 255, b: 255 },
    { name: "Xanh hải quân", r: 0, g: 0, b: 128 },
    { name: "Xanh ô liu", r: 128, g: 128, b: 0 },
    { name: "Đỏ thẫm", r: 128, g: 0, b: 0 },
    { name: "Bạc", r: 192, g: 192, b: 192 },
  ];

  // Tìm màu gần nhất bằng cách tính khoảng cách Euclidean
  let minDistance = Infinity;
  let closestColor = "Không xác định";

  basicColors.forEach((color) => {
    const distance = Math.sqrt(
      Math.pow(r - color.r, 2) +
        Math.pow(g - color.g, 2) +
        Math.pow(b - color.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color.name;
    }
  });

  return closestColor;
};

/**
 * Lấy tên màu tiếng Việt từ mã hex (phiên bản đồng bộ)
 * @param hexCode - Mã màu hex (ví dụ: #FF0000)
 * @returns Tên màu bằng tiếng Việt
 */
export const getVietnameseColorName = (hexCode: string): string => {
  try {
    // Sử dụng fallback function
    return getColorNameFromHex(hexCode);
  } catch (error) {
    console.error("Error getting color name:", error);
    return "Không xác định";
  }
};

/**
 * Lấy thông tin chi tiết về màu
 * @param hexCode - Mã màu hex
 * @returns Object chứa thông tin màu
 */
export const getColorInfo = (hexCode: string) => {
  const vietnameseName = getVietnameseColorName(hexCode);

  return {
    hex: hexCode,
    vietnameseName,
    englishName: "Unknown", // Fallback since we don't have the library
    distance: 0,
  };
};

/**
 * Tìm kiếm màu theo tên tiếng Việt
 * @param searchTerm - Từ khóa tìm kiếm
 * @returns Danh sách màu phù hợp
 */
export const searchColorsByVietnameseName = (searchTerm: string) => {
  const results: Array<{
    hex: string;
    vietnameseName: string;
    englishName: string;
  }> = [];
  const lowerSearchTerm = searchTerm.toLowerCase();

  // Tìm trong mapping (simplified version without external library)
  for (const [english, vietnamese] of Object.entries(colorNameMapping)) {
    if (vietnamese.toLowerCase().includes(lowerSearchTerm)) {
      // Generate a sample hex color for demonstration
      const sampleHex =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
          .toUpperCase();

      results.push({
        hex: sampleHex,
        vietnameseName: vietnamese,
        englishName: english,
      });
    }
  }

  return results.slice(0, 10); // Limit to 10 results
};

export default {
  getVietnameseColorName,
  getColorInfo,
  searchColorsByVietnameseName,
  getHexFromVietnameseName,
};
