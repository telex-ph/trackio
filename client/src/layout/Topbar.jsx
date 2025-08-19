import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import telex from "../assets/logos/telex.svg";
import peeply from "../assets/logos/peeply.svg";
const Topbar = () => {
  return (
    <nav className="flex h-full justify-between items-center p-5">
      <div className="flex gap-5 items-center">
        <ViewSidebarOutlinedIcon fontSize="small" />
        <img src={peeply} />
      </div>
      <div>
        <img src={telex} />
      </div>
    </nav>
  );
};

export default Topbar;
