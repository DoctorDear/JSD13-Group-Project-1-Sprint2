import React from 'react';

const CheckOutItemCard = ({ item }) => {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
                {/* 1. กำหนดขนาดกรอบหุ้มให้ตายตัวด้วย w-16 h-16 หรือ w-20 h-20 และใส่ flex-shrink-0 */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">

                    {/* 2. บังคับให้รูปภาพเต็มกรอบด้วย w-full h-full object-cover */}
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                    />

                    {/* ป้ายแสดงจำนวนสินค้า (ถ้ามี) */}
                    <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity || 1}
                    </span>
                </div>

                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Size : {item.size}</p>
                </div>
            </div>

            <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                ${item.price}
            </div>
        </div>
    );
};

export default CheckOutItemCard;