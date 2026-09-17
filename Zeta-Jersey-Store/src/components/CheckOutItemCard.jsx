const CheckOutItemCard = ({ image, title, size, price, quantity }) => {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
                {/* 1. ห่อหุ้มรูปภาพด้วย div ที่กำหนด relative ไว้ */}
                <div className="relative flex-shrink-0">

                    {/* กรอบรูปภาพ */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-contain p-1"
                        />
                    </div>

                    {/* 2. ย้ายป้ายจำนวนสินค้ามาไว้ข้างนอกกรอบ overflow-hidden เพื่อให้แสดงผลเต็มวงกลม */}
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                        {quantity || 1}
                    </span>
                </div>

                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Size : {size}</p>
                </div>
            </div>

            <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                {price}
            </div>
        </div>
    );
};

export default CheckOutItemCard;