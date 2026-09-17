import heroImg from "../assets/hero_section.webp";

const HeroSection = () => {
  return (
    <div className="relative w-full h-[90vh] md:min-h-[580px] overflow-hidden flex flex-col items-center justify-center text-center pt-24 shadow-lg">
      <img
        src={heroImg}
        alt="hero-img"
        className="absolute inset-0 w-full h-full object-cover object-[50%_8%] z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/10 z-0"></div>
      <div className="relative z-10 max-w-7xl w-full flex flex-col items-center justify-center">
        <h1 className="text-9xl font-bold text-white tracking-wide">Zeta</h1>
        <p className="text-white text-2xl font-light">
          Wear Your Passion, Back Your Team.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
