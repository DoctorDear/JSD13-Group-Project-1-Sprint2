export default function Field({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  className = "",
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-lg font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full rounded-lg bg-gray-200 px-4 py-3.5 text-gray-900 placeholder-gray-500 outline-none transition
          focus:ring-2 ${error ? "ring-2 ring-red-500 focus:ring-red-500" : "focus:ring-indigo-900"}`}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}