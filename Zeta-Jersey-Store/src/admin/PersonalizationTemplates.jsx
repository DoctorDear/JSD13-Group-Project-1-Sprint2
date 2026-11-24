import { useState } from "react";
import JerseyPersonalizationPreview from "../components/personalization/JerseyPersonalizationPreview.jsx";
import {
  buildPersonalizationTemplatePayload,
  validatePersonalizationTemplate,
} from "../lib/forms/productForm.js";
import { adminService } from "../services/adminService.js";
import { PageHeading } from "./AdminUI";
import { ImageUrlUploadField } from "./ImageUploadField.jsx";
import {
  getTemplateProductGroups,
  getTemplateProductImages,
} from "../lib/personalization/templateProductChoices.js";
import {
  BoxField,
  SleeveBadgeFields,
  TextStyleFields,
  copyTemplate,
  numericValues,
} from "./TemplateStyleFields.jsx";

export default function PersonalizationTemplates({ store }) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [draftState, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const selectedTemplate =
    store.templates.find((template) => template.groupId === selectedGroupId) ||
    store.templates[0];
  const draft = draftState || copyTemplate(selectedTemplate);
  const productGroups = getTemplateProductGroups(store.products);
  const productImages = getTemplateProductImages(store.products, draft.groupId);
  const existingGroupTemplate =
    isNew &&
    store.templates.find(
      (template) => template.groupId === draft.groupId.trim(),
    );

  const setField = (key, value) =>
    setDraft((current) => ({
      ...(current || copyTemplate(selectedTemplate)),
      [key]: value,
    }));
  const setNested = (section, key, value) =>
    setDraft((current) => {
      const source = current || copyTemplate(selectedTemplate);
      return { ...source, [section]: { ...source[section], [key]: value } };
    });
  const setBox = (section, value) =>
    setDraft((current) => ({
      ...(current || copyTemplate(selectedTemplate)),
      [section]: value,
    }));

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
    if (existingGroupTemplate) {
      nextErrors.groupId =
        "This group already has a template. Open it to edit instead.";
    }
    setErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) return;
    const prepared = buildPersonalizationTemplatePayload(
      numericValues(draftForValidation),
    );

    setSaving(true);
    try {
      const response = isNew
        ? await adminService.createPersonalizationTemplate(prepared)
        : await adminService.updatePersonalizationTemplate(
            selectedGroupId || selectedTemplate.groupId,
            prepared,
          );
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

  const previewBadge =
    draft.sleeveBadgeOptions.find((id) => id !== "none") || "none";
  const previewTemplate = { ...draft, backImageUrl: draft.backImageUrl || "" };

  return (
    <>
      <PageHeading
        title="Personalization Templates"
        subtitle="Configure approved jersey print and sleeve badge layouts"
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={beginNew}
          disabled={imageUploading}
        >
          Create template
        </button>
      </PageHeading>
      {!store.templates.length && !isNew ? (
        <p className="rounded-xl border border-base-300 p-5 text-sm text-base-content/65">
          No personalization templates yet. Create one to make products eligible
          for personalization.
        </p>
      ) : null}
      {store.templates.length > 0 && !isNew && (
        <div className="mb-6 flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-base-300 bg-base-100 shadow-sm max-w-xl">
          <span className="text-sm font-semibold text-base-content shrink-0">
            Template group:
          </span>
          <select
            className="select select-bordered select-sm flex-1 min-w-[200px]"
            value={selectedGroupId || selectedTemplate?.groupId || ""}
            disabled={imageUploading}
            onChange={(event) => {
              const selected = store.templates.find(
                (template) => template.groupId === event.target.value,
              );
              setSelectedGroupId(event.target.value);
              setDraft(copyTemplate(selected));
              setErrors({});
              setError("");
            }}
          >
            {store.templates.map((template) => (
              <option key={template.groupId} value={template.groupId}>
                {template.groupId}
                {template.active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </div>
      )}
      {(isNew || selectedTemplate) && (
        <form
          onSubmit={save}
          className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]"
        >
          <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center pb-4 border-b border-base-200">
              <label className="flex flex-col gap-1.5 text-sm w-full">
                <span className="font-medium text-base-content/85">Group ID</span>
                {isNew && (
                  <select
                    className="select select-bordered w-full"
                    aria-label="Choose product group"
                    disabled={saving || imageUploading}
                    value={
                      productGroups.some((group) => group.id === draft.groupId)
                        ? draft.groupId
                        : ""
                    }
                    onChange={(event) => {
                      setField("groupId", event.target.value);
                      setErrors({});
                    }}
                  >
                    <option value="">
                      Choose a product group or enter an ID below
                    </option>
                    {productGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.id} · {group.names.join(" / ")}
                        {store.templates.some(
                          (template) => template.groupId === group.id,
                        )
                          ? " (template exists)"
                          : ""}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  className="input input-bordered w-full font-mono text-sm"
                  value={draft.groupId}
                  disabled={!isNew}
                  onChange={(event) =>
                    setField("groupId", event.target.value.toUpperCase())
                  }
                  placeholder="LFC-2627-HOME"
                />
                {errors.groupId && (
                  <span role="alert" className="text-xs text-error">
                    {errors.groupId}
                  </span>
                )}
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-base-300 bg-base-200/40 cursor-pointer hover:bg-base-200/70 transition self-end">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={draft.active}
                  onChange={(event) => setField("active", event.target.checked)}
                />
                <span className="font-medium text-sm">
                  Active for personalization
                </span>
              </label>
            </div>

            {existingGroupTemplate && (
              <div className="rounded-xl border border-base-300 p-3 text-sm space-y-2">
                <p>This group already has a template.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  disabled={saving || imageUploading}
                  onClick={() => {
                    setSelectedGroupId(existingGroupTemplate.groupId);
                    setDraft(copyTemplate(existingGroupTemplate));
                    setIsNew(false);
                    setErrors({});
                    setError("");
                  }}
                >
                  Open existing template
                </button>
              </div>
            )}

            <section
              className="space-y-3"
              aria-label="Choose back image from products"
            >
              <h2 className="font-medium text-sm">
                Choose back image from products
              </h2>
              <p className="text-xs text-base-content/65">
                Select the back view from this group's product images to preview
                it in the template.
              </p>
              {productImages.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {productImages.map(({ url, productName, isBack }, index) => (
                    <button
                      key={url}
                      type="button"
                      aria-label={`Use image ${index + 1} from ${productName}`}
                      aria-pressed={draft.backImageUrl === url}
                      disabled={saving || imageUploading}
                      onClick={() => setField("backImageUrl", url)}
                      className={`rounded-xl border-2 p-2 text-left space-y-1 disabled:opacity-50 ${
                        draft.backImageUrl === url
                          ? "border-primary bg-primary/5"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${productName}${isBack ? " back view" : ` image ${index + 1}`}`}
                        loading="lazy"
                        className="h-28 w-full object-contain rounded-lg bg-base-200"
                      />
                      <span
                        className="block text-xs truncate"
                        title={productName}
                      >
                        {productName}
                      </span>
                      <span className="block text-xs font-medium">
                        {draft.backImageUrl === url
                          ? "Selected"
                          : isBack
                            ? "Product back image"
                            : "Use this image"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-base-content/60">
                  {draft.groupId
                    ? "No product images for this group. Enter a URL or upload an image below."
                    : "Choose a product group to see its images."}
                </p>
              )}
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <ImageUrlUploadField
                  label="Back image URL"
                  value={draft.backImageUrl}
                  onChange={(value) => setField("backImageUrl", value)}
                  onUploadingChange={setImageUploading}
                  purpose="template-back"
                  disabled={saving}
                />
                {errors.backImageUrl && (
                  <span role="alert" className="text-xs text-error">
                    {errors.backImageUrl}
                  </span>
                )}
              </div>
              <BoxField
                label="Jersey view box"
                value={draft.viewBox}
                onChange={(value) => setBox("viewBox", value)}
                error={errors.viewBox}
              />
            </div>

            <TextStyleFields
              title="Name"
              style={draft.name}
              onChange={(key, value) => setNested("name", key, value)}
              errors={errors}
            />
            <TextStyleFields
              title="Number"
              style={draft.number}
              onChange={(key, value) => setNested("number", key, value)}
              errors={errors}
            />
            <SleeveBadgeFields
              sleeveBadge={draft.sleeveBadge}
              sleeveBadgeOptions={draft.sleeveBadgeOptions}
              onChangeGeometry={(key, value) =>
                setNested("sleeveBadge", key, value)
              }
              onChangeOptions={(value) => setField("sleeveBadgeOptions", value)}
              errors={errors}
            />

            {Object.entries(errors).some(([key]) => key.includes(".")) && (
              <p className="text-sm text-error">
                Review the highlighted name, number, and badge numeric fields.
              </p>
            )}
            {error && (
              <p role="alert" className="alert alert-error py-3 text-sm">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-base-300 pt-5">
              {isNew && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsNew(false);
                    setDraft(
                      copyTemplate(
                        store.templates.find(
                          (template) => template.groupId === selectedGroupId,
                        ) || store.templates[0],
                      ),
                    );
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving || imageUploading}
              >
                {imageUploading
                  ? "Finish image upload first"
                  : saving
                    ? "Saving..."
                    : "Save template"}
              </button>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-base text-base-content">
                  Live Preview
                </h2>
                <p className="text-xs text-base-content/60">
                  Read-only template visualization
                </p>
              </div>
              <span className="badge badge-primary badge-outline text-xs font-mono">
                {previewBadge}
              </span>
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
