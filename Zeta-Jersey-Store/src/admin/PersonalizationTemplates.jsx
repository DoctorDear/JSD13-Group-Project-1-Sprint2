import { useState } from "react";
import JerseyPersonalizationPreview from "../components/JerseyPersonalizationPreview.jsx";
import { buildPersonalizationTemplatePayload, validatePersonalizationTemplate } from "../lib/productForm.js";
import { adminService } from "../services/adminService.js";
import { PageHeading } from "./AdminUI";
import { ImageUrlUploadField } from "./ImageUploadField.jsx";

const BADGE_OPTIONS = [
  { id: "none", label: "No badge" },
  { id: "premier-league", label: "Premier League" },
  { id: "premier-league-racism", label: "Premier League: No Room For Racism" },
];

const DEFAULT_TEMPLATE = {
  groupId: "",
  active: true,
  backImageUrl: "",
  viewBox: [0, 0, 1000, 1000],
  name: { x: 500, y: 260, fontId: "barlow-condensed-900", fontSize: 62, fontWeight: 900, letterSpacing: 5, fill: "#ffffff", stroke: "#000000", strokeWidth: 2 },
  number: { x: 500, y: 600, fontId: "barlow-condensed-900", fontSize: 310, fontWeight: 900, letterSpacing: 0, fill: "#ffffff", stroke: "#000000", strokeWidth: 8 },
  sleeveBadge: { x: 65, y: 95, rotate: 0, skewY: 0, scaleX: 1, scaleY: 1, zoomViewBox: [0, 0, 260, 360], clipPath: "M0 0L64 0L64 96L0 96Z" },
  sleeveBadgeOptions: ["none"],
};

function copyTemplate(template) {
  return template ? structuredClone(template) : structuredClone(DEFAULT_TEMPLATE);
}

function NumericField({ label, value, onChange, step = "any", error }) {
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
      {error && <span role="alert" className="text-xs text-error">{error}</span>}
    </label>
  );
}

function BoxField({ label, value, onChange, error }) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full">
      <span className="font-medium text-base-content/85">
        {label} <span className="text-xs font-normal text-base-content/50">(x, y, width, height)</span>
      </span>
      <input
        className="input input-bordered w-full font-mono text-sm"
        placeholder="0, 0, 1000, 1000"
        value={Array.isArray(value) ? value.join(", ") : ""}
        onChange={(event) => onChange(event.target.value.split(",").map((part) => part.trim()))}
      />
      {error && <span role="alert" className="text-xs text-error">{error}</span>}
    </label>
  );
}

