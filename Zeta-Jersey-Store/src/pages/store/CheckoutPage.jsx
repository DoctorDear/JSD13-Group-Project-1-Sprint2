import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CheckoutDeliverySection from '../../components/checkout/CheckoutDeliverySection.jsx';
import CheckoutOrderSummary from '../../components/checkout/CheckoutOrderSummary.jsx';
import CheckoutPaymentSection from '../../components/checkout/CheckoutPaymentSection.jsx';
import { api } from '../../lib/api/api';
import { orderService } from '../../services/order.js';
import { validateCheckoutForm } from '../../lib/forms/checkoutValidation.js';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const retryOrderId = new URLSearchParams(location.search).get('retryOrder') || location.state?.retryOrderId;
  const retryShippingAddress = location.state?.retryShippingAddress;
  const [retryFirstName = '', ...retryLastNameParts] = (retryShippingAddress?.recipientName || '').trim().split(/\s+/);
  const cartItemsFromCart = location.state?.cartItems || [];
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState({ card: false, promptpay: false });
  const [paymentOptionsLoading, setPaymentOptionsLoading] = useState(true);
  const [unpaidOrder, setUnpaidOrder] = useState(null);
  const [retryOrder, setRetryOrder] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState({
    postalCode: retryShippingAddress?.postalCode || '',
    province: retryShippingAddress?.province || '',
    district: retryShippingAddress?.district || '',
    subdistrict: retryShippingAddress?.subdistrict || '',
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveAddress, setSaveAddress] = useState(false);
  const addressTouched = useRef(Boolean(retryShippingAddress));

  // State สำหรับเปิด-ปิด Order Summary ด้านบนบนมือถือ
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // State สำหรับเก็บข้อมูลสินค้าในตะกร้า
  const [cartItems, setCartItems] = useState(cartItemsFromCart);

  // State สำหรับเก็บข้อมูลฟอร์มกรอกของผู้ใช้
  const [formData, setFormData] = useState({
    email: '',
    receiveNews: true,
    country: 'Thailand',
    firstName: retryFirstName,
    lastName: retryLastNameParts.join(' '),
    apartment: '',
    address: retryShippingAddress?.addressLine || '',
    telephone: retryShippingAddress?.phone || '',
    shippingMethod: 'Standard Delivery',
  });

  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState(() => {
    if (!retryShippingAddress?.phone) return {};
    const errors = validateCheckoutForm({ formData: { telephone: retryShippingAddress.phone }, deliveryLocation: {} });
    return errors.telephone ? { telephone: errors.telephone } : {};
  });
  const checkoutItems = retryOrderId ? (retryOrder?.items || []) : cartItems;
  const inputClass = (field) => `w-full h-14 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 ${fieldErrors[field] ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-900'}`;

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

  // ดึงข้อมูลตะกร้าสินค้าจาก Backend เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    orderService.getPaymentOptions()
      .then((options) => {
        setPaymentOptions(options);
        setPaymentMethod((current) => current || (options.card ? 'card' : options.promptpay ? 'promptpay' : 'cod'));
      })
      .catch(() => setPaymentMethod((current) => current || 'cod'))
      .finally(() => setPaymentOptionsLoading(false));
    api.get('/users/profile').then(({ user }) => {
      const addresses = user?.addresses || [];
      setSavedAddresses(addresses);
      setFormData((prev) => ({ ...prev, email: prev.email || user?.email || '' }));
      const preferred = addresses.find((address) => address.isDefault) || addresses[0];
      if (preferred && !retryOrderId && !addressTouched.current) applySavedAddress(preferred);
    }).catch(() => {});
    const fetchCart = async () => {
      try {
        if (retryOrderId) {
          const result = await orderService.getById(retryOrderId);
          if (result.data?.payment?.status !== 'failed') throw new Error('This order is no longer available for payment retry.');
          setRetryOrder(result.data);
          if (!retryShippingAddress && result.data.shippingAddress) {
            applySavedAddress(result.data.shippingAddress);
            setSelectedAddressId('new');
            addressTouched.current = true;
            const errors = validateCheckoutForm({ formData: { telephone: result.data.shippingAddress.phone }, deliveryLocation: {} });
            if (errors.telephone) setFieldErrors({ telephone: errors.telephone });
          }
          return;
        }
        const response = await api.get('/users/cart');
        if (response.cart) {
          setCartItems(response.cart);
          if (!response.cart.length) {
            const orderData = await orderService.getMyOrders();
            const pendingOrder = orderData.orders?.find((order) => ["awaiting_payment", "failed"].includes(order.payment?.status));
            if (pendingOrder) setUnpaidOrder(pendingOrder);
          }
        }
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load cart.');
      }
    };
    fetchCart();
  }, [retryOrderId, retryShippingAddress]);

  // --- ระบบคำนวณราคาอัตโนมัติจากสินค้าในตะกร้า (Real-time calculation) ---
  const subtotal = checkoutItems.reduce((acc, item) => {
    const price = Number(item.price ?? item.productId?.price) || 0;
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
    if (name === 'telephone') {
      const nextErrors = validateCheckoutForm({ formData: { ...formData, telephone: value }, deliveryLocation });
      setFieldErrors((prev) => ({ ...prev, telephone: value ? (nextErrors.telephone || '') : '' }));
    } else if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
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
    if (!checkoutItems.length) return setErrorMessage(retryOrderId ? 'Could not load this order. Return to My Orders and try again.' : 'Your cart is empty.');
    const errors = validateCheckoutForm({ formData, deliveryLocation });
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setErrorMessage('Please correct the highlighted fields before continuing.');
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
        const checkout = retryOrderId
          ? await orderService.retryCheckoutSession(retryOrderId, paymentMethod, shippingAddress)
          : await orderService.createCheckoutSession(shippingAddress, paymentMethod);
        if (!checkout?.url) throw new Error('Stripe checkout link was not returned. Please try again.');
        window.location.assign(checkout.url);
        return;
      }
      if (retryOrderId) throw new Error('Choose Credit Card or QR PromptPay to retry this order.');
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
      {unpaidOrder && (
        <div role="status" className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          You have an order awaiting payment. Its items are saved with the order.
          <Link to="/profile?tab=orders" className="ml-2 font-semibold underline">Continue payment from My Orders</Link>
        </div>
      )}
      {retryOrder && (
        <div role="status" className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Retrying payment for order {retryOrder.orderNumber}. Review your shipping details before paying.
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
            <CheckoutOrderSummary
              items={checkoutItems}
              subtotal={subtotal}
              discount={discount}
              shippingFee={shippingFee}
              total={total}
              discountCode={discountCode}
              onDiscountCodeChange={setDiscountCode}
              listClassName="space-y-3"
              emptyClassName="text-xs text-gray-500 text-center py-2"
              totalsClassName="space-y-2 text-sm pt-2"
            />
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
                    aria-invalid={Boolean(fieldErrors.email)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-600" role="alert">{fieldErrors.email}</p>}
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
            <CheckoutDeliverySection
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={handleAddressSelection}
              formData={formData}
              onChange={handleChange}
              deliveryLocation={deliveryLocation}
              onLocationChange={(value) => {
                addressTouched.current = true;
                setSelectedAddressId('new');
                setDeliveryLocation(value);
                if (value.province && value.postalCode) setFieldErrors((prev) => ({ ...prev, location: '' }));
              }}
              fieldErrors={fieldErrors}
              saveAddress={saveAddress}
              onSaveAddressChange={setSaveAddress}
              inputClass={inputClass}
            />

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

            <CheckoutPaymentSection
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
              paymentOptions={paymentOptions}
              retryOrderId={retryOrderId}
            />

            {/* --- 2. Order Summary ตัวเต็มด้านล่างเพจ (สำหรับมือถือ) --- */}
            <div className="lg:hidden space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
              <CheckoutOrderSummary
                items={checkoutItems}
                subtotal={subtotal}
                discount={discount}
                shippingFee={shippingFee}
                total={total}
                showDiscountInput={false}
              />
            </div>

            <div className="lg:hidden pt-2">
              {errorMessage && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{errorMessage}</p>}
              <button
                onClick={handlePayNow}
                disabled={loading || paymentOptionsLoading || (retryOrderId && !retryOrder)}
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

            <CheckoutOrderSummary
              items={checkoutItems}
              subtotal={subtotal}
              discount={discount}
              shippingFee={shippingFee}
              total={total}
              discountCode={discountCode}
              onDiscountCodeChange={setDiscountCode}
              discountWrapperClassName="flex items-center gap-2 pt-2"
              totalsClassName="pt-4 space-y-3 text-sm"
            />

            <div className="pt-2">
              {errorMessage && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{errorMessage}</p>}
              <button
                onClick={handlePayNow}
                disabled={loading || paymentOptionsLoading || (retryOrderId && !retryOrder)}
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
