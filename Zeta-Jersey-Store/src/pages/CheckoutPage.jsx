import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckOutItemCard from '../components/CheckOutItemCard';
import ThaiLocationFields from '../components/ThaiLocationFields.jsx';
import { api } from '../lib/api';
import { orderService } from '../services/order.js';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemsFromCart = location.state?.cartItems || [];
  const [deliveryLocation, setDeliveryLocation] = useState({ postalCode: '', province: '', district: '', subdistrict: '' });

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
    telephone: '',
    shippingMethod: 'Standard Delivery',
  });

  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ดึงข้อมูลตะกร้าสินค้าจาก Backend เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/users/cart');
        if (response.cart) {
          setCartItems(response.cart);
        }
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load cart.');
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
  const discount = 0;

  // ค่าจัดส่ง (ถ้ามีสินค้าในตะกร้าคิด 15 ถ้าไม่มีเป็น 0)
  const shippingFee = 0;

  // ราคารวมสุทธิ
  const total = subtotal - discount + shippingFee;

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์มและ Dropdown
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePayNow = async () => {
    setErrorMessage('');

    if (!cartItems.length) return setErrorMessage('Your cart is empty.');
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.address.trim() || !formData.telephone.trim() || !deliveryLocation.province || !deliveryLocation.postalCode) {
      return setErrorMessage('Please complete your name, address, province, postal code, and telephone.');
    }

    try {
      setLoading(true);

      const response = await orderService.create({
        recipientName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.telephone.trim(),
        addressLine: [formData.address.trim(), formData.apartment.trim()].filter(Boolean).join(', '),
        province: deliveryLocation.province,
        district: deliveryLocation.district,
        postalCode: deliveryLocation.postalCode,
      });
      window.dispatchEvent(new Event('cart-updated'));
      navigate('/order-confirmation', {
        state: {
          orderData: { ...response.data, orderId: response.data.orderNumber }
        }
      });

    } catch (error) {
      console.error('Payment failed:', error);
      setErrorMessage(error.message || 'Failed to create order. Please try again.');
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

                <ThaiLocationFields value={deliveryLocation} onChange={setDeliveryLocation} />

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

            <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700">Payment is collected on delivery. Placing this order does not charge a card.</div>

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
                {loading ? 'PROCESSING...' : 'PLACE ORDER'}
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
                {loading ? 'PROCESSING...' : 'PLACE ORDER'}
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
