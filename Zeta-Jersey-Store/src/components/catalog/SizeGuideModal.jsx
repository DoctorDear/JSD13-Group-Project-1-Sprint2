import { useEffect } from "react";

const GUIDE_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const GUIDE_ROWS = [
  {
    label: "Chest (in.)",
    values: ["36", "39", "42", "45", "48", "52", "58"],
  },
  {
    label: "Length (in.)",
    values: ["28", "28 1/2", "29", "29 1/2", "30", "32", "32 1/2"],
  },
];

const getGuideTitle = (product) => {
  const brand = product?.brand || "Jersey";
  const season = product?.name?.match(/\d{4}(?:\/|-)\d{2,4}/)?.[0] || "";
  const edition = product?.edition?.replace(/\s*Edition$/i, "") || "";

  return [brand, season, edition, "JERSEY", "SIZE GUIDE"]
    .filter(Boolean)
    .join(" ");
};

const SizeGuideModal = ({ product, isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby="size-guide-title"
        aria-modal="true"
        className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
          <h2
            id="size-guide-title"
            className="pr-4 text-xl font-bold leading-tight text-zeta-main sm:text-2xl"
          >
            {getGuideTitle(product)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="grid h-10 w-10 shrink-0 place-items-center border-2 border-slate-700 text-2xl leading-none text-slate-700 transition hover:bg-slate-100"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="overflow-x-auto px-3 py-6 sm:px-8 sm:py-8">
          <table className="w-full min-w-[720px] border-collapse text-center text-base text-slate-700 sm:text-lg">
            <thead>
              <tr>
                <th className="w-48 border border-slate-200 bg-slate-100 px-3 py-4 text-left font-bold sm:text-center">
                  Size
                </th>
                {GUIDE_SIZES.map((size) => (
                  <th
                    key={size}
                    className="border border-slate-200 px-3 py-4 font-medium"
                  >
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GUIDE_ROWS.map((row) => (
                <tr key={row.label}>
                  <th className="border border-slate-200 bg-slate-100 px-3 py-4 text-left font-bold sm:text-center">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${GUIDE_SIZES[index]}`} className="border border-slate-200 px-3 py-4">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
