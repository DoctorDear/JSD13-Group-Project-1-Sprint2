import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function OrderConfirmationPage() {
  const order = useLocation().state?.orderData;
  return <div className="min-h-screen bg-white">
    <Navbar page="order" />
    <main className="mx-auto max-w-2xl px-6 py-16">
      {order ? <>
        <h1 className="text-3xl font-bold">Thank you for your order</h1>
        <p className="mt-3">Order No. {order.orderNumber || order.orderId}</p>
        <p className="mt-2">Total: ฿{Number(order.totalAmount).toLocaleString()}</p>
        <h2 className="mt-8 text-xl font-semibold">Items</h2>
        <ul className="mt-3 divide-y">{order.items?.map((item, index) => <li key={item._id || index} className="flex justify-between py-3"><span>{item.name} · {item.size} · Qty {item.quantity}</span><span>฿{(item.price * item.quantity).toLocaleString()}</span></li>)}</ul>
        <h2 className="mt-8 text-xl font-semibold">Shipping to</h2>
        <p className="mt-2">{order.shippingAddress?.recipientName}</p>
        <p>{[order.shippingAddress?.addressLine, order.shippingAddress?.district, order.shippingAddress?.province, order.shippingAddress?.postalCode].filter(Boolean).join(', ')}</p>
      </> : <p>Open My Orders to view your order details.</p>}
      <Link to="/profile?tab=orders" className="mt-8 inline-block font-semibold underline">My Orders</Link>
    </main>
  </div>;
}
