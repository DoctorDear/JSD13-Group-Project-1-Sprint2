import logoImg from "../assets/logo/Zeta_Default_Logo.png";

export default function AuthLayout({
  image,
  imageAlt = "",
  showBackButton = false,
  onBack,
  children,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-700 to-violet-500 p-4 sm:p-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 min-h-[680px] lg:h-[700px] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 h-full items-stretch">

          {/* Left — hero image + overlay header */}
          <div className="relative rounded-2xl overflow-hidden min-h-[300px] lg:h-full">
            <img
              src={image}
              alt={imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative flex items-start justify-between p-6">
              <Logo />
              {showBackButton && (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-full bg-lime-600/90 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-lime-600 transition"
                >
                  Back to website
                </button>
              )}
            </div>
          </div>

          {/* Right — page content */}
          <div className="flex flex-col justify-center lg:pr-6 py-2 overflow-y-auto">{children}</div>

        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <img
      src={logoImg}
      alt="Zeta Logo"
      className="h-10 sm:h-12 w-auto object-contain drop-shadow scale-[5] origin-top-left -translate-x-[70px] -translate-y-[100px]"
    />
  );
}

export function AuthTitle({ children }) {
  return (
    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black">
      {children}
    </h1>
  );
}

export function AuthButton({ children, className = "", ...rest }) {
  return (
    <button
      className={`w-full rounded-lg bg-indigo-900 py-3.5 text-base font-semibold text-white
        hover:bg-indigo-800 active:scale-[.99] transition ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}