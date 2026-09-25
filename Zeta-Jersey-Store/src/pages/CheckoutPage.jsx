import { useState, useEffect, useRef } from 'react';
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
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState({ card: false, promptpay: false });
  const [paymentOptionsLoading, setPaymentOptionsLoading] = useState(true);
  const [deliveryLocation, setDeliveryLocation] = useState({ postalCode: '', province: '', district: '', subdistrict: '' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveAddress, setSaveAddress] = useState(false);
  const addressTouched = useRef(false);

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
  const [fieldErrors, setFieldErrors] = useState({});
  const inputClass = (field) => `w-full h-14 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 ${fieldErrors[field] ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-900'}`;

  // ดึงข้อมูลตะกร้าสินค้าจาก Backend เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    orderService.getPaymentOptions()
      .then((options) => {
        setPaymentOptions(options);
        setPaymentMethod((current) => current || (options.card ? 'card' : 'cod'));
      })
      .catch(() => setPaymentMethod((current) => current || 'cod'))
      .finally(() => setPaymentOptionsLoading(false));
    api.get('/users/profile').then(({ user }) => {
      const addresses = user?.addresses || [];
      setSavedAddresses(addresses);
      setFormData((prev) => ({ ...prev, email: prev.email || user?.email || '' }));
      const preferred = addresses.find((address) => address.isDefault) || addresses[0];
      if (preferred && !addressTouched.current) applySavedAddress(preferred);
    }).catch(() => {});
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
    if (['firstName', 'lastName', 'address', 'apartment', 'telephone'].includes(name)) {
      addressTouched.current = true;
      setSelectedAddressId('new');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrorMessage('');
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const applySavedAddress = (address) => {
    const [firstName = '', ...lastNameParts] = (address.recipientName || '').trim().split(/\s+/);
    setSelectedAddressId(address._id);
    setSaveAddress(false);
    setFormData((prev) => ({
      ...prev,
      firstName,
      lastName: lastNameParts.join(' '),
      address: address.addressLine || '',
      apartment: '',
      telephone: address.phone || '',
    }));
    setDeliveryLocation({
      province: address.province || '',
      district: address.district || '',
      subdistrict: address.subdistrict || '',
      postalCode: address.postalCode || '',
    });
    setFieldErrors({});
  };

  const handleAddressSelection = (event) => {
    addressTouched.current = true;
    const address = savedAddresses.find((item) => item._id === event.target.value);
    if (address) return applySavedAddress(address);
    setSelectedAddressId('new');
    setFormData((prev) => ({ ...prev, firstName: '', lastName: '', address: '', apartment: '', telephone: '' }));
    setDeliveryLocation({ postalCode: '', province: '', district: '', subdistrict: '' });
    setFieldErrors({});
  };

  const handlePayNow = async () => {
    setErrorMessage('');

    if (paymentOptionsLoading || !paymentMethod) return;
    if (!cartItems.length) return setErrorMessage('Your cart is empty.');
    const errors = {
      firstName: formData.firstName.trim() ? '' : 'Enter your first name.',
      lastName: formData.lastName.trim() ? '' : 'Enter your last name.',
      address: formData.address.trim() ? '' : 'Enter your street address.',
      telephone: formData.telephone.trim() ? '' : 'Enter your telephone number.',
      location: deliveryLocation.province && deliveryLocation.postalCode ? '' : 'Choose your province and postal code.',
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setErrorMessage('Please complete the highlighted fields.');
      return;
    }

    try {
      setLoading(true);

      const shippingAddress = {
        recipientName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.telephone.trim(),
        addressLine: [formData.address.trim(), formData.apartment.trim()].filter(Boolean).join(', '),
        subdistrict: deliveryLocation.subdistrict,
        province: deliveryLocation.province,
        district: deliveryLocation.district,
        postalCode: deliveryLocation.postalCode,
      };
      if (saveAddress && selectedAddressId === 'new') {
        const result = await api.post('/users/address', {
          ...shippingAddress,
          isDefault: savedAddresses.length === 0,
        });
        setSavedAddresses(result.addresses || []);
        setSaveAddress(false);
      }
      if (paymentMethod !== 'cod') {
        const checkout = await orderService.createCheckoutSession(shippingAddress, paymentMethod);
        if (!checkout?.url) throw new Error('Stripe checkout link was not returned. Please try again.');
        window.location.assign(checkout.url);
        return;
      }
      const response = await orderService.create(shippingAddress, paymentMethod);
      window.dispatchEvent(new Event('cart-updated'));
      navigate(`/order-confirmation?orderId=${response.data._id}`);

    } catch (error) {
      console.error('Payment failed:', error);
      setErrorMessage(error.status ? `${error.message} (HTTP ${error.status})` : error.message || 'Failed to create order. Please try again.');
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
                {savedAddresses.length > 0 && (
                  <div>
                    <label htmlFor="saved-address" className="mb-1 block text-sm font-medium text-gray-900">Shipping address</label>
                    <select id="saved-address" value={selectedAddressId} onChange={handleAddressSelection} className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900">
                      {savedAddresses.map((address) => (
                        <option key={address._id} value={address._id}>
                          {address.isDefault ? 'Default: ' : ''}{address.recipientName} — {address.addressLine}, {address.province} {address.postalCode}
                        </option>
                      ))}
                      <option value="new">Use a new address</option>
                    </select>
                  </div>
                )}
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
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      aria-invalid={Boolean(fieldErrors.firstName)}
                      className={inputClass('firstName')}
                    />
                    {fieldErrors.firstName && <p className="mt-1 text-xs text-red-600" role="alert">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      aria-invalid={Boolean(fieldErrors.lastName)}
                      className={inputClass('lastName')}
                    />
                    {fieldErrors.lastName && <p className="mt-1 text-xs text-red-600" role="alert">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  aria-invalid={Boolean(fieldErrors.address)}
                  className={inputClass('address')}
                />
                {fieldErrors.address && <p className="-mt-2 text-xs text-red-600" role="alert">{fieldErrors.address}</p>}
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc (optional)"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />

                <ThaiLocationFields
                  value={deliveryLocation}
                  onChange={(value) => {
                    addressTouched.current = true;
                    setSelectedAddressId('new');
                    setDeliveryLocation(value);
                    if (value.province && value.postalCode) setFieldErrors((prev) => ({ ...prev, location: '' }));
                  }}
                  error={fieldErrors.location}
                />

                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Telephone"
                  aria-invalid={Boolean(fieldErrors.telephone)}
                  className={inputClass('telephone')}
                />
                {fieldErrors.telephone && <p className="-mt-2 text-xs text-red-600" role="alert">{fieldErrors.telephone}</p>}
                {selectedAddressId === 'new' && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} className="w-4 h-4 rounded text-indigo-900 focus:ring-indigo-900" />
                    Save this address to my account
                  </label>
                )}
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

            <section aria-labelledby="payment-title">
              <h2 id="payment-title" className="mb-4 text-xl font-bold text-gray-900">Payment</h2>
              <p className="mb-3 text-xs text-gray-500">Card and PromptPay open Stripe test checkout. Cash on Delivery is paid on delivery.</p>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {[
                  { id: 'card', label: 'Credit Card', detail: paymentOptions.card ? 'Pay securely with Stripe test checkout' : 'Unavailable until Stripe test keys are configured', badges: 'VISA · MC', disabled: !paymentOptions.card },
                  { id: 'promptpay', label: 'QR PromptPay', detail: paymentOptions.promptpay ? 'Pay with Stripe test checkout' : 'Unavailable for this Stripe test account', badges: 'PromptPay', disabled: !paymentOptions.promptpay },
                  { id: 'cod', label: 'Cash on Delivery', detail: 'Pay when your order is delivered', badges: '' },
                ].map((method, index) => (
                  <label key={method.id} className={`flex items-center justify-between gap-4 p-4 ${method.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${index < 2 ? 'border-b border-gray-100' : ''} ${paymentMethod === method.id ? 'bg-blue-50/40' : ''}`}>
                    <span className="flex items-center gap-3">
                      <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} disabled={method.disabled} onChange={() => setPaymentMethod(method.id)} />
                      <span>
                        <span className="block text-sm font-medium text-gray-900">{method.label}</span>
                        <span className="block text-xs text-gray-500">{method.detail}</span>
                      </span>
                    </span>
                    {method.badges && <span className="shrink-0 text-xs font-semibold text-gray-500">{method.badges}</span>}
                  </label>
                ))}
              </div>
            </section>

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
              {errorMessage && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{errorMessage}</p>}
              <button
                onClick={handlePayNow}
                disabled={loading || paymentOptionsLoading}
                className="w-full h-12 bg-[#251b74] hover:bg-[#1a1355] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading || paymentOptionsLoading ? 'PROCESSING...' : 'PLACE ORDER'}
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
              {errorMessage && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{errorMessage}</p>}
              <button
                onClick={handlePayNow}
                disabled={loading || paymentOptionsLoading}
                className="w-full h-12 bg-[#251b74] hover:bg-[#1a1355] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading || paymentOptionsLoading ? 'PROCESSING...' : 'PLACE ORDER'}
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
