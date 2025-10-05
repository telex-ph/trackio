import { useStore } from "../../store/useStore";
import AdminTimeIn from "../admin/AdminTimeIn";
import AdminTimeOut from "../admin/AdminTimeOut";
import AdminLate from "../admin/AdminLate";
import AdminUndertime from "../admin/AdminUndertime";
import AdminAbsentees from "../admin/AdminAbsentees";
import TRACKING_PAGES from "../../constants/trackingSubPages";

const SharedTrackingLists = () => {
  const page = useStore((state) => state.page);

  switch (page) {
    case TRACKING_PAGES.TIMEIN:
      return <AdminTimeIn />;
    case TRACKING_PAGES.TIMEOUT:
      return <AdminTimeOut />;
    case TRACKING_PAGES.LATE:
      return <AdminLate />;
    case TRACKING_PAGES.UNDERTIME:
      return <AdminUndertime />;
    case TRACKING_PAGES.ABSENTEES:
      return <AdminAbsentees />;
    default:
      return <AdminTimeIn />;
  }
};

export default SharedTrackingLists;
