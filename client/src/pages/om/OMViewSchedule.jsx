import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import ScheduleModal from "../../components/modals/ScheduleModal";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";

const OMViewSchedule = () => {
  const { id } = useParams();
  const setShiftSchedule = useStore((state) => state.setShiftSchedule);

  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleUpsertClick = () => {
    setIsOpenModal(true);
  };

  const handleModalClose = () => {
    setIsOpenModal(false);
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedule/get-schedules/${id}`);
      setShiftSchedule(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [id]);

  return (
    <div>
      <section>
        <Calendar
          fetchSchedules={fetchSchedules}
          handleUpsertClick={handleUpsertClick}
          loading={loading}
        />
      </section>

      {isOpenModal && (
        <ScheduleModal
          onClose={handleModalClose}
          fetchSchedules={fetchSchedules}
          operation={"upsert"}
        />
      )}
    </div>
  );
};

export default OMViewSchedule;
