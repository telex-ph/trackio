import { useParams } from "react-router-dom";
import {
  formatDate,
  toDateTimeFromTimeString,
} from "../../utils/formatDateTime";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios";
import SCHEDULE from "../../constants/schedule";
import Spinner from "../../assets/loaders/Spinner";
import { useStore } from "../../store/useStore";

const ScheduleModal = ({ onClose, fetchSchedules, operation }) => {
  const { id } = useParams();
  const selectedDates = useStore((state) => state.selectedDates);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(SCHEDULE.WORK_DAY);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [mealStart, setMealStart] = useState("");
  const [mealEnd, setMealEnd] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedShiftStart = toDateTimeFromTimeString(shiftStart);
    const formattedShiftEnd = toDateTimeFromTimeString(shiftEnd);
    const formattedMealStart = toDateTimeFromTimeString(mealStart);
    const formattedMealEnd = toDateTimeFromTimeString(mealEnd);

    if (type === SCHEDULE.WORK_DAY) {
      console.log(`${typeof shiftEnd} : ${typeof shiftStart}`);
      if (formattedShiftEnd <= formattedShiftStart) {
        toast.error("End time must be after start time.");
        return;
      }

      if (formattedMealEnd <= formattedMealStart) {
        toast.error("End time must be after start time.");
        return;
      }

      if (
        formattedMealStart < formattedShiftStart ||
        formattedMealEnd > formattedShiftEnd
      ) {
        toast.error("Meal time must within the shift hour.");
        return;
      }
    }

    if (!selectedDates?.length) {
      toast.error("No dates selected.");
      return;
    }

    const schedules = selectedDates.map((date) => ({
      date,
      shiftStart: formattedShiftStart,
      shiftEnd: formattedShiftEnd,
      mealStart: formattedMealStart,
      mealEnd: formattedMealEnd,
      notes: notes || null,
    }));

    try {
      setLoading(true);
      await api.post("/schedule/upsert-schedules", {
        schedules,
        id,
        type,
      });
      toast.success("Schedules have been saved successfully.");
      fetchSchedules();
      onClose();
    } catch (error) {
      toast.error("Something went wrong. Please notify the Tech Team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-scroll flex items-center justify-center bg-black/30">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white rounded-md p-6 max-w-2xl w-full"
      >
        <section>
          {operation === "upsert" ? (
            <h2 className="text-xl font-bold">Upsert Schedule/s</h2>
          ) : (
            <h2 className="text-xl font-bold">Delete Schedule</h2>
          )}
        </section>

        {/* Selected Dates */}
        <section>
          <p className="font-medium mb-1">Date/s</p>
          {selectedDates?.length > 0 ? (
            <div className="grid grid-cols-3 px-6">
              {selectedDates.map((date, index) => (
                <li key={index} className="text-sm text-light mb-4">
                  {formatDate(date)}
                </li>
              ))}
            </div>
          ) : (
            <p className="text-red-500 text-sm">No dates selected</p>
          )}
        </section>

        {/* Attendance Type */}
        <section>
          <label
            htmlFor="attendanceType"
            className="block text-sm font-medium mb-1"
          >
            Attendance Type
          </label>
          <select
            id="attendanceType"
            name="attendanceType"
            className="block w-full rounded-lg border-light p-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value={SCHEDULE.WORK_DAY}>Workday</option>
            <option value={SCHEDULE.REST_DAY}>Rest Day</option>
            <option value={SCHEDULE.HOLIDAY}>Holiday</option>
          </select>
        </section>

        {/* Shift Hours */}
        {type === SCHEDULE.WORK_DAY && (
          <section>
            <label
              htmlFor="shiftHour"
              className="block text-sm font-medium mb-1"
            >
              Working Hours
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                required
                className="flex-1 border-light rounded-md p-2"
              />
              <span>To</span>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                required
                className="flex-1 border-light rounded-md p-2"
              />
            </div>
          </section>
        )}

        {/* Meal Break */}
        {type === SCHEDULE.WORK_DAY && (
          <section>
            <label
              htmlFor="mealBreak"
              className="block text-sm font-medium mb-1"
            >
              Meal Break (optional)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="time"
                value={mealStart}
                onChange={(e) => setMealStart(e.target.value)}
                className="flex-1 border-light rounded-md p-2"
              />
              <span>To</span>
              <input
                type="time"
                value={mealEnd}
                onChange={(e) => setMealEnd(e.target.value)}
                className="flex-1 border-light rounded-md p-2"
              />
            </div>
          </section>
        )}

        {/* Notes */}
        <section>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border-light rounded-md w-full p-2"
          ></textarea>
        </section>

        {/* Buttons */}
        {loading ? (
          <Spinner size={30} />
        ) : (
          <section className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md border-light cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2 rounded-md bg-blue-700 text-white cursor-pointer"
              disabled={!selectedDates?.length}
            >
              Save
            </button>
          </section>
        )}
      </form>
    </div>
  );
};

export default ScheduleModal;
