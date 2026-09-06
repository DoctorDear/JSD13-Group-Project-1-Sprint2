import logo from "../assets/logo/Zeta_Default_Logo_Crop.png";
import { Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <>
      <footer className="bg-[#1E0E8A] text-[#D3D648] mt-20 pt-12 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
          {/* <!-- Contact Info --> */}
          <div className="flex flex-col items-start">
            {/* LOGO */}
            <div>
              <img
                className="w-40 object-contain mb-6"
                src={logo}
                alt="green-jersey-logo"
              />
            </div>

            {/* info */}
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                {/* phone icon */}
                <div className="w-10 h-10 rounded-full bg-white text-[#1E0E8A] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="font-medium">
                  <p>Call 099-999-9999</p>
                  <p>MON - FRI : 09:00 AM - 17:00 PM</p>
                </div>
              </div>

              {/* mail icon */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white text-[#1E0E8A] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <p>Email: customer_service@zeta.com</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-2xl mb-3">Products</h3>
            <ul className="grid grid-cols-1 gap-2 font-light">
              <li>
                <a href="#" className="hover:text-white">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Best Seller
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Collections
                </a>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <a href="#" className="font-semibold text-xl hover:text-white">
              About Us{" "}
            </a>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-xl mb-3">We Accepted</h3>
            <div className="grid grid-flow-col auto-cols-max items-center gap-4">
              <span>VISA</span>
              <span>DISCOVER</span>
              <span>MasterCard</span>
              <span>JCB</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-full mx-auto px-6 text-center text-base text-[#D3D648] border-t border-[#D3D648] pt-8 mt-12">
          &copy; 2026 Zeta
        </div>
      </footer>
    </>
  );
};

export default Footer;
