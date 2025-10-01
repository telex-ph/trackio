import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import AddScheduleModal from "../../components/modals/AddScheduleModal";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";

const OMViewSchedule = () => {
  const { id } = useParams();
  const setShiftSchedule = useStore((state) => state.setShiftSchedule);

  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleAddClick = () => {
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
          handleAddClick={handleAddClick}
          loading={loading}
        />
      </section>

      {isOpenModal && (
        <AddScheduleModal
          onClose={handleModalClose}
          fetchSchedules={fetchSchedules}
        />
      )}
    </div>
  );
};

export default OMViewSchedule;
