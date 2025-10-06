import SharedStatus from "./SharedStatus";
import SharedOnBreak from "./SharedOnBreak";
import SharedOnLunch from "./SharedOnLunch";
import SharedBioBreak from "./SharedBioBreak";
import SharedMeeting from "./SharedMeeting";
import { useStore } from "../../store/useStore";

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
      return <SharedStatus />;
    case MONITORING_PAGES.ONBREAK:
      return <SharedOnBreak />;
    case MONITORING_PAGES.ONLUNCH:
      return <SharedOnLunch />;
    case MONITORING_PAGES.BIOBREAK:
      return <SharedBioBreak />;
    case MONITORING_PAGES.MEETING:
      return <SharedMeeting />;
    default:
      return <SharedStatus />;
  }
};

export default SharedMonitoring;
