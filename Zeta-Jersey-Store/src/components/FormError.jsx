export default function FormError({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3"
    >
      <svg className="mt-0.5 h-5 w-5 shrink-0 fill-red-600" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V5h2v5z" />
      </svg>
      <p className="text-sm font-medium text-red-700">{message}</p>
    </div>
  );
}