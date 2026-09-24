import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckOutItemCard from '../components/CheckOutItemCard';
import { api } from '../lib/api';
import provinces from '../data/province.json';
import districts from '../data/district.json';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemsFromCart = location.state?.cartItems || [];
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [useSameBilling, setUseSameBilling] = useState(true);

  // State สำหรับเปิด-ปิด Order Summary ด้านบนบนมือถือ
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // State สำหรับเก็บข้อมูลสินค้าในตะกร้า
  const [cartItems, setCartItems] = useState(cartItemsFromCart);

  // State สำหรับเก็บข้อมูลฟอร์มกรอกของผู้ใช้
  const [formData, setFormData] = useState({
    email: '',
    receiveNews: true,
    country: 'Thailand',
    firstName: '',
    lastName: '',
    apartment: '',
    address: '',
    city: '',
    province: '',
    postcode: '',
    telephone: '',
    shippingMethod: 'Standard Delivery',
    // ข้อมูลบัตรเครดิต
    cardNumber: '',
    cardExp: '',
    cardCvv: '',
    cardName: '',
  });

  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ดึงข้อมูลตะกร้าสินค้าจาก Backend เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/users/cart');
        if (response.data && response.data.items) {
          setCartItems(response.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };
    fetchCart();
  }, []);

  // --- ระบบคำนวณราคาอัตโนมัติจากสินค้าในตะกร้า (Real-time calculation) ---
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price || item.productId?.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return acc + (price * quantity);
  }, 0);

  // คำนวณส่วนลด 20% (สามารถปรับเปลี่ยนเงื่อนไขได้ตามต้องการ)
  const discount = Math.round(subtotal * 0.20);

  // ค่าจัดส่ง (ถ้ามีสินค้าในตะกร้าคิด 15 ถ้าไม่มีเป็น 0)
  const shippingFee = cartItems.length > 0 ? 15 : 0;

  // ราคารวมสุทธิ
  const total = subtotal - discount + shippingFee;

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์มและ Dropdown
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      // ถ้ามีการเปลี่ยนจังหวัด ให้รีเซ็ตค่าอำเภอ (city) เป็นค่าว่างด้วย
      if (name === 'province') {
        return {
          ...prev,
          province: value,
          city: '',
        };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handlePayNow = async () => {
    setErrorMessage('');

    console.log("Form Data Submitted:", formData); // เปิด F12 ดูค่าที่กรอกได้ตรงนี้

    try {
      setLoading(true);

      const orderPayload = {
        contact: { email: formData.email, telephone: formData.telephone },
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          province: formData.province,
          city: formData.city,
          postcode: formData.postcode,
        },
        items: cartItems,
        summary: { total },
      };

      // --- ข้ามการเรียก API ไปก่อน เพื่อให้เทสหน้า Confirmation ได้ทันที ---
      // const response = await api.post('/orders', orderPayload);

      console.log("Navigating to confirmation page...");

      // สั่งเปลี่ยนหน้าไปยัง Order Confirmation ทันที
      navigate('/order-confirmation', {
        state: {
          orderData: {
            orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
            ...orderPayload
          }
        }
      });

    } catch (error) {
      console.error('Payment failed:', error);
      setErrorMessage('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar page="check" />

      {/* --- แสดง Error แจ้งเตือนถ้าข้อมูลไม่ครบ --- */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* --- 1. Order Summary แบบดรอปดาวน์ (สำหรับมือถือ - วางไว้บนสุด) --- */}
      <div className="lg:hidden bg-[#f9f9f9] border-b border-gray-200 px-4 py-4">
        <div
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="flex justify-between items-center cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
            <svg
              className={`w-5 h-5 text-gray-900 transform transition-transform duration-200 ${isSummaryOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="text-lg font-bold text-gray-900">
            ฿{total.toLocaleString()}
          </div>
        </div>

        {isSummaryOpen && (
          <div className="mt-4 space-y-4 pt-2 border-t border-gray-200">
            <div className="space-y-3">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <CheckOutItemCard
                    key={item._id || item.id || index}
                    item={item}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">No items in cart</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Discount code or gift card"
                className="w-full h-11 px-4 rounded-xl border border-gray-300 text-xs focus:outline-none bg-white text-gray-900"
              />
              <button className="h-11 px-6 bg-[#251b74] hover:bg-indigo-900 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
                Apply
              </button>
            </div>

            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount 20%</span>
                <span className="font-bold text-red-500">-฿{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">฿{shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-12 min-h-screen">

        {/* --- ฝั่งซ้าย: ฟอร์มกรอกข้อมูลการสั่งซื้อ --- */}
        <div className="lg:col-span-7 py-8 px-4 sm:px-6 lg:px-16 xl:px-20">
          <div className="max-w-xl mx-auto space-y-10">

            {/* 1. Contact Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="username@gmail.com"
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="receiveNews"
                    checked={formData.receiveNews}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-900 focus:ring-indigo-900"
                  />
                  Email me with news and offers
                </label>
              </div>
            </div>

            {/* 2. Delivery Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery</h2>
              <div className="space-y-3">
                <div className="relative">
                  <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                    Country/Region
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer"
                  >
                    <option value="Thailand">Thailand</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>

                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc (optional)"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Dropdown เลือกจังหวัด (Province) */}
                  <div className="relative">
                    <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                      Province
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer"
                    >
                      <option value="">- Select Province -</option>
                      {provinces.map((prov) => (
                        <option key={prov.id || prov.name_th} value={prov.name_th}>
                          {prov.name_th}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown เลือกอำเภอ/เขต (City) กรองตามจังหวัดที่เลือก */}
                  <div className="relative">
                    <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                      District
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!formData.province}
                      className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer disabled:bg-gray-100"
                    >
                      <option value="">- Select District -</option>
                      {districts
                        .filter((amp) => {
                          const matchedProv = provinces.find((p) => p.name_th === formData.province);
                          return matchedProv ? amp.province_id === matchedProv.id : false;
                        })
                        .map((amp) => (
                          <option key={amp.id || amp.name_th} value={amp.name_th}>
                            {amp.name_th}
                          </option>
                        ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    placeholder="Postcode"
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>

                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Telephone"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            {/* 3. Shipping Method */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping method</h2>
              <select
                name="shippingMethod"
                value={formData.shippingMethod}
                onChange={handleChange}
                className="w-full h-14 px-4 rounded-xl border border-indigo-900 text-sm bg-indigo-50/30 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-900"
              >
                <option value="Standard Delivery">📦 Standard Delivery</option>
                <option value="Express Delivery">🚀 Express Delivery</option>
                <option value="Free Delivery">✨ Free Delivery</option>
              </select>
            </div>

            {/* 4. Payment Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
              <p className="text-xs text-gray-500 mb-3">All transactions are secure and encrypted.</p>

              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">

                {/* 1. Credit Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 flex justify-between items-center cursor-pointer transition-colors border-b border-gray-100 ${paymentMethod === 'card' ? 'bg-blue-50/20' : 'bg-white'}`}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 text-blue-600"
                    />
                    Credit Card
                  </label>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 border rounded text-gray-700">VISA</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 border rounded text-gray-700">MC</span>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-4 space-y-3 bg-white border-b border-gray-100">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="Card Number"
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="cardExp"
                        value={formData.cardExp}
                        onChange={handleChange}
                        placeholder="Expiration date (MM/YY)"
                        className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none"
                      />
                      <input
                        type="text"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        placeholder="CVV"
                        className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="Name on card"
                      className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none"
                    />

                    <label className="flex items-center gap-2 text-xs text-gray-700 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useSameBilling}
                        onChange={(e) => setUseSameBilling(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-900 focus:ring-indigo-900"
                      />
                      Use shipping address as billing address
                    </label>
                  </div>
                )}

                {/* 2. QR Promptpay Option */}
                <div
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-4 flex justify-between items-center cursor-pointer transition-colors border-b border-gray-100 ${paymentMethod === 'promptpay' ? 'bg-blue-50/20' : 'bg-white'}`}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'promptpay'}
                      onChange={() => setPaymentMethod('promptpay')}
                      className="w-4 h-4 text-blue-600"
                    />
                    QR Promptpay
                  </label>
                  <div className="flex gap-1 items-center">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-700 text-white rounded">PromptPay</span>
                  </div>
                </div>

                {/* 3. Cash on Delivery (COD) Option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-blue-50/20' : 'bg-white'}`}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-blue-600"
                    />
                    Cash on Delivery (COD)
                  </label>
                </div>

              </div>
            </div>

            {/* --- 2. Order Summary ตัวเต็มด้านล่างเพจ (สำหรับมือถือ) --- */}
            <div className="lg:hidden space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>

              <div className="space-y-4">
                {cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <CheckOutItemCard
                      key={item._id || item.id || index}
                      item={item}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No items in cart</p>
                )}
              </div>

              <div className="space-y-3 text-sm pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="font-bold text-red-500">-฿{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-gray-900">฿{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>฿{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="lg:hidden pt-2">
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="w-full h-12 bg-[#251b74] hover:bg-[#1a1355] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : 'PAY NOW'}
              </button>
            </div>

          </div>
        </div>

        {/* --- ฝั่งขวา: Order Summary (สำหรับหน้าจอ Desktop) --- */}
        <div className="hidden lg:col-span-5 lg:flex bg-[#f9f9f9] py-8 px-6 sm:px-8 lg:px-12 border-l border-gray-200 flex-col justify-between">
          <div className="max-w-lg w-full space-y-6">

            <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>

            <div className="space-y-4">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <CheckOutItemCard
                    key={item._id || item.id || index}
                    item={item}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-500">No items in cart</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Discount code or gift card"
                className="w-full h-11 px-4 rounded-xl border border-gray-300 text-xs focus:outline-none bg-white text-gray-900"
              />
              <button className="h-11 px-6 bg-[#251b74] hover:bg-indigo-900 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
                Apply
              </button>
            </div>

            <div className="pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="font-bold text-red-500">-฿{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">฿{shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-gray-900">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="w-full h-12 bg-[#251b74] hover:bg-[#1a1355] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'PROCESSING...' : 'PAY NOW'}
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