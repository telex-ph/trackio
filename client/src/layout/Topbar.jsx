import telex from "../assets/logos/telex.svg";
import { Button } from "flowbite-react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import trackio from "../assets/logos/trackio.svg";
import { SquareArrowLeft } from "lucide-react";
import { useStore } from "../store/useStore";

const Topbar = () => {
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
    <nav className="flex h-full justify-between items-center p-5 bg-[#571A1A]">
      <div className="flex items-center justify-center gap-2 relative">
        <img src={trackio} alt="Eye" className="w-48 h-auto" />
        {/* <img src={peeply} alt="Peeply" className="w-28 h-auto" /> */}
        {/* <SquareArrowLeft size={22} className="text-[#6B7280] cursor-pointer" /> */}
      </div>
      <div className="flex  text-white">
        <img src={telex} className="w-14 h-auto" />
        <div className="flex flex-col">
          <span className="font-bold">TELEX</span>
          <span>
            {user.role
              ? user.role
                  .split(/[\s-]/)
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : ""}
          </span>
        </div>
        <Button onClick={handleLogoutBtn}>Logout</Button>
      </div>
    </nav>
  );
};

export default Topbar;
