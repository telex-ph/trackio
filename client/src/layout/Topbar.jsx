import telex from "../assets/logos/telex.svg";
import { Button } from "flowbite-react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigator = useNavigate();

  const handleLogoutBtn = async () => {
    const response = await api.get("/auth/delete-token");
    const isLoggedOut = response.data.isLoggedOut;

    if (isLoggedOut) {
      navigator("/login");
    }
  };

  return (
    <nav className="flex h-full justify-end items-center p-5">
      <div className="flex gap-3">
        <img src={telex} />
        <Button onClick={handleLogoutBtn}>Logout</Button>
      </div>
    </nav>
  );
};

export default Topbar;
