import { useState } from "react";
import JerseyPersonalizationPreview from "../components/JerseyPersonalizationPreview.jsx";
import { validatePersonalizationTemplate } from "../lib/productForm.js";
import { adminService } from "../services/adminService.js";
import { PageHeading } from "./AdminUI";

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

function NumericField({ label, value, onChange, step = "any" }) {
  return (
    <label className="form-control gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input className="input input-bordered input-sm w-full" type="number" step={step} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function BoxField({ label, value, onChange }) {
  return (
    <label className="form-control gap-1 text-sm">
      <span className="font-medium">{label} (x, y, width, height)</span>
      <input className="input input-bordered input-sm w-full" value={Array.isArray(value) ? value.join(", ") : ""} onChange={(event) => onChange(event.target.value.split(",").map((part) => part.trim()))} />
    </label>
  );
}

function TextStyleFields({ title, style, onChange }) {
  return (
    <fieldset className="rounded-xl border border-base-300 p-4">
      <legend className="px-1 font-semibold">{title} styling</legend>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[["x", "X position"], ["y", "Y position"], ["fontSize", "Font size"], ["fontWeight", "Font weight"], ["letterSpacing", "Letter spacing"], ["strokeWidth", "Outline width"]].map(([key, label]) => (
          <NumericField key={key} label={label} value={style[key]} onChange={(value) => onChange(key, value)} />
        ))}
        <label className="form-control gap-1 text-sm">
          <span className="font-medium">Approved font</span>
          <select className="select select-bordered select-sm" value={style.fontId} onChange={(event) => onChange("fontId", event.target.value)}>
            <option value="barlow-condensed-900">Barlow Condensed 900</option>
          </select>
        </label>
        <label className="form-control gap-1 text-sm"><span className="font-medium">Fill color</span><input className="input input-bordered input-sm" value={style.fill} onChange={(event) => onChange("fill", event.target.value)} /></label>
        <label className="form-control gap-1 text-sm"><span className="font-medium">Outline color</span><input className="input input-bordered input-sm" value={style.stroke} onChange={(event) => onChange("stroke", event.target.value)} /></label>
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
    const prepared = numericValues(draftForValidation);

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
        <button type="button" className="btn btn-primary" onClick={beginNew}>Create template</button>
      </PageHeading>
      {!store.templates.length && !isNew ? (
        <p className="rounded-xl border border-base-300 p-5 text-sm text-base-content/65">No personalization templates yet. Create one to make products eligible for personalization.</p>
      ) : null}
      {store.templates.length > 0 && !isNew && (
        <label className="mb-5 flex max-w-lg flex-col gap-2 text-sm font-medium">
          Template group
              <select className="select select-bordered" value={selectedGroupId || selectedTemplate?.groupId || ""} onChange={(event) => { const selected = store.templates.find((template) => template.groupId === event.target.value); setSelectedGroupId(event.target.value); setDraft(copyTemplate(selected)); setErrors({}); setError(""); }}>
            {store.templates.map((template) => <option key={template.groupId} value={template.groupId}>{template.groupId}{template.active ? "" : " (inactive)"}</option>)}
          </select>
        </label>
      )}
      {(isNew || selectedTemplate) && (
        <form onSubmit={save} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
          <div className="space-y-5 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control gap-1 text-sm"><span className="font-medium">Group ID</span><input className="input input-bordered" value={draft.groupId} disabled={!isNew} onChange={(event) => setField("groupId", event.target.value.toUpperCase())} placeholder="LFC-2627-HOME" />{errors.groupId && <span role="alert" className="text-error">{errors.groupId}</span>}</label>
              <label className="flex items-center gap-3 self-end pb-3 text-sm"><input type="checkbox" className="checkbox checkbox-primary" checked={draft.active} onChange={(event) => setField("active", event.target.checked)} />Active for product personalization</label>
            </div>
            <label className="form-control gap-1 text-sm"><span className="font-medium">Back image URL</span><input className="input input-bordered" value={draft.backImageUrl} onChange={(event) => setField("backImageUrl", event.target.value)} placeholder="https://... or /images/..." />{errors.backImageUrl && <span role="alert" className="text-error">{errors.backImageUrl}</span>}</label>
            <BoxField label="Jersey view box" value={draft.viewBox} onChange={(value) => setBox("viewBox", value)} />
            {errors.viewBox && <p role="alert" className="text-sm text-error">{errors.viewBox}</p>}
            <TextStyleFields title="Name" style={draft.name} onChange={(key, value) => setNested("name", key, value)} />
            <TextStyleFields title="Number" style={draft.number} onChange={(key, value) => setNested("number", key, value)} />
            <fieldset className="rounded-xl border border-base-300 p-4">
              <legend className="px-1 font-semibold">Sleeve badge geometry</legend>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {[["x", "X position"], ["y", "Y position"], ["rotate", "Rotation"], ["skewY", "Vertical skew"], ["scaleX", "Horizontal scale"], ["scaleY", "Vertical scale"]].map(([key, label]) => <NumericField key={key} label={label} value={draft.sleeveBadge[key]} onChange={(value) => setNested("sleeveBadge", key, value)} />)}
              </div>
              <div className="mt-4 space-y-3">
                <BoxField label="Sleeve zoom view box" value={draft.sleeveBadge.zoomViewBox} onChange={(value) => setNested("sleeveBadge", "zoomViewBox", value)} />
                {errors["sleeveBadge.zoomViewBox"] && <p role="alert" className="text-sm text-error">{errors["sleeveBadge.zoomViewBox"]}</p>}
                <label className="form-control gap-1 text-sm"><span className="font-medium">Badge clip path</span><textarea className="textarea textarea-bordered font-mono" rows={3} value={draft.sleeveBadge.clipPath} onChange={(event) => setNested("sleeveBadge", "clipPath", event.target.value)} /></label>
              </div>
            </fieldset>
            <fieldset className="rounded-xl border border-base-300 p-4">
              <legend className="px-1 font-semibold">Supported sleeve badges</legend>
              <div className="flex flex-wrap gap-4">{BADGE_OPTIONS.map(({ id, label }) => <label className="flex items-center gap-2 text-sm" key={id}><input className="checkbox checkbox-sm checkbox-primary" type="checkbox" checked={draft.sleeveBadgeOptions.includes(id)} onChange={(event) => setField("sleeveBadgeOptions", event.target.checked ? [...draft.sleeveBadgeOptions, id] : draft.sleeveBadgeOptions.filter((option) => option !== id))} />{label}</label>)}</div>
              {errors.sleeveBadgeOptions && <p role="alert" className="mt-2 text-sm text-error">{errors.sleeveBadgeOptions}</p>}
            </fieldset>
            {Object.entries(errors).some(([key]) => key.includes(".")) && <p className="text-sm text-error">Review the highlighted name, number, and badge numeric fields.</p>}
            {error && <p role="alert" className="alert alert-error py-3">{error}</p>}
            <div className="flex justify-end gap-3 border-t border-base-300 pt-4">
              {isNew && <button type="button" className="btn btn-ghost" onClick={() => { setIsNew(false); setDraft(copyTemplate(store.templates.find((template) => template.groupId === selectedGroupId) || store.templates[0])); }}>Cancel</button>}
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save template"}</button>
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-base-300 bg-base-200 p-5">
            <h2 className="mb-3 font-semibold">Read-only preview</h2>
            <JerseyPersonalizationPreview template={previewTemplate} printEnabled name="YOUR NAME" number="00" sleeveBadge={previewBadge} />
          </aside>
        </form>
      )}
    </>
  );
}