function TextStyleFields({ title, style, onChange, errors }) {
  const section = title.toLowerCase();
  return (
    <fieldset className="rounded-2xl border border-base-300 p-5 bg-base-50/50">
      <legend className="px-2 font-semibold text-sm text-base-content">{title} styling</legend>
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
          <span className="font-medium text-xs text-base-content/75">Approved font</span>
          <select
            className="select select-bordered select-sm w-full"
            value={style.fontId}
            onChange={(event) => onChange("fontId", event.target.value)}
          >
            <option value="barlow-condensed-900">Barlow Condensed 900</option>
          </select>
          {errors[`${section}.fontId`] && <span role="alert" className="text-xs text-error">{errors[`${section}.fontId`]}</span>}
        </label>
        <label className="flex flex-col gap-1 text-sm w-full">
          <span className="font-medium text-xs text-base-content/75">Fill color</span>
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
          <span className="font-medium text-xs text-base-content/75">Outline color</span>
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

function numericValues(template) {
  const number = (value) => Number(value);
  return {
    ...template,
    viewBox: template.viewBox.map(number),
    name: Object.fromEntries(Object.entries(template.name).map(([key, value]) => [key, ["x", "y", "fontSize", "fontWeight", "letterSpacing", "strokeWidth"].includes(key) ? number(value) : value])),
    number: Object.fromEntries(Object.entries(template.number).map(([key, value]) => [key, ["x", "y", "fontSize", "fontWeight", "letterSpacing", "strokeWidth"].includes(key) ? number(value) : value])),
    sleeveBadge: {
      ...template.sleeveBadge,
      ...Object.fromEntries(["x", "y", "rotate", "skewY", "scaleX", "scaleY"].map((key) => [key, number(template.sleeveBadge[key])])),
      zoomViewBox: template.sleeveBadge.zoomViewBox.map(number),
    },
  };
}

export default function PersonalizationTemplates({ store }) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [draftState, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const selectedTemplate = store.templates.find((template) => template.groupId === selectedGroupId) || store.templates[0];
  const draft = draftState || copyTemplate(selectedTemplate);

  const setField = (key, value) => setDraft((current) => ({ ...(current || copyTemplate(selectedTemplate)), [key]: value }));
  const setNested = (section, key, value) => setDraft((current) => {
    const source = current || copyTemplate(selectedTemplate);
    return { ...source, [section]: { ...source[section], [key]: value } };
  });
  const setBox = (section, value) => setDraft((current) => ({ ...(current || copyTemplate(selectedTemplate)), [section]: value }));

  const beginNew = () => {
    setDraft(copyTemplate(null));
    setIsNew(true);
    setSelectedGroupId("");
    setErrors({});
    setError("");
  };

  async function save(event) {
    event.preventDefault();
    const draftForValidation = { ...draft, groupId: draft.groupId.trim() };
    const nextErrors = validatePersonalizationTemplate(draftForValidation);
    setErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) return;
    const prepared = buildPersonalizationTemplatePayload(numericValues(draftForValidation));

    setSaving(true);
    try {
      const response = isNew
        ? await adminService.createPersonalizationTemplate(prepared)
        : await adminService.updatePersonalizationTemplate(selectedGroupId || selectedTemplate.groupId, prepared);
      const saved = response.template;
      setIsNew(false);
      setSelectedGroupId(saved.groupId);
      await store.refresh("Personalization template saved.");
      setDraft(copyTemplate(saved));
    } catch (saveError) {
      setError(saveError.message || "Failed to save the personalization template.");
    } finally {
      setSaving(false);
    }
  }

  const previewBadge = draft.sleeveBadgeOptions.find((id) => id !== "none") || "none";
  const previewTemplate = { ...draft, backImageUrl: draft.backImageUrl || "" };

  return (
    <>
      <PageHeading title="Personalization Templates" subtitle="Configure approved jersey print and sleeve badge layouts">
        <button type="button" className="btn btn-primary" onClick={beginNew} disabled={imageUploading}>Create template</button>
      </PageHeading>
      {!store.templates.length && !isNew ? (
        <p className="rounded-xl border border-base-300 p-5 text-sm text-base-content/65">No personalization templates yet. Create one to make products eligible for personalization.</p>
      ) : null}
      {store.templates.length > 0 && !isNew && (
        <div className="mb-6 flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-base-300 bg-base-100 shadow-sm max-w-xl">
          <span className="text-sm font-semibold text-base-content shrink-0">Template group:</span>
          <select
            className="select select-bordered select-sm flex-1 min-w-[200px]"
            value={selectedGroupId || selectedTemplate?.groupId || ""}
            disabled={imageUploading}
            onChange={(event) => {
              const selected = store.templates.find((template) => template.groupId === event.target.value);
              setSelectedGroupId(event.target.value);
              setDraft(copyTemplate(selected));
              setErrors({});
              setError("");
            }}
          >
            {store.templates.map((template) => (
              <option key={template.groupId} value={template.groupId}>
                {template.groupId}{template.active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </div>
      )}
      {(isNew || selectedTemplate) && (
        <form onSubmit={save} className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center pb-4 border-b border-base-200">
              <label className="flex flex-col gap-1.5 text-sm w-full">
                <span className="font-medium text-base-content/85">Group ID</span>
                <input
                  className="input input-bordered w-full font-mono text-sm"
                  value={draft.groupId}
                  disabled={!isNew}
                  onChange={(event) => setField("groupId", event.target.value.toUpperCase())}
                  placeholder="LFC-2627-HOME"
                />
                {errors.groupId && <span role="alert" className="text-xs text-error">{errors.groupId}</span>}
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-base-300 bg-base-200/40 cursor-pointer hover:bg-base-200/70 transition self-end">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={draft.active}
                  onChange={(event) => setField("active", event.target.checked)}
                />
                <span className="font-medium text-sm">Active for personalization</span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <ImageUrlUploadField label="Back image URL" value={draft.backImageUrl} onChange={(value) => setField("backImageUrl", value)} onUploadingChange={setImageUploading} purpose="template-back" disabled={saving} />
                {errors.backImageUrl && <span role="alert" className="text-xs text-error">{errors.backImageUrl}</span>}
              </div>
              <BoxField label="Jersey view box" value={draft.viewBox} onChange={(value) => setBox("viewBox", value)} error={errors.viewBox} />
            </div>

            <TextStyleFields title="Name" style={draft.name} onChange={(key, value) => setNested("name", key, value)} errors={errors} />
            <TextStyleFields title="Number" style={draft.number} onChange={(key, value) => setNested("number", key, value)} errors={errors} />

            <fieldset className="rounded-2xl border border-base-300 p-5 bg-base-50/50">
              <legend className="px-2 font-semibold text-sm text-base-content">Sleeve badge geometry</legend>
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
                    value={draft.sleeveBadge[key]}
                    onChange={(value) => setNested("sleeveBadge", key, value)}
                    error={errors[`sleeveBadge.${key}`]}
                  />
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <BoxField
                  label="Sleeve zoom view box"
                  value={draft.sleeveBadge.zoomViewBox}
                  onChange={(value) => setNested("sleeveBadge", "zoomViewBox", value)}
                  error={errors["sleeveBadge.zoomViewBox"]}
                />
                <label className="flex flex-col gap-1.5 text-sm w-full">
                  <span className="font-medium text-base-content/85">Badge clip path <span className="text-xs font-normal text-base-content/50">(SVG path data)</span></span>
                  <textarea
                    className="textarea textarea-bordered font-mono text-xs w-full leading-relaxed"
                    rows={3}
                    value={draft.sleeveBadge.clipPath}
                    onChange={(event) => setNested("sleeveBadge", "clipPath", event.target.value)}
                  />
                  {errors["sleeveBadge.clipPath"] && <span role="alert" className="text-xs text-error">{errors["sleeveBadge.clipPath"]}</span>}
                </label>
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-base-300 p-5 bg-base-50/50">
              <legend className="px-2 font-semibold text-sm text-base-content">Supported sleeve badges</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BADGE_OPTIONS.map(({ id, label }) => {
                  const checked = draft.sleeveBadgeOptions.includes(id);
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${checked ? "border-primary bg-primary/5 text-primary font-medium" : "border-base-300 hover:bg-base-200/50"}`}
                    >
                      <input
                        className="checkbox checkbox-sm checkbox-primary"
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setField("sleeveBadgeOptions", event.target.checked ? [...draft.sleeveBadgeOptions, id] : draft.sleeveBadgeOptions.filter((option) => option !== id))}
                      />
                      <span className="text-xs sm:text-sm">{label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.sleeveBadgeOptions && <p role="alert" className="mt-2 text-xs text-error">{errors.sleeveBadgeOptions}</p>}
            </fieldset>

            {Object.entries(errors).some(([key]) => key.includes(".")) && (
              <p className="text-sm text-error">Review the highlighted name, number, and badge numeric fields.</p>
            )}
            {error && <p role="alert" className="alert alert-error py-3 text-sm">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-base-300 pt-5">
              {isNew && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsNew(false);
                    setDraft(copyTemplate(store.templates.find((template) => template.groupId === selectedGroupId) || store.templates[0]));
                  }}
                >
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" type="submit" disabled={saving || imageUploading}>
                {imageUploading ? "Finish image upload first" : saving ? "Saving..." : "Save template"}
              </button>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-base text-base-content">Live Preview</h2>
                <p className="text-xs text-base-content/60">Read-only template visualization</p>
              </div>
              <span className="badge badge-primary badge-outline text-xs font-mono">{previewBadge}</span>
            </div>
            <div className="rounded-xl border border-base-200 bg-[#f8f8fc] p-4 flex items-center justify-center overflow-hidden min-h-[420px]">
              <JerseyPersonalizationPreview
                template={previewTemplate}
                printEnabled
                name="YOUR NAME"
                number="00"
                sleeveBadge={previewBadge}
              />
            </div>
          </aside>
        </form>
      )}
    </>
  );
}
