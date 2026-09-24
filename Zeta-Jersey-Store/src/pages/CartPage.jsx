import { useState, useEffect } from 'react';
import CartItemCard from '../components/CartItemCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discountCode, setDiscountCode] = useState('');

    // 1. ดึงข้อมูลตะกร้าจาก localStorage เมื่อเข้าหน้า CartPage
    const fetchCart = () => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
            console.log("LOADED CART FROM LOCALSTORAGE:", savedCart);
            setCartItems(Array.isArray(savedCart) ? savedCart : []);
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // 2. ฟังก์ชันอัปเดตจำนวนสินค้า (quantity) และบันทึกลง localStorage ทันที
    const handleUpdateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return; // ป้องกันจำนวนน้อยกว่า 1

        const updatedItems = cartItems.map(item =>
            (item._id === id || item.id === id) ? { ...item, quantity: newQuantity } : item
        );

        setCartItems(updatedItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    };

    // 3. ฟังก์ชันลบสินค้าออกจากตะกร้าและอัปเดต localStorage
    const handleRemoveItem = (id) => {
        const updatedItems = cartItems.filter(item => item._id !== id && item.id !== id);

        setCartItems(updatedItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    };

    // ฟังก์ชันสร้างคำสั่งซื้อเมื่อกด Go to Checkout
    const handleGoToCheckout = () => {
        const checkoutData = {
            cartItems,
            summary: {
                subtotal,
                discount,
                shippingFee: deliveryFee,
                total
            }
        };

        // บันทึกสำรองไว้กันรีเฟรชหาย
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

        // ส่งผ่าน navigate ไปหน้า checkout
        navigate('/checkout', { state: checkoutData });
    };

    // คำนวณราคารวม
    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.price || item.productId?.price || 0;
        return acc + price * (item.quantity || 1);
    }, 0);

    const discount = subtotal * 0.20;
    const deliveryFee = 15;
    const total = subtotal - discount + deliveryFee;

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between">
            <Navbar page="cart" />
            <div className="max-w-6xl mx-auto w-full p-4 lg:p-8">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-6 tracking-wide">
                    YOUR CART
                </h1>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-6 lg:mb-0">
                        {cartItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">ตะกร้าสินค้าของคุณว่างเปล่า</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item, index) => (
                                    <CartItemCard
                                        key={item._id || item.id || index}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemoveItem={handleRemoveItem}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">฿{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Discount (-20%)</span>
                                <span className="font-bold text-red-500">-฿{discount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span className="font-bold text-gray-900">฿{deliveryFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                                <span>Total</span>
                                <span>฿{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-5">
                            <input
                                type="text"
                                placeholder="Add promo code"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                className="w-full h-11 px-4 rounded-full border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-900 bg-gray-50"
                            />
                            <button className="h-11 px-6 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-full transition-colors">
                                Apply
                            </button>
                        </div>

                        <button
                            onClick={handleGoToCheckout}
                            className="w-full h-12 mt-4 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold rounded-full transition-colors shadow-sm"
                        >
                            Go to Checkout
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CartPage;