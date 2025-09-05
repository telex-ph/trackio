import telex from "../assets/logos/telex.svg";
import trackio from "../assets/logos/trackio.svg";
import { Button } from "flowbite-react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Menu } from "lucide-react";

const Topbar = ({ toggleSidebar, isCollapsed }) => {
  const navigator = useNavigate();
  const user = useStore((state) => state.user);

  const handleLogoutBtn = async () => {
    const response = await api.get("/auth/delete-token");
    const isLoggedOut = response.data.isLoggedOut;

    if (isLoggedOut) {
      navigator("/login");
    }
  };

  return (
    <nav className="flex h-full justify-between items-center p-5 bg-[#571A1A] text-white">
      {/* Left Section: Logo + Hamburger */}
      <div className="flex items-center">
        <img src={trackio} alt="TRACKIO" className="w-45 h-auto" />
        <button onClick={toggleSidebar} className="p-2 ml-6">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Right Section: TELEX Info + Logout */}
      <div className="flex items-center gap-2">
        <img src={telex} alt="TELEX" className="w-12 h-auto" />
        <div className="flex flex-col">
          <span className="font-bold">TELEX</span>
          <span className="text-sm">Employee Account</span>
        </div>
        <Button
          onClick={handleLogoutBtn}
          className="ml-4 bg-white text-[#571A1A] hover:bg-gray-200"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Topbar;
