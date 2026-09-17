import { Truck, Box, RotateCcw } from "lucide-react";

const PromoBar = () => {
  return (
    <section class="bg-[#D3D648]/95">
      <div class="grid grid-cols-3">
        {/* free */}
        <div class="h-10 flex items-center justify-center gap-2 text-md font-medium text-[#1E0E8A]">
          <Truck />
          <span>Free Shipping</span>
        </div>

        {/* COD */}
        <div class="h-10 flex items-center justify-center gap-2 text-md font-medium text-[#1E0E8A]">
          <Box />
          <span>Cash on Delivery (COD)</span>
        </div>

        {/* return */}
        <div class="h-10 flex items-center justify-center gap-2 text-md font-medium text-[#1E0E8A]">
          <RotateCcw />
          <span>Return within 14 days</span>
        </div>
      </div>
    </section>
  );
};

export default PromoBar;
