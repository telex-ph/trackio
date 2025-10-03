import { useStore } from "../../store/useStore";
import AdminStatus from "../admin/AdminStatus";
import AdminOnBreak from "../admin/AdminOnBreak";
import AdminOnLunch from "../admin/AdminOnLunch";
import AdminBioBreak from "../admin/AdminBioBreak";
import AdminMeeting from "../admin/AdminMeeting";

const MONITORING_PAGES = {
  STATUS: "status",
  ONBREAK: "on-break",
  ONLUNCH: "on-lunch",
  BIOBREAK: "biobreak",
  MEETING: "meeting",
};

const SharedMonitoring = () => {
  const monitorPage = useStore((state) => state.monitorPage);

  switch (monitorPage) {
    case MONITORING_PAGES.STATUS:
      return <AdminStatus />;
    case MONITORING_PAGES.ONBREAK:
      return <AdminOnBreak />;
    case MONITORING_PAGES.ONLUNCH:
      return <AdminOnLunch />;
    case MONITORING_PAGES.BIOBREAK:
      return <AdminBioBreak />;
    case MONITORING_PAGES.MEETING:
      return <AdminMeeting />;
    default:
      return <AdminStatus />;
  }
};

export default SharedMonitoring;
