const Collections = () => {
  return (
    <section>
      <h2 class="text-3xl text-[#FAFAFC] font-bold tracking-tight mb-6">
        Collections
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Big Card */}
        <div class="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 min-h-[500px] lg:min-h-[540px] flex flex-col justify-end p-8 group cursor-pointer">
          <img
            src="https://i.pinimg.com/736x/fa/82/d6/fa82d62965395f81bfec38c968f0f260.jpg"
            alt="Special Away Jersey Collection"
            class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
          <div class="absolute inset-0 from-black/85 via-black/30 to-transparent z-10"></div>

          <div class="relative z-20 flex items-end justify-between gap-4 w-full">
            <h3 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FAFAFC] uppercase tracking-tight max-w-xs drop-shadow-md leading-tight">
              A Special Away Jersey For Every Nation
            </h3>
            <a
              href="#"
              class="px-5 py-2.5 bg-[#D3D648]/95 hover:bg-gray-100 text-black font-semibold text-xs tracking-wide shadow-md transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
            >
              View Collection
            </a>
          </div>
        </div>

        {/* Right Grid Container */}
        <div class="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div class="sm:col-span-7 relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 min-h-[240px] lg:min-h-[262px] flex items-end p-6 group cursor-pointer">
            <img
              src="https://i.pinimg.com/736x/46/95/19/46951998341ad8e1a6f300ccbe0298b5.jpg"
              alt="Green Jersey Collection"
              class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div class="absolute inset-0 from-black/60 via-transparent to-transparent z-10"></div>
            <a
              href="#"
              class="relative z-20 ml-auto px-4 py-2 bg-[#D3D648]/95 hover:bg-gray-100 text-black font-semibold text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer"
            >
              View Collection
            </a>
          </div>

          <div class="sm:col-span-5 bg-[#1E0E8A] rounded-3xl p-6 lg:p-7 flex flex-col justify-center shadow-sm min-h-[240px] lg:min-h-[262px]">
            <h3 class="text-lg lg:text-xl font-bold text-white uppercase tracking-tight mb-3 leading-snug">
              Champions League Jersey Collection
            </h3>
            <p class="text-xs text-[#D3D648] leading-relaxed">
              Explore our Champions League Jersey Edition now available in
              store.
            </p>
          </div>

          {/* Bottom Row */}
          <div class="sm:col-span-5 bg-[#1E0E8A] rounded-3xl p-6 lg:p-7 flex flex-col justify-center shadow-sm min-h-[240px] lg:min-h-[262px]">
            <h3 class="text-lg lg:text-xl font-extrabold text-white uppercase tracking-tight mb-3 leading-snug">
              Explore Jerseys From Every Team, Across Every League
            </h3>
            <p class="text-xs text-[#D3D648] leading-relaxed">
              From every league, every club. Find the one that represents you.
            </p>
          </div>

          <div class="sm:col-span-7 relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 min-h-[240px] lg:min-h-[262px] flex items-end p-6 group cursor-pointer">
            <img
              src="https://i.pinimg.com/736x/9c/33/a9/9c33a9c2b5b9d13e95c1f3c3ae0eec77.jpg"
              alt="Retro Jersey Collection"
              class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div class="absolute inset-0 from-black/60 via-transparent to-transparent z-10"></div>
            <a
              href="#"
              class="relative z-20 ml-auto px-4 py-2 bg-[#D3D648]/95 hover:bg-gray-100 text-black font-semibold text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer"
            >
              View Collection
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Collections;
