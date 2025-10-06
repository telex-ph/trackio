import TRACKING_PAGES from "../../constants/trackingSubPages";
import SharedTimeIn from "./SharedTimeIn";
import SharedTimeOut from "./SharedTimeOut";
import SharedLate from "./SharedLate";
import SharedUndertime from "./SharedUndertime";
import SharedAbsentees from "./SharedAbsentees";
import { useStore } from "../../store/useStore";

const SharedTrackingLists = () => {
  const trackPage = useStore((state) => state.trackPage);

  switch (trackPage) {
    case TRACKING_PAGES.TIMEIN:
      return <SharedTimeIn />;
    case TRACKING_PAGES.TIMEOUT:
      return <SharedTimeOut />;
    case TRACKING_PAGES.LATE:
      return <SharedLate />;
    case TRACKING_PAGES.UNDERTIME:
      return <SharedUndertime />;
    case TRACKING_PAGES.ABSENTEES:
      return <SharedAbsentees />;
    default:
      return <SharedTimeIn />;
  }
};

export default SharedTrackingLists;
