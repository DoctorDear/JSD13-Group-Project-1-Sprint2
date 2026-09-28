import SleeveBadgeDetails from '../personalization/SleeveBadgeDetails.jsx';

const CheckOutItemCard = ({ item, image, title, size, price, quantity }) => {
    // Supports both individual props and an item={item} object.
    const targetItem = item || { image, title, size, price, quantity };

    const product = targetItem.productId || {};
    const imgSrc = product.images?.[0] || product.image || product.imageUrl || targetItem.image || targetItem.imageUrl || targetItem.img || '';
    const itemTitle = product.name || targetItem.title || targetItem.name || targetItem.productName || 'Product Name';
    const itemSize = targetItem.size || targetItem.selectedSize || '-';
    const itemPrice = targetItem.price ?? targetItem.productId?.price ?? targetItem.unitPrice ?? 0;
    const itemQty = targetItem.quantity || targetItem.qty || 1;

    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
                {/* Product image */}
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                            src={imgSrc}
                            alt={itemTitle}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Quantity badge */}
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                        {itemQty}
                    </span>
                </div>

                {/* Product name and size */}
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2">
                        {itemTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Size : {itemSize}</p>
                    <SleeveBadgeDetails item={targetItem} />
                </div>
            </div>

            {/* Product price */}
            <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                ฿{Number(itemPrice).toLocaleString()} / shirt
            </div>
        </div>
    );
};

export default CheckOutItemCard;
