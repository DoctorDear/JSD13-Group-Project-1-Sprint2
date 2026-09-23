import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";

export default function Profile() {
  const { user } = useAuth();

  const rows = [
    ["First name", user?.firstName],
    ["Last name", user?.lastName],
    ["Email", user?.email],
  ];

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details." />

      <div className="max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="lg" />
          <div>
            <p className="text-xl font-bold text-gray-900">
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account"}
            </p>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-8 divide-y divide-gray-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-3">
              <dt className="text-sm font-medium text-gray-500">{label}</dt>
              <dd className="text-sm text-gray-900">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}