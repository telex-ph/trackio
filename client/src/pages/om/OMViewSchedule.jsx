import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import ScheduleModal from "../../components/modals/ScheduleModal";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";
import { DateTime } from "luxon";

const OMViewSchedule = () => {
  const { id } = useParams();
  const setShiftSchedule = useStore((state) => state.setShiftSchedule);
  const shiftSchedule = useStore((state) => state.shiftSchedule);
  const currentDate = useStore((state) => state.currentDate);

  const [operation, setOperation] = useState("upsert");
  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleBtnsClick = (operation) => {
    setOperation(operation);
    setIsOpenModal(true);
  };

  const handleModalClose = () => {
    setIsOpenModal(false);
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedule/get-schedules/${id}`, {
        params: {
          currentMonth: currentDate.month,
          currentYear: currentDate.year,
        },
      });

      setShiftSchedule(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [id, currentDate.month, currentDate.year]);

  return (
    <div>
      {shiftSchedule.map((sch) => {
        const formatted = DateTime.fromISO(sch.date)
          .setZone("Asia/Manila")
          .toFormat("yyyy-MM-dd");
        return <div key={sch._id}>{formatted}</div>;
      })}
      <section>
        <Calendar
          fetchSchedules={fetchSchedules}
          handleBtnsClick={handleBtnsClick}
          loading={loading}
        />
      </section>

      {isOpenModal && (
        <ScheduleModal
          onClose={handleModalClose}
          fetchSchedules={fetchSchedules}
          operation={operation}
        />
      )}
    </div>
  );
};

export default OMViewSchedule;
