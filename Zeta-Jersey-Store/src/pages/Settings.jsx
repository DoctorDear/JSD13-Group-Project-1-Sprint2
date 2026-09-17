import PageHeader from "../components/PageHeader";

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your preferences." />
      <div className="max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <p className="text-gray-600">Settings options will go here.</p>
      </div>
    </>
  );
}