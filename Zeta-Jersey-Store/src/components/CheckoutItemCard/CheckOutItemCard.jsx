import React from 'react';

const CheckoutItemCard = ({ item }) => {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 bg-white gap-3">
            <div className="relative shrink-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-17.5 h-17.5 object-cover rounded-md bg-gray-50 border border-gray-100"
                />
                <span className="absolute -top-1.5 -left-1.5 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {item.quantity}
                </span>
            </div>

            <div className="flex-1 min-w-0 px-1">
                <h4 className="text-xs font-bold text-gray-900 truncate mb-0.5">{item.name}</h4>
                <p className="text-[11px] text-gray-500">Size : {item.size}</p>
            </div>

            <div className="text-right shrink-0">
                <span className="text-xs font-bold text-gray-900">${item.price * item.quantity}</span>
            </div>
        </div>
    );
};

export default CheckoutItemCard;