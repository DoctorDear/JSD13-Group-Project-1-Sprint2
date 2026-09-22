import { useState } from "react";
import {
  Building2,
  DollarSign,
  Bell,
  Shield,
  Save,
  ChevronRight,
} from "lucide-react";
import { PageHeading, Field, Modal } from "./AdminUI";

const sectionClass =
  "rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6";
const SectionTitle = ({ children, Icon, tone }) => (
  <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold">
    <span
      className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
    >
      <Icon size={18} />
    </span>
    {children}
  </h2>
);

export default function Settings({ store }) {
  const [security, setSecurity] = useState(null);
  async function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const settings = Object.fromEntries(form);
    for (const key of ["company", "email", "phone", "address", "city"])
      settings[key] = settings[key].trim();
    if (!settings.company) {
      e.currentTarget.elements.company.setCustomValidity(
        "Enter a company name.",
      );
      e.currentTarget.reportValidity();
      return;
    }
    for (const key of ["emails", "lowStock", "reminders"])
      settings[key] = form.has(key);
    settings.tax = Number(settings.tax);
    await store.update({ settings }, "Settings saved on this device.");
  }
  return (
    <>
      <PageHeading
        title="Settings"
        subtitle="Manage your system preferences and configuration"
      />
      <form className="flex flex-col gap-4" onSubmit={save}>
        <section className={sectionClass}>
          <SectionTitle Icon={Building2} tone="bg-primary/10 text-primary">
            Company Information
          </SectionTitle>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              className="md:col-span-2"
              label="Company Name"
              name="company"
              required
              defaultValue={store.settings.company}
              onInput={(e) => e.target.setCustomValidity("")}
            />
            <Field
              label="Email"
              type="email"
              name="email"
              required
              defaultValue={store.settings.email}
            />
            <Field
              label="Phone"
              type="tel"
              name="phone"
              defaultValue={store.settings.phone}
            />
            <Field
              className="md:col-span-2"
              label="Address"
              name="address"
              defaultValue={store.settings.address}
            />
            <Field
              label="City"
              name="city"
              defaultValue={store.settings.city}
            />
          </div>
        </section>
        <section className={sectionClass}>
          <SectionTitle Icon={DollarSign} tone="bg-success/15 text-success">
            Financial Settings
          </SectionTitle>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Currency">
              <select name="currency" defaultValue={store.settings.currency}>
                {["USD", "THB", "EUR", "GBP"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Default Tax Rate (%)"
              name="tax"
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              defaultValue={store.settings.tax}
            />
          </div>
          <p className="mt-4 text-sm text-base-content/55">
            Currency changes display formatting only; amounts are not converted.
          </p>
        </section>
        <section className={sectionClass}>
          <SectionTitle Icon={Bell} tone="bg-info/15 text-info">
            Notifications
          </SectionTitle>
          {[
            [
              "emails",
              "Email Notifications",
              "Receive email updates about system activities",
            ],
            [
              "lowStock",
              "Low Stock Alerts",
              "Get notified when products are running low",
            ],
            [
              "reminders",
              "Invoice Reminders",
              "Send reminders for unpaid invoices",
            ],
          ].map(([key, label, description]) => (
            <label
              className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-base-200 p-4"
              key={key}
            >
              <span>
                <strong className="block text-sm">{label}</strong>
                <small className="mt-1 block text-xs text-base-content/55">
                  {description}
                </small>
              </span>
              <input
                className="toggle toggle-primary"
                type="checkbox"
                name={key}
                defaultChecked={store.settings[key]}
                aria-label={label}
              />
            </label>
          ))}
          <p className="mt-4 text-sm text-base-content/55">
            Preferences are saved on this device. Email delivery is not
            configured in this frontend demo.
          </p>
        </section>
        <section className={sectionClass}>
          <SectionTitle Icon={Shield} tone="bg-error/10 text-error">
            Security
          </SectionTitle>
          {[
            ["Change Password", "Update your account password"],
            ["Two-Factor Authentication", "Add an extra layer of security"],
            ["Session Management", "View and manage active sessions"],
          ].map(([title, subtitle]) => (
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-between gap-4 rounded-xl bg-base-200 p-4 text-left transition hover:bg-base-300"
              key={title}
              onClick={() => setSecurity(title)}
            >
              <span>
                <strong className="block text-sm">{title}</strong>
                <small className="mt-1 block text-xs text-base-content/55">
                  {subtitle}
                </small>
              </span>
              <ChevronRight
                size={18}
                className="shrink-0 text-base-content/45"
              />
            </button>
          ))}
        </section>
        <div className="flex justify-end">
          <button className="btn btn-primary">
            <Save size={17} />
            Save Settings
          </button>
        </div>
      </form>
      {security && (
        <Modal
          error={store.saveError}
          title={security}
          onClose={() => setSecurity(null)}
        >
          <p> {security} is not available in this frontend demo yet.</p>
          <p className="mt-3 text-sm text-base-content/55">
            No security changes have been made.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              className="btn btn-primary"
              onClick={() => setSecurity(null)}
            >
              Got it
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
