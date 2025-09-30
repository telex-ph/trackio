import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import AddScheduleModal from "../../components/modals/AddScheduleModal";
import { useEffect } from "react";
import api from "../../utils/axios";
import { formatDate } from "../../utils/formatDateTime";

const OMViewSchedule = () => {
  const { id } = useParams();
  const [schedules, setSchedules] = useState(null);
  const [selectedDates, setSelectedDates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleAddClick = (selectedDates) => {
    setSelectedDates(selectedDates);
    setIsOpenModal(true);
  };

  const handleModalClose = () => {
    setIsOpenModal(false);
    fetchSchedules();
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedule/get-schedules/${id}`);

      const formattedSchedules = response.data.map((schedule) => {
        return {
          date: formatDate(schedule?.date),
          shiftStart: schedule?.shiftStart,
          shiftEnd: schedule?.shiftEnd,
          mealStart: schedule?.mealStart,
          mealEnd: schedule?.mealEnd,
          type: schedule?.type,
        };
      });

      setSchedules(formattedSchedules);
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
          addBtnOnClick={handleAddClick}
          schedules={schedules || []}
          loading={loading}
        />
      </section>

      {isOpenModal && (
        <AddScheduleModal
          dates={selectedDates}
          onClose={handleModalClose}
          fetchSchedules={fetchSchedules}
        />
      )}
    </div>
  );
};

export default OMViewSchedule;
