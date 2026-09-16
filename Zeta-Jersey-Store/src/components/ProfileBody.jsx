import { useState } from "react";
import ProfileProductSection from "./ProfileProductSection.jsx";
import ProfileCategories from "./ProfileCategories.jsx";
import ProfileHero from "./ProfileHero.jsx";
import ReviewsAndStats from "./ReviewsAndStats.jsx";
import Sidebar from "./Sidebar.jsx";
import EditProfilePage from "./EditProfilePage.jsx";

function ProfileBody() {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [activeProductTab, setActiveProductTab] = useState("Best Sellers");
  const [likedProducts, setLikedProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

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
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setActiveMenu("My Account");
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSave = (formData) => {
    // TODO: เชื่อมกับ API หรือ state management ในอนาคต
    console.log("Saved profile:", formData);
    setIsEditing(false);
  };

  const renderContent = () => {
    // ถ้ากำลัง edit profile ให้แสดงฟอร์มแทน
    if (isEditing) {
      return (
        <EditProfilePage onCancel={handleEditCancel} onSave={handleEditSave} />
      );
    }

    switch (activeMenu) {
      case "Home":
        return (
          <>
            <ProfileHero onEditClick={handleEditClick} />
            <ProfileCategories />
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
            <ProfileHero onEditClick={handleEditClick} />
            <ProfileCategories />
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
      <div className="mx-auto flex max-w-7xl">
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
