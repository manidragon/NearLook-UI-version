import React, { useEffect, useMemo } from "react";
import { LiaShippingFastSolid, LiaGiftSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaFacebookF, FaPinterestP, FaInstagram } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import { useMediaQuery, useTheme } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchCategories } from "../../../redux/Admin/CategorySlice";

const Footer = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const categoryState = useAppSelector((state: any) => state.category);

  useEffect(() => {
    if (!categoryState.categories || categoryState.categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryState.categories]);

  const topCategories = useMemo(() => {
    return (categoryState.categories || [])
      .filter((c: any) => c.level === 1)
      .slice(0, 6);
  }, [categoryState.categories]);

  const currentYear = new Date().getFullYear();

  // On mobile, ONLY show the footer on the home page to maximize screen space elsewhere
  if (isMobile && location.pathname !== '/') {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] font-sans text-gray-300 overflow-hidden border-t border-orange-500/20 mt-10">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-orange-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      <footer className="relative z-10">
        <div className="container mx-auto px-4 lg:px-8 pt-12 md:pt-16">
          {/* MAIN FOOTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
            {/* CONTACT */}
            <div className="flex flex-col space-y-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider relative inline-block">
                Contact Us
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-transparent"></span>
              </h2>

              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500 transition-colors duration-300">
                  <FaMapMarkerAlt className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm leading-relaxed text-gray-400 pt-2">
                  184/F-31/1 Solaimalai Ayyanar Kovil St,<br/>Pugal Coffee Opp, Theni,<br/>Tamil Nadu - 625531
                </p>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500 transition-colors duration-300">
                  <FaPhoneAlt className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <a href="tel:+919876543210" className="text-sm font-medium text-gray-300 hover:text-orange-500 transition-colors">
                  (+91) 9876-543-210
                </a>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500 transition-colors duration-300">
                  <FaEnvelope className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col space-y-1">
                  <a href="mailto:info@nearlooks.com" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">info@nearlooks.com</a>
                  <a href="mailto:career@nearlooks.com" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">career@nearlooks.com</a>
                </div>
              </div>
            </div>

            {/* DYNAMIC CATEGORIES */}
            <div className="flex flex-col space-y-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider relative inline-block">
                Top Categories
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-transparent"></span>
              </h2>
              <ul className="space-y-3">
                {topCategories.length > 0 ? (
                  topCategories.map((cat: any) => (
                    <li key={cat._id}>
                      <Link to={`/products/${cat.categoryId || cat._id}`} className="text-sm text-gray-400 hover:text-orange-500 hover:translate-x-2 transition-all inline-block">
                        {cat.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">Loading categories...</li>
                )}
              </ul>
            </div>

            {/* COMPANY LINKS */}
            <div className="flex flex-col space-y-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider relative inline-block">
                Our Company
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-transparent"></span>
              </h2>
              <ul className="space-y-3">
                <li>
                  <Link to="/shipping-policy" className="text-sm text-gray-400 hover:text-orange-500 hover:translate-x-2 transition-all inline-block">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="text-sm text-gray-400 hover:text-orange-500 hover:translate-x-2 transition-all inline-block">
                    Cancellation & Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="text-sm text-gray-400 hover:text-orange-500 hover:translate-x-2 transition-all inline-block">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-orange-500 hover:translate-x-2 transition-all inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="text-sm text-gray-400 hover:text-orange-500 hover:translate-x-2 transition-all inline-block">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* BECOME A SELLER */}
            <div className="flex flex-col space-y-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider relative inline-block">
                Become a Seller
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-orange-500 to-transparent"></span>
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Join our platform to reach millions of customers and grow your business with NearLook.
              </p>
              <div className="mt-2">
                <Link
                  to="/become-seller"
                  className="inline-flex items-center justify-center bg-orange-700 hover:bg-orange-800 transition-colors px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-lg shadow-orange-700/20 whitespace-nowrap w-full sm:w-auto"
                >
                  Register Now
                </Link>
                <div className="mt-4 text-xs text-gray-500">
                  Already a seller? <Link to="/become-seller" className="text-orange-500 hover:underline">Login here</Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM STRIP */}
        <div className="border-t border-gray-800 bg-black/40">
          <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs sm:text-sm text-gray-500">
              © {currentYear} <span className="text-gray-300 font-medium">NearLook Mart Pvt Ltd</span>. All rights reserved.
            </p>

            <ul className="flex items-center gap-4">
              {[
                { Icon: FaFacebookF, name: "Facebook" },
                { Icon: AiOutlineYoutube, name: "YouTube" },
                { Icon: FaPinterestP, name: "Pinterest" },
                { Icon: FaInstagram, name: "Instagram" }
              ].map((social, index) => (
                <li key={index}>
                  <a
                    href="#"
                    aria-label={social.name}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-orange-500 border border-white/10 hover:border-orange-500 inline-flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 group"
                  >
                    <social.Icon className="text-sm text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;