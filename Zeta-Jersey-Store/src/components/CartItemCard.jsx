import React from 'react';

const CartItemCard = ({ item, onUpdateQuantity, onRemoveItem }) => {
    return (
        <div className="py-4 flex items-center justify-between gap-4">
            {/* รูปภาพสินค้า */}
            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />

            {/* รายละเอียดสินค้า */}
            <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                <p className="text-xs text-gray-900 mt-1">Size : {item.size}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">฿{item.price}</p>
            </div>

            {/* ปุ่มปรับจำนวน และปุ่มถังขยะ */}
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                    <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2 text-gray-600 font-bold"
                    >
                        -
                    </button>
                    <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 text-gray-600 font-bold"
                    >
                        +
                    </button>
                </div>

                {/* ปุ่มไอคอนถังขยะ */}
                <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    title="Remove item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CartItemCard;