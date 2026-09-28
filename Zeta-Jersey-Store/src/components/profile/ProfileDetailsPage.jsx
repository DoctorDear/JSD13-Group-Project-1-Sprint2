import { ArrowLeft, House, UserRound } from "lucide-react";

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-zeta-muted">{label}</dt>
      <dd className="mt-1 font-bold text-[#18251e]">{value || "—"}</dd>
    </div>
  );
}

function ProfileDetailsPage({ user, onBack, onEditClick }) {
  const address = user.defaultAddress;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-zeta-main">
          <ArrowLeft size={18} /> Back to Profile
        </button>
        <button type="button" onClick={onEditClick} className="btn rounded-md border-0 bg-zeta-main px-6 text-white">Edit Information</button>
      </div>
      <div className="rounded-2xl border border-zeta-main-lighter bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-black">{user.name || "Account"}</h1>
        <p className="mt-1 text-sm text-zeta-muted">{user.email}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-zeta-main-lighter bg-white p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-black"><UserRound size={20} /> Personal Information</h2>
          <dl className="space-y-4 text-sm">
            <Detail label="First name" value={user.firstName} />
            <Detail label="Last name" value={user.lastName} />
            <Detail label="Email" value={user.email} />
            <Detail label="Phone" value={user.phone} />
          </dl>
        </section>
        <section className="rounded-2xl border border-zeta-main-lighter bg-white p-6">
          <h2 className="mb-5 flex items-center gap-2 text-base font-black"><House size={20} /> Default Shipping Address</h2>
          {address ? (
            <dl className="space-y-4 text-sm">
              <Detail label="Recipient" value={address.recipientName} />
              <Detail label="Contact phone" value={address.phone} />
              <Detail label="Address line" value={address.addressLine} />
              <Detail label="Province" value={address.province} />
              {address.district && <Detail label="District" value={address.district} />}
              {address.subdistrict && <Detail label="Sub-district" value={address.subdistrict} />}
              <Detail label="Postal code" value={address.postalCode} />
            </dl>
          ) : <p className="text-sm text-zeta-muted">No address saved yet.</p>}
        </section>
      </div>
    </div>
  );
}

export default ProfileDetailsPage;
