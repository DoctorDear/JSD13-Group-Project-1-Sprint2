import React, { useState } from 'react';
import CartItemCard from '../components/CartItemCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Liverpool FC 26/27 Away Jersey Authentic',
            size: 'Large',
            price: 140,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
        },
        {
            id: 2,
            name: 'Arsenal FC 26/27 Away Jersey Authentic',
            size: 'Large',
            price: 140,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
        },
        {
            id: 3,
            name: 'Manchester United FC 26/27 Away Jersey Authentic',
            size: 'Medium',
            price: 140,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
        }
    ]);

    const [discountCode, setDiscountCode] = useState('');
    const [email, setEmail] = useState(''); // State สำหรับเก็บอีเมลสมัคร Newsletter

    const handleUpdateQuantity = (id, newQuantity) => {
        setCartItems(prev =>
            prev.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
        );
    };

    const handleRemoveItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = subtotal * 0.20;
    const deliveryFee = 15;
    const total = subtotal - discount + deliveryFee;

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between">
            <Navbar page="cart" />
            <div className="max-w-6xl mx-auto w-full p-4 lg:p-8">
                {/* หัวข้อ YOUR CART */}
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-6 tracking-wide">
                    YOUR CART
                </h1>

                {/* โครงสร้าง Grid แบ่ง 2 ฝั่งเมื่อหน้าจอกว้าง */}
                <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">

                    {/* ฝั่งซ้าย: กล่องใหญ่รวมสินค้าทั้งหมด */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-6 lg:mb-0">
                        <div className="divide-y divide-gray-100">
                            {cartItems.map(item => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ฝั่งขวา: Order Summary */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">฿{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Discpunt (-20%)</span>
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
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Add promo code"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="w-full h-11 pl-9 pr-4 rounded-full border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-900 bg-gray-50"
                                />
                            </div>
                            <button className="h-11 px-6 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-full transition-colors">
                                Apply
                            </button>
                        </div>

                        <button className="w-full h-12 mt-4 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold rounded-full transition-colors shadow-sm">
                            Go to Checkout
                        </button>
                    </div>

                </div>

                {/* --- แถบสีดำ Stay Upto Date Banner (Placeholder อยู่ตรงกลางแล้ว) --- */}
                <div className="bg-[#262626] text-white rounded-3xl p-8 lg:px-12 lg:py-10 mt-12 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <h2 className="text-2xl lg:text-3xl font-black tracking-wide text-center lg:text-left max-w-md">
                        STAY UPTO DATE ABOUT OUR LASTEST OFFERS
                    </h2>
                    <div className="flex flex-col gap-3 w-full lg:w-80">
                        <input
                            type="email"
                            placeholder="username@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 px-5 rounded-full bg-white text-gray-800 text-sm text-center focus:outline-none placeholder-gray-400"
                        />
                        <button className="w-full h-12 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors">
                            Subscribe to Newsletter
                        </button>
                    </div>
                </div>
            </div>
            {/* 2. แสดง Footer ไว้ที่ด้านล่างสุด */}
            <Footer />
        </div>
    );
};

export default CartPage;