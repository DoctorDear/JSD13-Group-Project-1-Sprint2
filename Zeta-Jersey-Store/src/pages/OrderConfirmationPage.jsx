import React from 'react';

const OrderConfirmationPage = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
            <div className="max-w-md mx-auto w-full p-4 py-8">

                {/* หัวข้อคำขอบคุณ */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-1 flex flex-col">
                        <span>Thank for your order.</span>
                        <span>Jane</span>
                    </h1>
                    <p className="text-xs text-gray-400">Order No. 1234567</p>
                </div>

                {/* ข้อมูลการจัดส่ง, การเรียกเก็บเงิน และวันที่สั่งซื้อ */}
                <div className="grid grid-cols-3 gap-2 text-[11px] mb-6 pb-6">
                    <div>
                        <p className="font-bold text-gray-900 mb-1">Shipping to</p>
                        <p className="text-gray-600 leading-relaxed">
                            Jane Dole<br />
                            123 Evergreen Lane<br />
                            Anytown, NY 45678
                        </p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 mb-1">Billed to</p>
                        <p className="text-gray-600 leading-relaxed">
                            Jane Dole<br />
                            ....................9101
                        </p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 mb-1">Date ordered</p>
                        <p className="text-gray-600">October 03, 2016</p>
                    </div>
                </div>

                {/* ส่วนสถานะการจัดส่ง & ปุ่ม Track */}
                <div className="text-center mb-6 pb-6 ">
                    {/* เส้นประจำลองสถานะการส่ง (สามารถใส่รูปไอคอนเครื่องบินกระดาษตามดีไซน์ได้) */}
                    <div className="relative flex items-center justify-center mb-3">
                        <div className="w-full border-t  border-gray-900 absolute"></div>
                        <span className="relative z-10 bg-white px-3 text-gray-400 text-sm">✈️</span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4">
                        Your order is on its way. We will be shipping it tomorrow.
                    </p>

                    <button className="px-6 py-2.5 bg-gray-400 hover:bg-gray-500 text-white text-xs font-semibold rounded transition-colors shadow-sm">
                        Track your order
                    </button>
                </div>

                {/* ส่วนสรุปคำสั่งซื้อ (Your Order Summary) */}
                <div>
                    <div className="relative flex items-center justify-center mb-4">
                        <div className="w-full border-t border-gray-900 absolute"></div>
                        <p className="relative z-10 bg-white px-3 text-xs font-bold text-gray-600 tracking-wider uppercase">
                            Your Order summary
                        </p>
                    </div>

                    {/* รายการสินค้า */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-900 mb-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://via.placeholder.com/80"
                                alt="Arsenal Jersey"
                                className="w-14 h-14 object-cover rounded-md bg-gray-50 border border-gray-100"
                            />
                            <div>
                                <h4 className="text-xs font-bold text-gray-900 mb-0.5">Arsenal FC 26/27 Away Jersey Authentic</h4>
                                <p className="text-[11px] text-gray-900 mb-1">Size : Large</p>
                                <p className="text-[11px] text-gray-900 font-semibold">Quantity : 1</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-gray-900">฿140</span>
                        </div>
                    </div>

                    {/* รายละเอียดราคาเงิน */}
                    <div className="space-y-2 text-xs pt-2">
                        <div className="flex justify-between text-gray-900">
                            <span>Subtotal</span>
                            <span className="font-bold text-gray-900">฿140</span>
                        </div>
                        <div className="flex justify-between text-gray-900">
                            <span>Shipping</span>
                            <span className="font-bold text-gray-900">฿4.95</span>
                        </div>
                        <div className="flex justify-between text-gray-900">
                            <span>Tax</span>
                            <span className="font-bold text-gray-900">฿14.88</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
                            <span>Total</span>
                            <span>฿175</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderConfirmationPage;