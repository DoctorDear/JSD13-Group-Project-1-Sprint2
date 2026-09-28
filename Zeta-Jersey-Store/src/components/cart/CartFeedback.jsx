import { CircleCheck, CircleX } from "lucide-react";

export default function CartFeedback({ feedback, onDismiss, isHome = false }) {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`relative overflow-hidden w-full rounded-xl border p-4 text-sm shadow-[0_8px_28px_-12px_rgba(34,24,90,0.22)] transition-[opacity,transform,margin,padding] duration-300 ease-out ${
        feedback.exiting ? "-translate-y-2 scale-95 opacity-0 -mb-20" : "translate-y-0 scale-100 opacity-100"
      } ${
        isHome
          ? "border-white/10 bg-[#2F2F2F]/90 text-white backdrop-blur-lg"
          : "border-gray-200 bg-white text-gray-900"
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <CircleCheck className={`mt-0.5 h-5 w-5 shrink-0 ${isHome ? "text-zeta-sub" : "text-green-600"}`} aria-hidden="true" />
          ) : (
            <CircleX className={`mt-0.5 h-5 w-5 shrink-0 ${isHome ? "text-red-300" : "text-red-600"}`} aria-hidden="true" />
          )}
          <p className={`font-semibold ${!isSuccess && !isHome ? "text-red-700" : ""}`}>{feedback.message}</p>
        </div>
        <button type="button" onClick={onDismiss} className={`shrink-0 font-medium ${isHome ? "text-white/80 hover:text-white" : "text-zeta-main hover:text-[#241878]"}`}>
          Dismiss
        </button>
      </div>
      <div aria-hidden="true" className={`absolute bottom-0 inset-x-0 h-1 ${isHome ? "bg-white/10" : "bg-gray-100"}`}>
        <div
          className={`h-full origin-left ${isSuccess ? (isHome ? "bg-zeta-sub" : "bg-green-600") : (isHome ? "bg-red-300" : "bg-red-600")}`}
          style={{
            animation: `cart-feedback-countdown ${feedback.durationMs || 5000}ms linear forwards`,
            animationPlayState: feedback.exiting ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}
