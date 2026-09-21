const CartItemCard = ({ item, onUpdateQuantity, onRemoveItem }) => {
    return (
        <div className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
            {/* รูปภาพ และ รายละเอียดสินค้า */}
            <div className="flex items-center gap-4">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                />
                <div>
                    <h4 className="text-sm font-bold text-gray-900 max-w-xs">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Size : {item.size}</p>
                    <p className="text-base font-bold text-gray-900 mt-1">฿{item.price}</p>
                </div>
            </div>

            {/* ฝั่งขวาของแถว: ปุ่มถังขยะ และ ปุ่มเพิ่ม/ลดจำนวน */}
            <div className="flex flex-col items-end justify-between h-20 py-1">
                <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                >
                    {/* ไอคอนถังขยะ */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>

                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-gray-600 hover:text-black font-bold px-1"
                    >
                        -
                    </button>
                    <span className="mx-2 text-sm font-semibold">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-600 hover:text-black font-bold px-1"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;