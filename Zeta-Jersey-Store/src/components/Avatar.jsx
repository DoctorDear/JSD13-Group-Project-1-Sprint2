export default function Avatar({ user, size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white/40`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${sizes[size]} grid place-items-center rounded-full bg-lime-400 font-bold text-indigo-900 ring-2 ring-white/40`}
    >
      {initials}
    </span>
  );
}