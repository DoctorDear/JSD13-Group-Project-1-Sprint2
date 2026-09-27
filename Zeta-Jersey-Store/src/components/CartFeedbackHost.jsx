import { useEffect, useRef, useState } from "react";
import CartFeedback from "./CartFeedback.jsx";

export default function CartFeedbackHost() {
  const [messages, setMessages] = useState([]);
  const timers = useRef(new Map());

  useEffect(() => {
    const timerMap = timers.current;
    const handleFeedback = (event) => {
      const id = crypto.randomUUID();
      setMessages((current) => [
        ...current,
        { ...event.detail, id, exiting: false },
      ]);
      if (event.detail.type === "success") {
        const timer = window.setTimeout(() => {
          setMessages((current) => current.map((message) =>
            message.id === id ? { ...message, exiting: true } : message,
          ));
          timers.current.set(id, window.setTimeout(() => {
            setMessages((current) => current.filter((message) => message.id !== id));
            timers.current.delete(id);
          }, 300));
        }, 5000);
        timerMap.set(id, timer);
      }
    };

    window.addEventListener("cart-feedback", handleFeedback);
    return () => {
      window.removeEventListener("cart-feedback", handleFeedback);
      timerMap.forEach((timer) => window.clearTimeout(timer));
      timerMap.clear();
    };
  }, []);

  const dismissMessage = (id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    setMessages((current) => current.map((message) =>
      message.id === id ? { ...message, exiting: true } : message,
    ));
    timers.current.set(id, window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
      timers.current.delete(id);
    }, 300));
  };

  if (messages.length === 0) return null;

  return (
    <div className="fixed right-4 top-24 z-40 flex max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.map((feedback) => (
        <CartFeedback
          key={feedback.id}
          feedback={feedback}
          isHome={feedback.isHome}
          onDismiss={() => dismissMessage(feedback.id)}
        />
      ))}
    </div>
  );
}
