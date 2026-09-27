import { Truck, Box, RotateCcw } from "lucide-react";

const PromoBar = () => {
  return (
    <section className="bg-[#D3D648]/95">
      <div className="mx-auto grid max-w-7xl grid-cols-3 px-2 py-2 sm:py-0">
        {/* free */}
        <div className="flex min-h-12 flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-medium leading-snug text-[#1E0E8A] sm:min-h-10 sm:flex-row sm:gap-2 sm:text-sm lg:text-base">
          <Truck className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span>Free Shipping</span>
        </div>

        {/* COD */}
        <div className="flex min-h-12 flex-col items-center justify-center gap-1 border-x border-[#1E0E8A]/15 px-1 text-center text-[10px] font-medium leading-snug text-[#1E0E8A] sm:min-h-10 sm:flex-row sm:gap-2 sm:text-sm lg:text-base">
          <Box className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span>Cash on Delivery (COD)</span>
        </div>

        {/* return */}
        <div className="flex min-h-12 flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-medium leading-snug text-[#1E0E8A] sm:min-h-10 sm:flex-row sm:gap-2 sm:text-sm lg:text-base">
          <RotateCcw className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <span>Return within 14 days</span>
        </div>
      </div>
    </section>
  );
};

export default PromoBar;
