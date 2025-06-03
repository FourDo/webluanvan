import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 text-black border-t border-gray-200 py-10 ">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo + Description */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {/* Replace this with your logo image if needed */}
            <div className="w-6 h-6 bg-orange-500 rounded-sm" />
            <span className="text-lg font-semibold">Lalasia</span>
          </div>
          <p className="text-sm text-gray-600">
            Lalasia is digital agency that help you make better experience
            iaculis cras in.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Product</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="#">New Arrivals</a>
            </li>
            <li>
              <a href="#">Best Selling</a>
            </li>
            <li>
              <a href="#">Home Decor</a>
            </li>
            <li>
              <a href="#">Kitchen Set</a>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Services</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="#">Catalog</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">FaQ</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Follow Us</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="#" className="flex items-center gap-2">
                <FaFacebookF /> Facebook
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2">
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2">
                <FaTwitter /> Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
