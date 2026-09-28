import heroImages from "../../data/heroImages.json";

const HeroSection = () => {
  return (
    <div className="relative w-full h-[380px] sm:h-[420px] lg:h-[900px] overflow-hidden flex flex-col items-center justify-center text-center pt-24 shadow-lg">
      <img
        src={heroImages[2].url}
        srcSet={heroImages.map(({ url, width }) => `${url} ${width}w`).join(", ")}
        sizes="100vw"
        width={heroImages[2].width}
        height={heroImages[2].height}
        fetchPriority="high"
        loading="eager"
        alt="Zeta football jersey collection"
        className="absolute inset-0 w-full h-full object-cover object-[50%_8%] z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/10 z-0"></div>
      <div className="relative z-10 max-w-7xl w-full px-4 flex flex-col items-center justify-center">
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold text-white tracking-wide">Zeta</h1>
        <p className="mt-2 text-white text-sm sm:text-xl md:text-2xl font-light">
          Wear Your Passion, Back Your Team.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
