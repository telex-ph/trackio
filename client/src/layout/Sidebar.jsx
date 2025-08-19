import { Link } from "react-router-dom";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

export const Sidebar = () => {
  return (
    <aside className="h-full p-4 space-y-4">
      <div className="flex gap-2">
        <AccountCircleOutlinedIcon />
        <p>Jeffrey Rosal</p>
      </div>
      <nav className="flex flex-col gap-2">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tracking">Tracking</Link>
      </nav>
    </aside>
  );
};
