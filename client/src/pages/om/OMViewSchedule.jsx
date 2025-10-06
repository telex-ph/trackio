import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import ScheduleModal from "../../components/modals/ScheduleModal";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";
import { useSchedule } from "../../hooks/useSchedule";

const OMViewSchedule = () => {
  const { id } = useParams();
  const { fetchSchedules, loading: scheduleLoading } = useSchedule({ id });
  const [operation, setOperation] = useState("upsert");
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleBtnsClick = (operation) => {
    setOperation(operation);
    setIsOpenModal(true);
  };

  const handleModalClose = () => {
    setIsOpenModal(false);
  };

  return (
    <div>
      <section>
        <Calendar handleBtnsClick={handleBtnsClick} loading={scheduleLoading} />
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
