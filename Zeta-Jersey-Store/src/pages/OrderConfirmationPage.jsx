import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const ConfirmationPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Navbar แสดงผลเต็มความกว้างด้านบนสุด */}
            <Navbar page="order" />

            {/* ส่วนเนื้อหาหลัก จัดให้อยู่ตรงกลางหน้าจอ */}
            <div className="flex-grow flex items-center justify-center py-6 px-4 sm:py-12 sm:px-6">
                {/* กล่องครอบหลัก: กรอบสีดำ และมุมฉากบนหน้าจอใหญ่ */}
                <div className="w-full max-w-2xl bg-white sm:border sm:border-black sm:rounded-none sm:shadow-none sm:p-10 p-4">

                    {/* ส่วนหัว: ขอบคุณและเลขที่คำสั่งซื้อ */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
                            Thank for you order,<br />
                            Jane.
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-400">
                            Order No. <span className="text-gray-600">1234567</span>
                        </p>
                    </div>

                    {/* ข้อมูลการจัดส่งและการเรียกเก็บเงิน (3 คอลัมน์) */}
                    <div className="grid grid-cols-3 gap-4 text-xs sm:text-sm mb-10 text-gray-600">
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">Shipping to</p>
                            <p className="font-medium text-gray-800">Jane Dole</p>
                            <p>123 Evergreen Lane</p>
                            <p>Anytown, NY 45678</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">Billed to</p>
                            <p className="font-medium text-gray-800">Jane Dole</p>
                            <p className="text-gray-400">........................9101</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">Date ordered</p>
                            <p className="text-gray-800">October 03, 2016</p>
                        </div>
                    </div>

                    {/* ส่วนสถานะการจัดส่ง */}
                    <div className="text-center mb-10 space-y-4">
                        <div className="relative flex items-center justify-center my-4">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Your order is on its way. We will be shipping it tomorrow.
                        </p>
                        <div className="pt-2">
                            <button className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm">
                                Track your order
                            </button>
                        </div>
                    </div>

                    {/* เส้นคั่นหัวข้อ Order Summary */}
                    <div className="relative flex items-center justify-center my-8">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-xs sm:text-sm text-gray-500">Your Order summary</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* รายการสินค้า */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                {/* กรอบรูปภาพ: ล็อกขนาดให้เท่ากันทุกรูปด้วย w-16 h-16 / sm:w-20 sm:h-20 และ object-cover */}
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                    <img
                                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150"
                                        alt="Arsenal Jersey"
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-1 right-1 bg-gray-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                        1
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                                        Arsenal FC 26/27 Away Jersey Authentic
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Size : Large</p>
                                    <p className="text-xs text-gray-500 mt-1">Quantity : 1</p>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                                ฿140
                            </div>
                        </div>

                        {/* สรุปยอดเงิน */}
                        <div className="space-y-2 text-xs sm:text-sm pt-2">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-900">฿140</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className="font-semibold text-gray-900">฿4.95</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Tax</span>
                                <span className="font-semibold text-gray-900">฿14.88</span>
                            </div>
                            <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 pt-4">
                                <span>Total</span>
                                <span>฿175</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;