const LeagueCard = () => {
  return (
    <section>
      <h2 class="text-3xl text-[#FAFAFC] font-bold tracking-tight mb-6">
        Shop by League
      </h2>
      <div class="relative flex items-center">
        <button class="absolute -left-4 z-10 w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center shadow hover:bg-gray-100">
          ❮
        </button>

        {/* League Items Grid */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-2">
          {/* League 1: Premier League */}
          <a
            href="#"
            class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
          >
            <img
              src="https://s.yimg.com/lo/mysterio/api/3aca8cc4f6d96c273f4c4937c232083d3b14ee7b5fd2e4dd34005dc8a7cf50ee/lightyear_networkapi/resizefill_w960%3Bquality_80%3Bformat_webp/https%3A%2F%2Fmedia.zenfs.com%2Fen%2Fthe_football_faithful_articles_458%2F8272d1245b72b55420f0911736e58059"
              alt="Premier League"
              class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
            />
            <div class="absolute inset-0 from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
            <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-2">
              <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                League
              </span>
              <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                Premier League
              </h3>
            </div>
          </a>

          {/* League 2: La Liga */}
          <a
            href="#"
            class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8Ztap1ynqb07jQFqUKJew5FZp_J-HuvkZMu7mxGnxNVGis9hnrKtEdE8&s=10"
              alt="La Liga"
              class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
            />
            <div class="absolute inset-0 from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
            <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-1">
              <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                League
              </span>
              <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                La Liga
              </h3>
            </div>
          </a>

          {/* League 3: Serie A */}
          <a
            href="#"
            class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
          >
            <img
              src="https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2022%2F07%2Fnike-inter-milan-serie-a-2022-23-home-kit-4.jpg?q=90&w=800&cbr=1&fit=max"
              alt="Serie A"
              class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
            />
            <div class="absolute inset-0 from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
            <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-1">
              <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                League
              </span>
              <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                Serie A
              </h3>
            </div>
          </a>

          {/* League 4: Bundesliga */}
          <a
            href="#"
            class="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex items-end p-6 cursor-pointer"
          >
            <img
              src="https://preview.redd.it/fc-bayern-25-26-ucl-jersey-v0-clb17cc72kgf1.jpg?width=1080&crop=smart&auto=webp&s=a421cb15d430f73c327e3e50843a96e3c0994edf"
              alt="Bundesliga"
              class="absolute inset-0 w-full h-full z-0 object-cover group-hover:scale-110 transition-transform duration-500 opacity-95 group-hover:opacity-100"
            />
            <div class="absolute inset-0 from-black/50 via-black/15 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/65"></div>
            <div class="relative z-20 transition-transform duration-300 group-hover:translate-x-1">
              <span class="text-xs font-semibold text-[#D3D648] uppercase tracking-wider block mb-1">
                League
              </span>
              <h3 class="text-xl font-bold text-white tracking-tight drop-shadow-md">
                Bundesliga
              </h3>
            </div>
          </a>
        </div>

        {/* Next Arrow */}
        <button class="absolute -right-4 z-10 w-9 h-9 bg-white border border-gray-400 rounded-full flex items-center justify-center shadow hover:bg-gray-100">
          ❯
        </button>
      </div>
    </section>
  );
};

export default LeagueCard;
