import logo from "../assets/logo/Zeta_all_Green_Logo.png";

const Navbar = () => {
  return (
    <>
      <nav className="sticky top-4 z-50 mx-4 max-w-7xl md:mx-auto flex items-center justify-between px-6 py-2 bg-[#2F2F2F]/80 backdrop:blur-lg rounded-full shadow-lg">
        {/* left: Logo */}
        <div className="flex items-center">
          <a href="#">
            <img
              className="h-20 w-auto -my-5 object-contain"
              src={logo}
              alt="all-green-logo"
            />
          </a>
        </div>

        {/* center */}
        <div className="flex items-center h-10 bg-[#D3D648]/36 backdrop-blur-lg rounded-full text-white font-medium shadow-sm">
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            New Arrivals
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            Best Seller
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            League
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            Collections
          </a>
          <a href="#" className="px-3.5 py-1.5 hover:text-[#1E0E8A]">
            On Sale
          </a>
        </div>

        {/* right: search & action icons */}
        <div>icon</div>
      </nav>
    </>
  );
};

export default Navbar;
