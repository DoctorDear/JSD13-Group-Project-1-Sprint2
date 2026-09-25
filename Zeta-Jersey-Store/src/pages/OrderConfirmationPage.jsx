import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderService } from '../services/order.js';

const money = (amount) => `฿${Number(amount || 0).toLocaleString()}`;

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState(useLocation().state?.orderData);
  const [error, setError] = useState('');
  const [resumeError, setResumeError] = useState('');
  const orderId = params.get('orderId');

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    const refresh = () => orderService.getById(orderId).then((response) => {
      if (active) setOrder(response.data);
    }).catch((cause) => { if (active) setError(cause.message); });
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [orderId]);

  const paymentStatus = order?.payment?.status;
  const isCod = order?.payment?.method === 'Cash on Delivery';
  const firstName = order?.shippingAddress?.recipientName?.trim().split(/\s+/)[0] || 'there';
  const address = order?.shippingAddress;
  const subtotal = order?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = Math.max(0, Number(order?.totalAmount || 0) - subtotal);
  const statusMessage = paymentStatus === 'paid'
    ? 'Payment confirmed. We are preparing your order.'
    : paymentStatus === 'awaiting_payment'
      ? 'Waiting for Stripe to confirm your payment. This page updates automatically.'
      : paymentStatus === 'failed'
        ? 'Payment failed or expired. The items have been returned to your cart.'
        : isCod
          ? 'Your order was placed. Payment will be collected on delivery.'
          : 'Your order is being prepared.';

  return <div className="min-h-screen bg-white flex flex-col">
    <Navbar page="order" />
    <main className="flex-grow flex items-center justify-center py-6 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-2xl bg-white sm:border sm:border-black sm:p-10 p-4">
        {!order ? <p role="status" className="text-center text-gray-600">{error || 'Loading your order...'}</p> : <>
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
              {paymentStatus === 'failed' ? 'Payment was not completed' : paymentStatus === 'awaiting_payment' ? 'Order received' : `Thank you for your order, ${firstName}.`}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">Order No. <span className="text-gray-600">{order.orderNumber || order.orderId}</span></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm mb-10 text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Shipping to</p>
              <p className="font-medium text-gray-800">{address?.recipientName}</p>
              <p>{address?.phone}</p>
              <p>{address?.addressLine}</p>
              <p>{[address?.subdistrict, address?.district, address?.province, address?.postalCode].filter(Boolean).join(', ')}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Payment</p>
              <p className="font-medium text-gray-800">{order.payment?.method}</p>
              <p>{paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'awaiting_payment' ? 'Awaiting confirmation' : paymentStatus === 'failed' ? 'Not completed' : isCod ? 'Pay on delivery' : 'Pending'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Date ordered</p>
              <p className="text-gray-800">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Today'}</p>
            </div>
          </div>

          <div className="text-center mb-10 space-y-4">
            <div className="border-t border-gray-300" />
            <p className="text-xs sm:text-sm text-gray-500" role="status">{statusMessage}</p>
            {paymentStatus === 'awaiting_payment' && <button className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-lg" onClick={() => orderService.resumeCheckoutSession(order._id).then(({ url }) => window.location.assign(url)).catch((cause) => setResumeError(cause.message))}>Return to Stripe checkout</button>}
            {paymentStatus === 'failed' && <Link to="/cart" className="inline-block px-6 py-2.5 bg-gray-800 text-white text-xs sm:text-sm font-medium rounded-lg">Review cart</Link>}
            {paymentStatus !== 'awaiting_payment' && paymentStatus !== 'failed' && <Link to="/profile?tab=orders" className="inline-block px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-lg">View your orders</Link>}
            {resumeError && <p className="text-xs text-red-700" role="alert">{resumeError}</p>}
          </div>

          <div className="relative flex items-center justify-center my-8">
            <div className="flex-grow border-t border-gray-300" />
            <span className="flex-shrink mx-4 text-xs sm:text-sm text-gray-500">Your Order summary</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          <div className="space-y-6">
            {order.items?.map((item, index) => {
              const image = item.productId?.images?.[0];
              return <div key={item._id || index} className="flex items-center justify-between gap-4 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {image ? <img src={image} alt={item.name} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-gray-400">No image</span>}
                    <span className="absolute top-1 right-1 bg-gray-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-gray-900">{item.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Size : {item.size}</p>
                    <p className="text-xs text-gray-500 mt-1">Quantity : {item.quantity}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">{money(item.price * item.quantity)}</span>
              </div>;
            })}
            <div className="space-y-2 text-xs sm:text-sm pt-2">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-semibold text-gray-900">{money(subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="font-semibold text-gray-900">{shipping ? money(shipping) : 'Free'}</span></div>
              <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 pt-4"><span>Total</span><span>{money(order.totalAmount)}</span></div>
            </div>
          </div>
        </>}
      </div>
    </main>
  </div>;
}
