import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckOutItemCard from '../components/CheckOutItemCard';

const CheckoutPage = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [useSameBilling, setUseSameBilling] = useState(true);

    return (
        <div className="min-h-screen bg-white">
            <Navbar page="check" />
            <div className="lg:grid lg:grid-cols-12 min-h-screen">

                {/* --- ฝั่งซ้าย: หน้าเช็คเอาต์หลัก (สำหรับมือถือ/Responsive) --- */}
                <div className="lg:col-span-7 py-8 px-4 sm:px-6 lg:px-16 xl:px-20">
                    <div className="max-w-xl mx-auto space-y-10">

                        {/* 1. Contact Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="username@gmail.com"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 font-bold">
                                        ✓
                                    </span>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-900 focus:ring-indigo-900" />
                                    Email me with news and offers
                                </label>
                            </div>
                        </div>

                        {/* 2. Order Summary ส่วนที่ 1: รายการสินค้าและช่องใส่คูปอง (ด้านบนสำหรับมือถือ) */}
                        <div className="lg:hidden space-y-6">
                            <div className="flex justify-between items-center cursor-pointer">
                                <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* รายการสินค้า (Mobile) */}
                            <div className="space-y-4">
                                <CheckOutItemCard
                                    image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"
                                    title="Manchester United FC 26/27 Away Jersey Authentic"
                                    size="Middle"
                                    price="฿140"
                                    quantity="1"
                                />
                                <CheckOutItemCard
                                    image="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRdfu0aymMzr5SvSIoayrjTaMS0OaeZkMSctddIupmWBOtcyiz02UOECRwjarr9uhwkY4PeDdm9X-1BAG-pkv9JhaCgSvaHteIhdXTlkiIfYpQ3n-T-cDaZ&usqp=CAc"
                                    title="Arsenal FC 26/27 Away Jersey Authentic"
                                    size="Large"
                                    price="฿140"
                                    quantity="1"
                                />
                            </div>

                            {/* Promo Code */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Discount code or gift card"
                                    className="w-full h-11 px-4 rounded-xl border border-gray-300 text-xs focus:outline-none bg-white"
                                />
                                <button className="h-11 px-6 bg-[#251b74] hover:bg-indigo-900 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0">
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* 3. Delivery Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery</h2>
                            <div className="space-y-3">
                                <div className="relative">
                                    <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                                        Country/Region
                                    </label>
                                    <select className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none">
                                        <option>Thailand</option>
                                        <option>United States</option>
                                        <option>United Kingdom</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" placeholder="First name" className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900" />
                                    <input type="text" placeholder="Last name" className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900" />
                                </div>

                                <input type="text" placeholder="Apartment, suite, etc (optional)" className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900" />
                                <input type="text" placeholder="Address" className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900" />

                                {/* Responsive Grid สำหรับ City, Province, Postcode */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* City Dropdown */}
                                    <div className="relative">
                                        <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                                            City
                                        </label>
                                        <select className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none">
                                            <option>Bangkok</option>
                                            <option>Samut Prakan</option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </div>

                                    {/* Province Dropdown */}
                                    <div className="relative">
                                        <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                                            Province
                                        </label>
                                        <select className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none">
                                            <option>Bangkok</option>
                                            <option>Samut Prakan</option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </div>

                                    {/* Postcode Dropdown */}
                                    <div className="relative">
                                        <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                                            Postcode
                                        </label>
                                        <select className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none">
                                            <option>10270</option>
                                            <option>10540</option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                <input type="text" placeholder="Telephone" className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900" />
                            </div>
                        </div>

                        {/* 4. Shipping Method */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping method</h2>
                            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-500 mb-3">
                                Enter your shipping address to view available shipping methods.
                            </div>
                            <div className="relative">
                                <select className="w-full h-14 px-4 rounded-xl border border-indigo-900 text-sm bg-indigo-50/30 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer">
                                    <option>📦 Standard Delivery</option>
                                    <option>🚀 Express Delivery</option>
                                    <option>✨ Free Delivery</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        {/* 5. Payment Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
                            <p className="text-xs text-gray-500 mb-3">All transactions are secure and encrypted.</p>

                            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                                <div
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-blue-50/20' : 'bg-white'}`}
                                >
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                                        <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-blue-600" />
                                        Credit Card
                                    </label>
                                    <div className="flex gap-1 text-[10px] font-bold text-gray-600">
                                        <span className="bg-white px-2 py-0.5 rounded border">VISA</span>
                                        <span className="bg-white px-2 py-0.5 rounded border">DISCOVER</span>
                                        <span className="bg-white px-2 py-0.5 rounded border">MC</span>
                                    </div>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="p-4 pt-0 space-y-3 bg-white">
                                        <div className="pt-2">
                                            <input type="text" placeholder="Card Number" className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="Expiration date (MM/YY)" className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none" />
                                            <input type="text" placeholder="CVV" className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none" />
                                        </div>
                                        <input type="text" placeholder="Name on card" className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none" />

                                        <div className="pt-2">
                                            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                                <input type="checkbox" checked={useSameBilling} onChange={(e) => setUseSameBilling(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                                                Use shipping address as billing address
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <hr className="border-gray-200" />

                                <div
                                    onClick={() => setPaymentMethod('promptpay')}
                                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'promptpay' ? 'bg-blue-50/20' : 'bg-white'}`}
                                >
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                                        <input type="radio" name="payment" checked={paymentMethod === 'promptpay'} onChange={() => setPaymentMethod('promptpay')} className="w-4 h-4 text-blue-600" />
                                        QR Promptpay
                                    </label>
                                    <div className="flex gap-1 text-[10px] font-bold text-gray-600">
                                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px]">UnionPay</span>
                                        <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-[9px]">THAI QR PAYMENT</span>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-blue-50/20' : 'bg-white'}`}
                                >
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                                        <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-blue-600" />
                                        Cash on delivery (COD)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* 6. Order Summary ส่วนที่ 2 (สำหรับมือถือ) */}
                        <div className="lg:hidden space-y-4 pt-4">
                            <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>

                            <div className="space-y-3 text-sm">
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
                                <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                                    <span>Total</span>
                                    <span>฿467</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button className="w-full h-12 bg-[#251b74] hover:bg-[#1a1355] text-white text-sm font-bold rounded-lg transition-colors">
                                    PAY NOW
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- ฝั่งขวา: Order Summary (สำหรับหน้าจอ Desktop) --- */}
                <div className="hidden lg:col-span-5 lg:flex bg-[#f9f9f9] py-8 px-6 sm:px-8 lg:px-12 border-l border-gray-200 flex-col justify-between">
                    <div className="max-w-lg w-full space-y-6">

                        <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>

                        {/* รายการสินค้า (Desktop) */}
                        <div className="space-y-4">
                            <CheckOutItemCard
                                image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"
                                title="Manchester United FC 26/27 Away Jersey Authentic"
                                size="Middle"
                                price="฿140"
                                quantity="1"
                            />
                            <CheckOutItemCard
                                image="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRdfu0aymMzr5SvSIoayrjTaMS0OaeZkMSctddIupmWBOtcyiz02UOECRwjarr9uhwkY4PeDdm9X-1BAG-pkv9JhaCgSvaHteIhdXTlkiIfYpQ3n-T-cDaZ&usqp=CAc"
                                title="Arsenal FC 26/27 Away Jersey Authentic"
                                size="Large"
                                price="฿140"
                                quantity="1"
                            />
                        </div>

                        {/* Promo Code */}
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="text"
                                placeholder="Discount code or gift card"
                                className="w-full h-11 px-4 rounded-xl border border-gray-300 text-xs focus:outline-none bg-white"
                            />
                            <button className="h-11 px-6 bg-[#251b74] hover:bg-indigo-900 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0">
                                Apply
                            </button>
                        </div>

                        {/* สรุปราคา */}
                        <div className="pt-4 space-y-3 text-sm">
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
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                                <span>Total</span>
                                <span className="text-gray-900">฿467</span>
                            </div>
                        </div>

                        {/* ปุ่ม Pay now */}
                        <div className="pt-2">
                            <button className="w-full h-12 bg-[#251b74] hover:bg-[#1a1355] text-white text-sm font-bold rounded-lg transition-colors">
                                PAY NOW
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CheckoutPage;