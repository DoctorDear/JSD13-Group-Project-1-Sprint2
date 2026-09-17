import { useState } from "react";
import ProfileProductSection from "../components/ProfileProductSection.jsx";
import ProfileCategories from "../components/ProfileCategories.jsx";
import ProfileHero from "../components/ProfileHero.jsx";
import ReviewsAndStats from "../components/ReviewsAndStats.jsx";
import Sidebar from "../components/Sidebar.jsx";
import EditProfilePage from "../components/EditProfilePage.jsx";
import ProfileDetailsPage from "../components/ProfileDetailsPage.jsx";

function ProfileBody() {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [activeProductTab, setActiveProductTab] = useState("Best Sellers");
  const [likedProducts, setLikedProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [user, setUser] = useState({
    name: "Somchai K.",
    email: "somchai@example.com",
    phone: "0812345678",
    address: "Bangkok, Thailand",
  });

  const toggleLike = (index) => {
    setLikedProducts((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    setIsEditing(false);
    setIsViewingDetails(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsViewingDetails(false);
    setActiveMenu("My Account");
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSave = (formData) => {
    setUser(formData);
    setIsEditing(false);
  };

  const handleViewAllClick = () => {
    setIsViewingDetails(true);
    setIsEditing(false);
  };

  const handleBackFromDetails = () => {
    setIsViewingDetails(false);
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <EditProfilePage
          initialData={user}
          onCancel={handleEditCancel}
          onSave={handleEditSave}
        />
      );
    }

    if (isViewingDetails) {
      return (
        <ProfileDetailsPage
          user={user}
          onBack={handleBackFromDetails}
          onEditClick={handleEditClick}
        />
      );
    }

    switch (activeMenu) {
      case "Home":
        return (
          <>
            <ProfileHero user={user} onEditClick={handleEditClick} />
            <ProfileCategories user={user} onViewAll={handleViewAllClick} />
            <ProfileProductSection
              activeProductTab={activeProductTab}
              onProductTabChange={setActiveProductTab}
              likedProducts={likedProducts}
              onToggleLike={toggleLike}
            />
          </>
        );

      case "My Account":
        return (
          <>
            <ProfileHero user={user} onEditClick={handleEditClick} />
            <ProfileCategories user={user} onViewAll={handleViewAllClick} />
          </>
        );

      case "Favorites":
        return (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold tracking-widest text-[#8a948c]">FAVORITES</p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">My Favorites</h1>
            </div>
            <ProfileProductSection
              activeProductTab={activeProductTab}
              onProductTabChange={setActiveProductTab}
              likedProducts={likedProducts}
              onToggleLike={toggleLike}
            />
          </>
        );

      case "My Reviews":
        return (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold tracking-widest text-[#8a948c]">MY REVIEWS</p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">Reviews & Stats</h1>
            </div>
            <ReviewsAndStats />
          </>
        );

      case "Payment":
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 grid size-20 place-items-center rounded-2xl bg-zeta-sub-lighter text-zeta-sub-dark">
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <p className="text-lg font-black">Payment Methods</p>
            <p className="mt-2 text-sm text-zeta-muted">ยังไม่มีข้อมูลการชำระเงิน</p>
            <button className="btn mt-6 rounded-md border-0 bg-zeta-main px-8 text-white shadow-none hover:opacity-90">
              Add Payment Method
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] text-[#18251e]">
      <div className="mx-auto flex flex-col lg:flex-row max-w-7xl">
        <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
        <section className="min-w-0 flex-1">
          <div className="px-5 py-6 sm:px-10 sm:py-9">
            {renderContent()}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProfileBody;