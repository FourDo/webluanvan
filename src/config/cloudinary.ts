import { Cloudinary } from "@cloudinary/url-gen";

const cloudinary = new Cloudinary({
  cloud: {
    cloudName: "dwyfyxxwq", // Thay bằng Cloud Name của bạn
  },
});

export default cloudinary;
