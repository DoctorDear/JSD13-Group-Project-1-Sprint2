import React, { useState } from 'react';
import CheckoutItemCard from '../components/CheckoutItemCard/CheckOutItemCard';

const CheckoutPage = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    const [checkoutItems] = useState([
        {
            id: 1,
            name: 'Manchester United FC 26/27 Away Jersey Authentic',
            size: 'Middle',
            price: 140,
            quantity: 1,
            image: 'https://via.placeholder.com/80'
        },
        {
            id: 2,
            name: 'Arsenal FC 26/27 Away Jersey Authentic',
            size: 'Large',
            price: 140,
            quantity: 1,
            image: 'https://via.placeholder.com/80'
        }
    ]);

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
            <div className="max-w-md mx-auto w-full p-4">

                {/* 1. ส่วน Order Summary ด้านบน (แบบย่อ/ขยายได้) */}
                <div className="border border-gray-200 rounded-lg p-3 mb-6 bg-gray-50">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">Order Summary</span>
                            <svg className={`w-4 h-4 transition-transform ${isSummaryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                        <span className="text-sm font-bold">$457</span>
                    </div>

                    {isSummaryOpen && (
                        <div className="mt-4 pt-3 border-t border-gray-200 space-y-3">
                            {checkoutItems.map(item => (
                                <CheckoutItemCard key={item.id} item={item} />
                            ))}

                            <div className="space-y-1.5 text-xs pt-2">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900">฿565</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Discount (-20%)</span>
                                    <span className="font-bold text-red-500">-฿113</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Delivery Fee</span>
                                    <span className="font-bold text-gray-900">฿15</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ฟอร์มข้อมูลการจัดส่ง (Delivery) */}
                <div className="mb-6">
                    <h3 className="text-base font-bold mb-3">Delivery</h3>

                    <div className="space-y-3">
                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <div className="flex justify-between items-center">
                                <select className="w-full bg-transparent text-xs text-gray-900 focus:outline-none appearance-none">
                                    <option>Thailand</option>
                                </select>
                                <span className="pointer-events-none text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <input type="text" placeholder="First name" className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none" />
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <input type="text" placeholder="Last name" className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none" />
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <input type="text" placeholder="Address" className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none" />
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <input type="text" placeholder="Address" className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none" />
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <div className="flex justify-between items-center">
                                <select className="w-full bg-transparent text-xs text-gray-400 focus:text-gray-900 focus:outline-none appearance-none">
                                    <option value="" disabled selected>City</option>
                                    <option value="Bangkok">Bangkok</option>
                                </select>
                                <span className="pointer-events-none text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <div className="flex justify-between items-center">
                                <select className="w-full bg-transparent text-xs text-gray-400 focus:text-gray-900 focus:outline-none appearance-none">
                                    <option value="" disabled selected>Province</option>
                                    <option value="Bangkok">Bangkok</option>
                                </select>
                                <span className="pointer-events-none text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <div className="flex justify-between items-center">
                                <select className="w-full bg-transparent text-xs text-gray-400 focus:text-gray-900 focus:outline-none appearance-none">
                                    <option value="" disabled selected>Postcode</option>
                                    <option value="10270">10270</option>
                                </select>
                                <span className="pointer-events-none text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-black">
                            <input type="tel" placeholder="Telephone" className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none" />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-gray-600 pt-1 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-black focus:ring-black" />
                            Save this information for next time
                        </label>
                    </div>
                </div>

                {/* วิธีการจัดส่ง (Shipping Method) */}
                <div className="mb-6">
                    <h3 className="text-base font-bold mb-3">Shipping method</h3>
                    <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50 text-gray-500 text-xs flex items-center gap-2">
                            <span>Enter your shipping address to view available shipping methods.</span>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50 flex items-center gap-3 text-xs font-medium text-gray-900">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>Free Shipping</span>
                        </div>
                    </div>
                </div>

                {/* วิธีการชำระเงิน (Payment) */}
                <div className="mb-6">
                    <h3 className="text-base font-bold mb-3">Payment</h3>

                    <div className="border border-blue-400 rounded-lg overflow-hidden bg-gray-50/30">
                        <div className="p-3 border-b border-gray-200">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-900">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                Credit Card
                            </label>

                            {paymentMethod === 'card' && (
                                <div className="mt-3 space-y-2 pt-2">
                                    <input type="text" placeholder="Card Number" className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" placeholder="Expiration date (MM/YY)" className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black" />
                                        <input type="text" placeholder="CVV" className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <input type="text" placeholder="Name on card" className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black" />

                                    <div className="pt-1">
                                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            Use shipping address as billing address
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-900">
                                <input type="radio" name="payment" onChange={() => setPaymentMethod('atome')} className="text-blue-600 focus:ring-blue-500" />
                                Atome PayLater - 3 easy payment, 0% interest
                            </label>
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-yellow-400 text-black text-[10px] font-bold rounded">atome</span>
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">VISA</span>
                                <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">MC</span>
                                <span className="px-1.5 py-0.5 bg-blue-800 text-white text-[10px] font-bold rounded">AMEX</span>
                            </div>
                        </div>

                        <div className="p-3 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-900">
                                <input type="radio" name="payment" onChange={() => setPaymentMethod('qr')} className="text-blue-600 focus:ring-blue-500" />
                                QR Promptpay
                            </label>
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-red-700 text-white text-[10px] font-bold rounded">UnionPay</span>
                                <span className="px-1.5 py-0.5 bg-blue-900 text-white text-[10px] font-bold rounded">THAI QR</span>
                            </div>
                        </div>

                        <div className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-900">
                                <input type="radio" name="payment" onChange={() => setPaymentMethod('cod')} className="text-blue-600 focus:ring-blue-500" />
                                Cash on delivery (COD)
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. ส่วน Order Summary ด้านล่าง (ก่อนปุ่ม Pay Now) */}
                <div className="mb-6">
                    <h3 className="text-base font-bold mb-3">Order Summary</h3>

                    <div className="space-y-3 mb-4">
                        {checkoutItems.map(item => (
                            <CheckoutItemCard key={item.id} item={item} />
                        ))}
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Discount code or gift card"
                            className="w-full h-10 px-3 rounded-md border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <button className="h-10 px-5 bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-semibold rounded-md transition-colors">
                            Apply
                        </button>
                    </div>

                    <div className="space-y-2 text-xs pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-bold text-gray-900">฿565</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Discpunt (-20%)</span>
                            <span className="font-bold text-red-500">-฿113</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span className="font-bold text-gray-900">฿15</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 text-gray-900">
                            <span>Total</span>
                            <span>$467</span>
                        </div>
                    </div>
                </div>

                {/* ปุ่ม Pay Now */}
                <button className="w-full h-12 bg-indigo-950 hover:bg-indigo-900 text-white font-semibold text-sm rounded-full transition-colors shadow-sm">
                    PAY NOW
                </button>

            </div>
        </div>
    );
};

export default CheckoutPage;