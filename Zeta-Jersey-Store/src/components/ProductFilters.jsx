import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

function FilterDropdown({
  id,
  label,
  active,
  open,
  onToggle,
  onClose,
  children,
  wide = false,
}) {
  return (
    <details className="dropdown" open={open}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          onToggle(id);
        }}
        className={`btn h-12 min-h-12 rounded-lg border px-4 text-sm font-bold shadow-none hover:bg-gray-50 ${
          active
            ? "border-zeta-main bg-zeta-main-lighter text-zeta-main"
            : "border-gray-400 bg-white text-gray-900"
        }`}
      >
        {label}
        <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </summary>
      <div
        className={`dropdown-content z-30 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-xl ${
          wide ? "w-[min(24rem,calc(100vw-2rem))]" : "w-72"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm absolute right-2 top-2 rounded-full p-1 text-gray-500"
          aria-label={`Close ${label} filter`}
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </details>
  );
}

function CheckboxOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          selected ? "border-zeta-main bg-zeta-main text-white" : "border-gray-300 bg-white"
        }`}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
      {label}
    </button>
  );
}

function MultiSelectPanel({ label, items, selected, onChange, allLabel = `All ${label.toLowerCase()}` }) {
  return (
    <div className="pt-5">
      <div className="mb-2 flex items-center justify-between pr-8">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-semibold text-zeta-main hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        <CheckboxOption label={allLabel} selected={selected.length === 0} onClick={() => onChange([])} />
        {items.map((item) => (
          <CheckboxOption
            key={typeof item === "string" ? item : item.value}
            label={typeof item === "string" ? item : item.label}
            selected={selected.includes(typeof item === "string" ? item : item.value)}
            onClick={() => {
              const value = typeof item === "string" ? item : item.value;
              onChange(selected.includes(value) ? selected.filter((choice) => choice !== value) : [...selected, value]);
            }}
          />
        ))}
      </div>
    </div>
  );
}

const sortOptions = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-low", "Price: low to high"],
  ["price-high", "Price: high to low"],
  ["name", "Name: A to Z"],
];

