import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const faqData = [
  {
    q: "How does Thesis.io calculate projections?",
    a: "We estimate CAGR using historical price datasets and simulate SIP or lumpsum outcomes using standard financial formulas.",
  },
  {
    q: "Is Thesis.io free to use?",
    a: "All core projection and visualization tools are free. Premium deep-analysis features will launch later.",
  },
  {
    q: "Do you store any trading or banking data?",
    a: "No. We only store the login details required for authentication.",
  },
  {
    q: "Are projections guaranteed?",
    a: "No. These are purely illustrative estimates based on past performance.",
  },
];

const Footer = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const handleLink = (path) => {
    if (!token) return navigate("/");
    navigate(path);
  };

  return (
    <div className="bg-[#0d0f12] text-gray-300 pt-10 pb-8 mt-12 border-t border-white/10">

      {/* ====== THIN SEPARATOR LINE ====== */}
      <div className="w-full h-[1px] bg-gradient-to-r from-sky-500/20 via-white/10 to-emerald-500/20 mb-10"></div>

      {/* -------- FAQ Section -------- */}
      <div className="max-w-5xl mx-auto px-6 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqData.map((item, i) => (
            <div
              key={i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="bg-[#111418] border border-white/10 rounded-xl p-4 cursor-pointer 
                         transition hover:border-sky-500/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.25)]"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-white text-sm md:text-base">
                  {item.q}
                </h3>
                <span
                  className={`transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>

              <div
                className={`transition-all overflow-hidden duration-300 ${
                  openIndex === i ? "max-h-40 mt-3" : "max-h-0"
                }`}
              >
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------- Footer Links -------- */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/about")}>
              About Us
            </li>
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/careers")}>
              Careers
            </li>
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/team")}>
              Our Team
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Help</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/contact")}>
              Contact Us
            </li>
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/support")}>
              Support
            </li>
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/docs")}>
              Documentation
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/privacy")}>
              Privacy Policy
            </li>
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/terms")}>
              Terms of Use
            </li>
            <li className="hover:text-white cursor-pointer hover:pl-1 transition"
                onClick={() => handleLink("/security")}>
              Security
            </li>
          </ul>
        </div>

        {/* SOCIAL ICONS with actual URLs */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Connect</h4>

          <div className="flex gap-4 text-xl text-gray-400">

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition"
            >
              <FaLinkedin />
            </a>

            {/* Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition"
            >
              <FaTwitter />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition"
            >
              <FaInstagram />
            </a>

            {/* Email */}
            <a
              href="mailto:support@thesis.io"
              className="hover:text-white hover:scale-110 transition"
            >
              <FaEnvelope />
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      {/* ------- Bottom Credits ------- */}
      <div className="text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Thesis.io • Built for smarter investing.
      </div>
    </div>
  );
};

export default Footer;
