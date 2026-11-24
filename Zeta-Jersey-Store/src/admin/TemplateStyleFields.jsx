export const BADGE_OPTIONS = [
  { id: "none", label: "No badge" },
  { id: "premier-league", label: "Premier League" },
  { id: "premier-league-racism", label: "Premier League: No Room For Racism" },
];

export const DEFAULT_TEMPLATE = {
  groupId: "",
  active: true,
  backImageUrl: "",
  viewBox: [0, 0, 1000, 1000],
  name: {
    x: 500,
    y: 260,
    fontId: "barlow-condensed-900",
    fontSize: 62,
    fontWeight: 900,
    letterSpacing: 5,
    fill: "#ffffff",
    stroke: "#000000",
    strokeWidth: 2,
  },
  number: {
    x: 500,
    y: 600,
    fontId: "barlow-condensed-900",
    fontSize: 310,
    fontWeight: 900,
    letterSpacing: 0,
    fill: "#ffffff",
    stroke: "#000000",
    strokeWidth: 8,
  },
  sleeveBadge: {
    x: 65,
    y: 95,
    rotate: 0,
    skewY: 0,
    scaleX: 1,
    scaleY: 1,
    zoomViewBox: [0, 0, 260, 360],
    clipPath: "M0 0L64 0L64 96L0 96Z",
  },
  sleeveBadgeOptions: ["none"],
};

export function copyTemplate(template) {
  return template ? structuredClone(template) : structuredClone(DEFAULT_TEMPLATE);
}

export function numericValues(template) {
  const number = (value) => Number(value);
  const numericTextKeys = ["x", "y", "fontSize", "fontWeight", "letterSpacing", "strokeWidth"];
  const mapTextSection = (section) =>
    Object.fromEntries(
      Object.entries(section).map(([key, value]) => [
        key,
        numericTextKeys.includes(key) ? number(value) : value,
      ]),
    );

  return {
    ...template,
    viewBox: template.viewBox.map(number),
    name: mapTextSection(template.name),
    number: mapTextSection(template.number),
    sleeveBadge: {
      ...template.sleeveBadge,
      ...Object.fromEntries(
        ["x", "y", "rotate", "skewY", "scaleX", "scaleY"].map((key) => [
          key,
          number(template.sleeveBadge[key]),
        ]),
      ),
      zoomViewBox: template.sleeveBadge.zoomViewBox.map(number),
    },
  };
}

export function NumericField({ label, value, onChange, step = "any", error }) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full">
      <span className="font-medium text-xs text-base-content/75">{label}</span>
      <input
        className="input input-bordered input-sm w-full"
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <span role="alert" className="text-xs text-error">
          {error}
        </span>
      )}
    </label>
  );
}

export function BoxField({ label, value, onChange, error }) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full">
      <span className="font-medium text-base-content/85">
        {label}{" "}
        <span className="text-xs font-normal text-base-content/50">
          (x, y, width, height)
        </span>
      </span>
      <input
        className="input input-bordered w-full font-mono text-sm"
        placeholder="0, 0, 1000, 1000"
        value={Array.isArray(value) ? value.join(", ") : ""}
        onChange={(event) =>
          onChange(event.target.value.split(",").map((part) => part.trim()))
        }
      />
      {error && (
        <span role="alert" className="text-xs text-error">
          {error}
        </span>
      )}
    </label>
  );
}

