import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. นำเข้า useNavigate
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckOutItemCard from '../components/CheckOutItemCard';
import { api } from '../lib/api';

const CheckoutPage = () => {
  const navigate = useNavigate(); // 2. ประกาศตัวแปร navigate
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [useSameBilling, setUseSameBilling] = useState(true);

  // State สำหรับเปิด-ปิด Order Summary ด้านบนบนมือถือ
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // State สำหรับเก็บข้อมูลสินค้าในตะกร้าและยอดเงินจาก Backend
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({
    subtotal: 565,
    discount: 113,
    shippingFee: 15,
    total: 467,
  });

  // State สำหรับเก็บข้อมูลฟอร์มกรอกของผู้ใช้
  const [formData, setFormData] = useState({
    email: '',
    receiveNews: true,
    country: 'Thailand',
    firstName: '',
    lastName: '',
    apartment: '',
    address: '',
    city: 'Bangkok',
    province: 'Bangkok',
    postcode: '10270',
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

  // ดึงข้อมูลตะกร้าสินค้าจาก Backend เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/users/cart');
        if (response.data) {
          setCartItems(response.data.items || []);
          setSummary({
            subtotal: response.data.subtotal || 565,
            discount: response.data.discount || 113,
            shippingFee: response.data.shippingFee || 15,
            total: response.data.total || 467,
          });
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };
    fetchCart();
  }, []);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์มและ Dropdown
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 3. ฟังก์ชันกดปุ่มสั่งซื้อ / ชำระเงิน (PAY NOW) แล้วเปลี่ยนไปหน้า OrderConfirmationPage
  const handlePayNow = async () => {
    try {
      setLoading(true);
      const orderPayload = {
        contact: {
          email: formData.email,
          receiveNews: formData.receiveNews,
          telephone: formData.telephone,
        },
        shippingAddress: {
          country: formData.country,
          firstName: formData.firstName,
          lastName: formData.lastName,
          apartment: formData.apartment,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postcode: formData.postcode,
        },
        shippingMethod: formData.shippingMethod,
        paymentMethod: paymentMethod,
        paymentDetails: paymentMethod === 'card' ? {
          cardNumber: formData.cardNumber,
          cardExp: formData.cardExp,
          cardCvv: formData.cardCvv,
          cardName: formData.cardName,
          useSameBilling: useSameBilling,
        } : null,
        items: cartItems,
        summary: summary,
      };

      const response = await api.post('/orders', orderPayload);
      console.log('Order Response:', response.data);

      // สมมติว่า Backend ส่ง orderId หรือข้อมูลออเดอร์กลับมา สามารถแนบไปกับ Route ได้
      // เช่น navigate('/order-confirmation', { state: { orderData: response.data } })
      // หรือถ้าเป็นแบบระบุ Path ตรงๆ:
      navigate('/order-confirmation');

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar page="check" />

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
            ${summary.total}
          </div>
        </div>

        {isSummaryOpen && (
          <div className="mt-4 space-y-4 pt-2 border-t border-gray-200">
            <div className="space-y-3">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <CheckOutItemCard
                    key={index}
                    image={item.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"}
                    title={item.title}
                    size={item.size}
                    price={`$${item.price}`}
                    quantity={item.quantity}
                  />
                ))
              ) : (
                <>
                  <CheckOutItemCard
                    image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"
                    title="Manchester United FC 26/27 Away Jersey Authentic"
                    size="Middle"
                    price="$140"
                    quantity="1"
                  />
                  <CheckOutItemCard
                    image="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRdfu0aymMzr5SvSIoayrjTaMS0OaeZkMSctddIupmWBOtcyiz02UOECRwjarr9uhwkY4PeDdm9X-1BAG-pkv9JhaCgSvaHteIhdXTlkiIfYpQ3n-T-cDaZ&usqp=CAc"
                    title="Arsenal FC 26/27 Away Jersey Authentic"
                    size="Large"
                    price="$140"
                    quantity="1"
                  />
                </>
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
                <span className="font-bold text-gray-900">${summary.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount (-20%)</span>
                <span className="font-bold text-red-500">-${summary.discount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">${summary.shippingFee}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${summary.total}</span>
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
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 font-bold">
                    ✓
                  </span>
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
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
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
                  <div className="relative">
                    <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer"
                    >
                      <option value="Bangkok">Bangkok</option>
                      <option value="Samut Prakan">Samut Prakan</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>

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
                      <option value="Bangkok">Bangkok</option>
                      <option value="Samut Prakan">Samut Prakan</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>

                  <div className="relative">
                    <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
                      Postcode
                    </label>
                    <select
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer"
                    >
                      <option value="10270">10270</option>
                      <option value="10540">10540</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
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
              <div className="relative">
                <select
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleChange}
                  className="w-full h-14 px-4 rounded-xl border border-indigo-900 text-sm bg-indigo-50/30 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer"
                >
                  <option value="Standard Delivery">📦 Standard Delivery</option>
                  <option value="Express Delivery">🚀 Express Delivery</option>
                  <option value="Free Delivery">✨ Free Delivery</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 4. Payment Section */}
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
                    <span className="bg-white px-2 py-0.5 rounded border">MC</span>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-4 pt-0 space-y-3 bg-white">
                    <div className="pt-2">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="Card Number"
                        className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none"
                      />
                    </div>
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

            {/* --- 2. Order Summary ตัวเต็มด้านล่างเพจ (สำหรับมือถือ) --- */}
            <div className="lg:hidden space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>

              <div className="space-y-4">
                {cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <CheckOutItemCard
                      key={index}
                      image={item.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"}
                      title={item.title}
                      size={item.size}
                      price={`$${item.price}`}
                      quantity={item.quantity}
                    />
                  ))
                ) : (
                  <>
                    <CheckOutItemCard
                      image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"
                      title="Manchester United FC 26/27 Away Jersey Authentic"
                      size="Middle"
                      price="$140"
                      quantity="1"
                    />
                    <CheckOutItemCard
                      image="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRdfu0aymMzr5SvSIoayrjTaMS0OaeZkMSctddIupmWBOtcyiz02UOECRwjarr9uhwkY4PeDdm9X-1BAG-pkv9JhaCgSvaHteIhdXTlkiIfYpQ3n-T-cDaZ&usqp=CAc"
                      title="Arsenal FC 26/27 Away Jersey Authentic"
                      size="Large"
                      price="$140"
                      quantity="1"
                    />
                  </>
                )}
              </div>

              <div className="space-y-3 text-sm pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">${summary.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount (-20%)</span>
                  <span className="font-bold text-red-500">-${summary.discount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-gray-900">${summary.shippingFee}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${summary.total}</span>
                </div>
              </div>
            </div>

            {/* ปุ่ม Pay Now สำหรับมือถือ */}
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
                    key={index}
                    image={item.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"}
                    title={item.title}
                    size={item.size}
                    price={`$${item.price}`}
                    quantity={item.quantity}
                  />
                ))
              ) : (
                <>
                  <CheckOutItemCard
                    image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFRSFhdZNhSokzQnjUuuuQAbfGyIuKrb0L5ijVy81eg&s=10"
                    title="Manchester United FC 26/27 Away Jersey Authentic"
                    size="Middle"
                    price="$140"
                    quantity="1"
                  />
                  <CheckOutItemCard
                    image="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRdfu0aymMzr5SvSIoayrjTaMS0OaeZkMSctddIupmWBOtcyiz02UOECRwjarr9uhwkY4PeDdm9X-1BAG-pkv9JhaCgSvaHteIhdXTlkiIfYpQ3n-T-cDaZ&usqp=CAc"
                    title="Arsenal FC 26/27 Away Jersey Authentic"
                    size="Large"
                    price="$140"
                    quantity="1"
                  />
                </>
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
                <span className="font-bold text-gray-900">${summary.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount (-20%)</span>
                <span className="font-bold text-red-500">-${summary.discount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">${summary.shippingFee}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-gray-900">${summary.total}</span>
              </div>
            </div>

            <div className="pt-2">
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

      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;