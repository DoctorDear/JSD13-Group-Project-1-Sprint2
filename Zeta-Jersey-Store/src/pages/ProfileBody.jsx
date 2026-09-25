import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userService } from "../services/user.js";
import { buildProfileUpdate, toProfileView } from "../lib/profileForm.js";
import ProfileProductSection from "../components/ProfilePages/ProfileProductSection.jsx";
import ProfileCategories from "../components/ProfilePages/ProfileCategories.jsx";
import ProfileHero from "../components/ProfilePages/ProfileHero.jsx";
import MyReviews from "../components/ProfilePages/MyReviews.jsx";
import Sidebar from "../components/ProfilePages/Sidebar.jsx";
import EditProfilePage from "../components/ProfilePages/EditProfilePage.jsx";
import ProfileDetailsPage from "../components/ProfilePages/ProfileDetailsPage.jsx";
import Navbar from "../components/Navbar.jsx";
import OrderHistory from "../components/ProfilePages/OrderHistory.jsx";
import WishlistSection from "../components/ProfilePages/WishlistSection.jsx";

function ProfileBody() {
  const { setUser: setAuthUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState("Home");
  const tab = searchParams.get("tab");
  const activeMenu = tab === "reviews" ? "My Reviews" : tab === "orders" ? "My Orders" : tab === "favorites" ? "Favorites" : selectedMenu;
  const [activeProductTab, setActiveProductTab] = useState("Best Sellers");
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    userService
      .getProfile({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setUser(toProfileView(data.user));
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const handleMenuChange = (menu) => {
    if (menu === "My Reviews") setSearchParams({ tab: "reviews" }, { replace: true });
    else if (menu === "My Orders") setSearchParams({ tab: "orders" }, { replace: true });
    else if (menu === "Favorites") setSearchParams({ tab: "favorites" }, { replace: true });
    else {
      setSelectedMenu(menu);
      setSearchParams({}, { replace: true });
    }
    setIsEditing(false);
    setIsViewingDetails(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsViewingDetails(false);
    setSelectedMenu("My Account");
    setSearchParams({}, { replace: true });
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSave = async (formData) => {
    const data = await userService.updateProfile(buildProfileUpdate(formData));
    const updatedUser = data.user;

    setUser(toProfileView(updatedUser));
    setAuthUser(updatedUser);
    setIsEditing(false);
  };

  const handleRetry = () => {
    setUser(null);
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  const handleViewAllClick = () => {
    setIsViewingDetails(true);
    setIsEditing(false);
  };

  const handleBackFromDetails = () => {
    setIsViewingDetails(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate("/auth/login", { replace: true });
    }
  };

  const renderContent = () => {
    if (activeMenu === "My Orders") return <OrderHistory />;
    if (activeMenu === "My Reviews") return <MyReviews />;
    if (activeMenu === "Favorites") return <WishlistSection />;

    if (loadError) {
      return (
        <div role="alert" className="rounded-xl bg-white p-8 text-sm text-red-700">
          <p>Could not load your profile: {loadError}</p>
          <button type="button" className="mt-4 font-semibold underline" onClick={handleRetry}>Retry</button>
        </div>
      );
    }
    if (!user) {
      return <div role="status" className="p-8 text-sm text-zeta-muted">Loading profile...</div>;
    }

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

      case "Payment":
        return (
          <div className="flex flex-col items-center justify-center px-2 py-16 text-center sm:py-20">
            <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-zeta-sub-lighter text-zeta-sub-dark sm:size-20">
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <p className="text-base font-black sm:text-lg">Payment Methods</p>
            <p className="mt-2 max-w-full text-sm text-zeta-muted">ยังไม่มีข้อมูลการชำระเงิน</p>
            <button className="btn mt-6 min-h-11 rounded-md border-0 bg-zeta-main px-6 text-white shadow-none hover:opacity-90 sm:px-8">
              Add Payment Method
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar page="profile" />
      <main className="min-h-screen w-full overflow-x-hidden bg-[#f5f7f2] text-[#18251e]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:flex-row lg:gap-8">
          <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} onSignOut={handleSignOut} />
          <section className="min-w-0 flex-1">
            <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-0 lg:py-9">
              {renderContent()}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default ProfileBody;