export function TextStyleFields({ title, style, onChange, errors }) {
  const section = title.toLowerCase();
  return (
    <fieldset className="rounded-2xl border border-base-300 p-5 bg-base-50/50">
      <legend className="px-2 font-semibold text-sm text-base-content">
        {title} styling
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["x", "X position"],
          ["y", "Y position"],
          ["fontSize", "Font size"],
          ["fontWeight", "Font weight"],
          ["letterSpacing", "Letter spacing"],
          ["strokeWidth", "Outline width"],
        ].map(([key, label]) => (
          <NumericField
            key={key}
            label={label}
            value={style[key]}
            onChange={(value) => onChange(key, value)}
            error={errors[`${section}.${key}`]}
          />
        ))}
        <label className="flex flex-col gap-1 text-sm w-full">
          <span className="font-medium text-xs text-base-content/75">
            Approved font
          </span>
          <select
            className="select select-bordered select-sm w-full"
            value={style.fontId}
            onChange={(event) => onChange("fontId", event.target.value)}
          >
            <option value="barlow-condensed-900">Barlow Condensed 900</option>
          </select>
          {errors[`${section}.fontId`] && (
            <span role="alert" className="text-xs text-error">
              {errors[`${section}.fontId`]}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm w-full">
          <span className="font-medium text-xs text-base-content/75">
            Fill color
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="size-8 rounded-lg border border-base-300 cursor-pointer p-0.5 bg-base-100 shrink-0"
              value={style.fill?.startsWith("#") ? style.fill : "#ffffff"}
              onChange={(event) => onChange("fill", event.target.value)}
            />
            <input
              className="input input-bordered input-sm w-full font-mono text-xs uppercase"
              value={style.fill}
              onChange={(event) => onChange("fill", event.target.value)}
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm w-full">
          <span className="font-medium text-xs text-base-content/75">
            Outline color
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="size-8 rounded-lg border border-base-300 cursor-pointer p-0.5 bg-base-100 shrink-0"
              value={style.stroke?.startsWith("#") ? style.stroke : "#000000"}
              onChange={(event) => onChange("stroke", event.target.value)}
            />
            <input
              className="input input-bordered input-sm w-full font-mono text-xs uppercase"
              value={style.stroke}
              onChange={(event) => onChange("stroke", event.target.value)}
            />
          </div>
        </label>
      </div>
    </fieldset>
  );
}

export function SleeveBadgeFields({
  sleeveBadge,
  sleeveBadgeOptions,
  onChangeGeometry,
  onChangeOptions,
  errors,
}) {
  return (
    <>
      <fieldset className="rounded-2xl border border-base-300 p-5 bg-base-50/50">
        <legend className="px-2 font-semibold text-sm text-base-content">
          Sleeve badge geometry
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["x", "X position"],
            ["y", "Y position"],
            ["rotate", "Rotation (deg)"],
            ["skewY", "Vertical skew (deg)"],
            ["scaleX", "Horizontal scale"],
            ["scaleY", "Vertical scale"],
          ].map(([key, label]) => (
            <NumericField
              key={key}
              label={label}
              value={sleeveBadge[key]}
              onChange={(value) => onChangeGeometry(key, value)}
              error={errors[`sleeveBadge.${key}`]}
            />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <BoxField
            label="Sleeve zoom view box"
            value={sleeveBadge.zoomViewBox}
            onChange={(value) => onChangeGeometry("zoomViewBox", value)}
            error={errors["sleeveBadge.zoomViewBox"]}
          />
          <label className="flex flex-col gap-1.5 text-sm w-full">
            <span className="font-medium text-base-content/85">
              Badge clip path{" "}
              <span className="text-xs font-normal text-base-content/50">
                (SVG path data)
              </span>
            </span>
            <textarea
              className="textarea textarea-bordered font-mono text-xs w-full leading-relaxed"
              rows={3}
              value={sleeveBadge.clipPath}
              onChange={(event) => onChangeGeometry("clipPath", event.target.value)}
            />
            {errors["sleeveBadge.clipPath"] && (
              <span role="alert" className="text-xs text-error">
                {errors["sleeveBadge.clipPath"]}
              </span>
            )}
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-base-300 p-5 bg-base-50/50">
        <legend className="px-2 font-semibold text-sm text-base-content">
          Supported sleeve badges
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BADGE_OPTIONS.map(({ id, label }) => {
            const checked = sleeveBadgeOptions.includes(id);
            return (
              <label
                key={id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  checked
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-base-300 hover:bg-base-200/50"
                }`}
              >
                <input
                  className="checkbox checkbox-sm checkbox-primary"
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    onChangeOptions(
                      event.target.checked
                        ? [...sleeveBadgeOptions, id]
                        : sleeveBadgeOptions.filter((option) => option !== id),
                    )
                  }
                />
                <span className="text-xs sm:text-sm">{label}</span>
              </label>
            );
          })}
        </div>
        {errors.sleeveBadgeOptions && (
          <p role="alert" className="mt-2 text-xs text-error">
            {errors.sleeveBadgeOptions}
          </p>
        )}
      </fieldset>
    </>
  );
}
