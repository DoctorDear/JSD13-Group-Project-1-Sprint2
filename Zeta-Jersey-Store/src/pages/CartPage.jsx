import React, { useState } from 'react';
import CartItemCard from '../components/CartItemCard';
import PromoBar from '../components/PromoBar';

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
            name: 'Manchester United FC 26/27 Away Jersey Authentic',
            size: 'Middle',
            price: 140,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
        },
        {
            id: 3,
            name: 'Arsenal FC 26/27 Away Jersey Authentic',
            size: 'Large',
            price: 140,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
        }
    ]);

    const [discountCode, setDiscountCode] = useState('');

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
            {/* คอนเทนเนอร์หลักควบคุมความกว้าง max-w-md mx-auto */}
            <div className="max-w-md mx-auto w-full p-4">
                <h2 className="text-xl font-extrabold text-gray-900 mb-4 tracking-wide">
                    YOUR CART
                </h2>

                <div className="divide-y divide-gray-100 mb-6">
                    {cartItems.map(item => (
                        <CartItemCard
                            key={item.id}
                            item={item}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                        />
                    ))}
                </div>

                {/* ส่วน Order Summary */}
                <div className="bg-white rounded-lg pt-2 pb-4 mb-6">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Order Summary</h3>

                    <div className="space-y-2 text-sm">
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
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                            <span>Total</span>
                            <span>฿{total}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="text"
                            placeholder="Discount code or gift card"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="flex-1 h-11 px-4 rounded-full border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-900"
                        />
                        <button className="h-11 px-6 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-full transition-colors">
                            Apply
                        </button>
                    </div>

                    <button className="w-full h-12 mt-4 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold rounded-full transition-colors shadow-sm">
                        Go to Checkout
                    </button>
                </div>

                {/* ย้าย PromoBar มาไว้ข้างในนี้ เพื่อให้ความกว้างเท่ากับปุ่ม Go to Checkout พอดี */}
                <PromoBar />
            </div>
        </div>
    );
};

export default CartPage;