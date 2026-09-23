import { useState, useEffect } from 'react';
import axios from 'axios';
import CartItemCard from '../components/CartItemCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discountCode, setDiscountCode] = useState('');
    const [email, setEmail] = useState('');

    // 1. ฟังก์ชันดึงข้อมูลตะกร้าจาก Backend (GET /api/v1/users/cart)
    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token'); // ดึง Token จากตอน Login
            const response = await axios.get('http://localhost:3001/api/v1/users/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCartItems(response.data.cart || []);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = (id, newQuantity) => {
        setCartItems(prev =>
            prev.map(item => (item._id === id ? { ...item, quantity: newQuantity } : item))
        );
    };

    // 2. ฟังก์ชันลบสินค้าเฉพาะชิ้นออกจากตะกร้า (DELETE /api/v1/users/cart/:itemId)
    const handleRemoveItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/api/v1/users/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart(); // โหลดข้อมูลตะกร้าใหม่หลังจากลบสำเร็จ
        } catch (error) {
            console.error('Error removing item:', error);
            alert('ไม่สามารถลบสินค้าได้');
        }
    };

    // 3. ฟังก์ชันสร้างคำสั่งซื้อ (POST /api/v1/orders) เมื่อกด Go to Checkout
    const handleCheckout = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/api/v1/orders', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                alert('สร้างคำสั่งซื้อสำเร็จ!');
                setCartItems([]); // ล้างหน้าจอเพราะตะกร้าถูกเคลียร์แล้ว
            }
        } catch (error) {
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
        }
    };

    // คำนวณราคารวม (ตรวจสอบโครงสร้างข้อมูลว่ามี price อยู่ใน item หรือ item.productId)
    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.price || item.productId?.price || 0;
        return acc + price * item.quantity;
    }, 0);

    const discount = subtotal * 0.20;
    const deliveryFee = 15;
    const total = subtotal - discount + deliveryFee;

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูล...</div>;
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
                                        key={item._id || index}
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
                                <span className="font-bold text-gray-900">฿{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Discount (-20%)</span>
                                <span className="font-bold text-red-500">-฿{discount}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span className="font-bold text-gray-900">฿{deliveryFee}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                                <span>Total</span>
                                <span>฿{total}</span>
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
                            onClick={handleCheckout}
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