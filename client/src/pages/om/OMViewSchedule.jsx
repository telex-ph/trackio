import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import { Plus, X } from "lucide-react";
import AddScheduleModal from "../../components/modals/AddScheduleModal";
import { useEffect } from "react";
import api from "../../utils/axios";
import { dateFormatter, formatDate } from "../../utils/formatDateTime";

const OMViewSchedule = () => {
  const { id } = useParams();
  const [schedules, setSchedules] = useState(null);
  const [selectedDates, setSelectedDates] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleAddClick = (selectedDates) => {
    setSelectedDates(selectedDates);
    setIsOpenModal(true);
  };

  const handleModalClose = () => {
    setIsOpenModal(false);
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
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
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div>
      <p>{id}</p>
      <section>
        <Calendar addBtnOnClick={handleAddClick} schedules={schedules || []} />
      </section>

      {isOpenModal && (
        <AddScheduleModal dates={selectedDates} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default OMViewSchedule;
