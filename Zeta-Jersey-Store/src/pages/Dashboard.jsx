import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";

const STATS = [
  { label: "Active orders", value: "3" },
  { label: "Jerseys owned", value: "12" },
  { label: "Loyalty points", value: "480" },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""} 👋`}
        subtitle="Here's what's happening with your account today."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-medium text-gray-500">{s.label}</p>
            <p className="mt-2 text-4xl font-extrabold text-indigo-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Recent activity</h2>
        <p className="mt-2 text-gray-600">Nothing new yet — your latest orders will appear here.</p>
      </div>
    </>
  );
}