const CheckOutItemCard = ({ item, image, title, size, price, quantity }) => {
    // รองรับทั้งแบบรับ prop เดี่ยวๆ และแบบรับก้อน item={item}
    const targetItem = item || { image, title, size, price, quantity };

    // เช็คชื่อฟิลด์รูปภาพและชื่อสินค้าเผื่อกรณีที่ API ตั้งชื่อฟิลด์ต่างกัน
    const imgSrc = targetItem.image || targetItem.imageUrl || targetItem.img || '';
    const itemTitle = targetItem.title || targetItem.name || targetItem.productName || 'Product Name';
    const itemSize = targetItem.size || targetItem.selectedSize || '-';
    const itemPrice = targetItem.price || targetItem.unitPrice || 0;
    const itemQty = targetItem.quantity || targetItem.qty || 1;

    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
                {/* 1. กรอบรูปภาพสินค้า */}
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                            src={imgSrc}
                            alt={itemTitle}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* 2. ป้ายวงกลมแสดงจำนวนสินค้า */}
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                        {itemQty}
                    </span>
                </div>

                {/* 3. ชื่อสินค้าและขนาด */}
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2">
                        {itemTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Size : {itemSize}</p>
                </div>
            </div>

            {/* 4. ราคาสินค้า */}
            <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                ฿{Number(itemPrice).toLocaleString()}
            </div>
        </div>
    );
};

export default CheckOutItemCard;