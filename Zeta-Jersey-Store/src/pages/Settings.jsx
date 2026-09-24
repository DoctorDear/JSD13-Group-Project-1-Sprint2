import PageHeader from "../components/PageHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar page="settings" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title="Settings" subtitle="Manage your preferences." />
        <div className="max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <p className="text-gray-600">Settings options will go here.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
