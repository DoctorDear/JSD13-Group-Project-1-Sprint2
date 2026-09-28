import SleeveBadgeDetails from '../personalization/SleeveBadgeDetails.jsx';
import { Link } from 'react-router-dom';

const CartItemCard = ({ item, onUpdateQuantity, onRemoveItem }) => {
    // Cart item identity and populated product details.
    const product = item.productId || {};
    const productId = product?._id || product?.id || (typeof product === 'string' ? product : null);
    const productUrl = productId ? `/products/${productId}` : null;

    const itemImage = product.images?.[0] || product.image || product.imageUrl || item.image || '';
    const itemName = product.name || item.name || 'Product';
    const itemPrice = item.price ?? product.price ?? 0;

    return (
        <div className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
            {/* Image and product details */}
            <div className="flex items-center gap-4">
                {productUrl ? (
                    <Link to={productUrl} aria-label={`View ${itemName}`} className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-900">
                        <img
                            src={itemImage}
                            alt={itemName}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                        />
                    </Link>
                ) : (
                    <img
                        src={itemImage}
                        alt={itemName}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                    />
                )}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 max-w-xs">
                        {productUrl ? <Link to={productUrl} className="hover:text-indigo-900 hover:underline focus-visible:underline">{itemName}</Link> : itemName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">Size : {item.size}</p>
                    <SleeveBadgeDetails item={item} />
                    <p className="text-base font-bold text-gray-900 mt-1">Unit price: ฿{Number(itemPrice).toLocaleString()}</p>
                </div>
            </div>

            {/* Remove and quantity controls */}
            <div className="flex flex-col items-end justify-between h-20 py-1">
                <button
                    onClick={() => onRemoveItem(item._id || item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                >
                    {/* Trash icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>

                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <button
                        onClick={() => onUpdateQuantity(item._id || item.id, Math.max(1, item.quantity - 1))}
                        className="text-gray-600 hover:text-black font-bold px-1"
                    >
                        -
                    </button>
                    <span className="mx-2 text-sm font-semibold">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item._id || item.id, item.quantity + 1)}
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