export default function ProductFilters({ options, values, onChange, onClear, priceBounds }) {
  const [openFilter, setOpenFilter] = useState(null);
  const sortLabel = sortOptions.find(([value]) => value === values.sort)?.[1] || "Featured";
  const priceActive = values.minPrice || values.maxPrice;
  const minPriceValue = values.minPrice === "" ? priceBounds.min : Number(values.minPrice);
  const maxPriceValue = values.maxPrice === "" ? priceBounds.max : Number(values.maxPrice);
  const priceRange = Math.max(1, priceBounds.max - priceBounds.min);
  const minPercent = ((minPriceValue - priceBounds.min) / priceRange) * 100;
  const maxPercent = ((maxPriceValue - priceBounds.min) / priceRange) * 100;
  const toggleFilter = (id) => {
    setOpenFilter((current) => (current === id ? null : id));
  };

  const updateMinPriceFromSlider = (value) => {
    const nextValue = Math.min(Number(value), maxPriceValue - 100);
    onChange.minPrice(nextValue <= priceBounds.min ? "" : String(nextValue));
  };

  const updateMaxPriceFromSlider = (value) => {
    const nextValue = Math.max(Number(value), minPriceValue + 100);
    onChange.maxPrice(nextValue >= priceBounds.max ? "" : String(nextValue));
  };

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="mr-1 h-6 w-6 text-gray-900" aria-hidden="true" />

        <FilterDropdown
          id="search"
          label="Search"
          active={Boolean(values.search)}
          open={openFilter === "search"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
          wide
        >
          <div className="pt-5">
            <label className="input input-bordered flex h-12 items-center gap-2 rounded-lg border-gray-300 bg-white">
              <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
              <input
                type="search"
                value={values.search}
                onChange={(event) => onChange.search(event.target.value)}
                placeholder="Search products"
                className="grow text-sm"
              />
            </label>
          </div>
        </FilterDropdown>

        <FilterDropdown
          id="team"
          label="Team"
          active={values.team.length > 0}
          open={openFilter === "team"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
        >
          <MultiSelectPanel
            label="Teams"
            items={options.teams}
            selected={values.team}
            onChange={onChange.team}
          />
        </FilterDropdown>

        <FilterDropdown
          id="league"
          label="League"
          active={values.league.length > 0}
          open={openFilter === "league"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
        >
          <MultiSelectPanel
            label="Leagues"
            items={options.leagues}
            selected={values.league}
            onChange={onChange.league}
          />
        </FilterDropdown>

        <FilterDropdown
          id="collection"
          label="Collection"
          active={values.collection.length > 0}
          open={openFilter === "collection"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
        >
          <MultiSelectPanel
            label="Collections"
            items={options.collections}
            selected={values.collection}
            onChange={onChange.collection}
          />
        </FilterDropdown>

        <FilterDropdown
          id="edition"
          label="Edition"
          active={values.edition.length > 0}
          open={openFilter === "edition"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
        >
          <MultiSelectPanel
            label="Editions"
            items={options.editions}
            selected={values.edition}
            onChange={onChange.edition}
          />
        </FilterDropdown>

        <FilterDropdown
          id="price"
          label="Price"
          active={Boolean(priceActive)}
          open={openFilter === "price"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
          wide
        >
          <div className="pt-5">
            <div className="flex items-end gap-3">
              <label className="form-control w-full">
                <span className="mb-2 text-sm font-bold text-gray-900">From</span>
                <input
                  type="number"
                  min="0"
                  value={values.minPrice}
                  onChange={(event) => onChange.minPrice(event.target.value)}
                  placeholder={String(priceBounds.min)}
                  className="input input-bordered h-12 w-full rounded-lg border-gray-300 text-sm"
                />
              </label>
              <label className="form-control w-full">
                <span className="mb-2 text-sm font-bold text-gray-900">To</span>
                <input
                  type="number"
                  min="0"
                  value={values.maxPrice}
                  onChange={(event) => onChange.maxPrice(event.target.value)}
                  placeholder={String(priceBounds.max)}
                  className="input input-bordered h-12 w-full rounded-lg border-gray-300 text-sm"
                />
              </label>
            </div>
            <div className="relative mt-6 h-6">
              <div className="absolute left-0 right-0 top-2 h-1 rounded-full bg-gray-200" />
              <div
                className="absolute top-2 h-1 rounded-full bg-zeta-main"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              />
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step="100"
                value={Math.min(minPriceValue, maxPriceValue - 100)}
                onChange={(event) => updateMinPriceFromSlider(event.target.value)}
                aria-label="Minimum price slider"
                className="pointer-events-none absolute inset-0 z-20 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-zeta-main [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-zeta-main"
              />
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step="100"
                value={Math.max(maxPriceValue, minPriceValue + 100)}
                onChange={(event) => updateMaxPriceFromSlider(event.target.value)}
                aria-label="Maximum price slider"
                className="pointer-events-none absolute inset-0 z-30 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-zeta-main [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-zeta-main"
              />
            </div>
          </div>
        </FilterDropdown>

        <FilterDropdown
          id="availability"
          label="Availability"
          active={values.availability.length > 0}
          open={openFilter === "availability"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
        >
          <MultiSelectPanel
            label="Availability"
            allLabel="Any availability"
            items={[{ value: "yes", label: "In stock" }, { value: "no", label: "Out of stock" }]}
            selected={values.availability}
            onChange={onChange.availability}
          />
        </FilterDropdown>

        <FilterDropdown
          id="sale"
          label="On sale"
          active={values.onSale.length > 0}
          open={openFilter === "sale"}
          onToggle={toggleFilter}
          onClose={() => setOpenFilter(null)}
        >
          <MultiSelectPanel
            label="On sale"
            allLabel="Any sale status"
            items={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
            selected={values.onSale}
            onChange={onChange.onSale}
          />
        </FilterDropdown>

        <button
          type="button"
          onClick={onClear}
          className="btn btn-ghost h-12 min-h-12 rounded-lg px-3 text-sm font-bold text-zeta-main hover:bg-zeta-main-lighter"
        >
          <X className="h-4 w-4" />
          Clear all
        </button>
      </div>

      <FilterDropdown
        id="sort"
        label={sortLabel}
        active={values.sort !== "featured"}
        open={openFilter === "sort"}
        onToggle={toggleFilter}
        onClose={() => setOpenFilter(null)}
        wide
      >
        <div className="pt-5">
          <p className="mb-2 text-sm font-bold text-gray-900">Sort products</p>
          {sortOptions.map(([value, label]) => (
            <CheckboxOption
              key={value}
              label={label}
              selected={values.sort === value}
              onClick={() => onChange.sort(value)}
            />
          ))}
        </div>
      </FilterDropdown>
    </div>
  );
}
