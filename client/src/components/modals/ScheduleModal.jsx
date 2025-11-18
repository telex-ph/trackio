import { useParams } from "react-router-dom";
import {
  formatDate,
  toDateTimeFromTimeString,
} from "../../utils/formatDateTime";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios";
import SCHEDULE from "../../constants/schedule";
import Spinner from "../../assets/loaders/Spinner";
import { useStore } from "../../store/useStore";
import WarningDeletion from "../../assets/illustrations/WarningDeletion";

const ScheduleModal = ({ onClose, fetchSchedules, operation }) => {
  const { id } = useParams();
  const user = useStore((state) => state.user);

  const selectedDates = useStore((state) => state.selectedDates);

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(SCHEDULE.WORK_DAY);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [mealStart, setMealStart] = useState("");
  const [mealEnd, setMealEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [isNightShift, setIsNightShift] = useState(false);

  useEffect(() => {
    if (!shiftStart || !shiftEnd) return;

    const start = toDateTimeFromTimeString(shiftStart);
    const end = toDateTimeFromTimeString(shiftEnd);

    if (end <= start) {
      setIsNightShift(true);
    } else {
      setIsNightShift(false);
    }
  }, [shiftStart, shiftEnd]);

  const handleUpsert = async () => {
    const formattedShiftStart = toDateTimeFromTimeString(shiftStart);
    let formattedShiftEnd = toDateTimeFromTimeString(shiftEnd);
    let formattedMealStart = toDateTimeFromTimeString(mealStart);
    let formattedMealEnd = toDateTimeFromTimeString(mealEnd);

    // Adjust times for night shift
    if (isNightShift) {
      formattedShiftEnd = formattedShiftEnd.plus({ days: 1 });

      if (formattedMealStart < formattedShiftStart) {
        formattedMealStart = formattedMealStart.plus({ days: 1 });
      }
      if (formattedMealEnd < formattedShiftStart) {
        formattedMealEnd = formattedMealEnd.plus({ days: 1 });
      }
    }

    // ---- VALIDATION ----
    if (type === SCHEDULE.WORK_DAY) {
      if (formattedMealEnd <= formattedMealStart) {
        toast.error("Meal end time must be after meal start time.");
        return;
      }

      if (
        formattedMealStart < formattedShiftStart ||
        formattedMealEnd > formattedShiftEnd
      ) {
        toast.error("Meal time must be within the shift hours.");
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
        updatedBy: user._id,
      });
      toast.success("Schedules have been saved successfully.");
      if (fetchSchedules) {
        fetchSchedules();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please notify the Tech Team.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete("/schedule/delete-schedules", {
        data: { shiftSchedules: selectedDates, userId: id },
      });

      const deletedCount = response.data.deletedCount;
      toast.success(
        `${deletedCount} shift schedule${
          deletedCount !== 1 ? "s" : ""
        } deleted successfully`
      );
      if (fetchSchedules) {
        fetchSchedules();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please notify the Tech Team");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    operation === "upsert" ? handleUpsert() : handleDelete();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-scroll flex items-center justify-center bg-black/30">
      <section className="flex flex-col gap-3 bg-white rounded-md p-6 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          {operation === "upsert" ? (
            <>
              <h2 className="text-xl font-bold">Upsert Schedule(s)</h2>
              <div className="text-xl font-bold">
                {isNightShift && type === SCHEDULE.WORK_DAY && "🌙 Night Shift"}
              </div>
            </>
          ) : (
            <h2 className="text-xl font-bold">Delete Schedule(s)</h2>
          )}
        </div>

        <div>
          <p className="font-medium mb-1">Date(s)</p>
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
        </div>

        <form onSubmit={handleSubmit}>
          {operation === "delete" ? (
            <div className="">
              <WarningDeletion />
            </div>
          ) : (
            <main>
              {/* Attendance Type */}
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

              {/* Shift Hours */}
              {type === SCHEDULE.WORK_DAY && (
                <div>
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
                </div>
              )}

              {/* Meal Break */}
              {type === SCHEDULE.WORK_DAY && (
                <div>
                  <label
                    htmlFor="mealBreak"
                    className="block text-sm font-medium mb-1"
                  >
                    Meal Break
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="time"
                      value={mealStart}
                      onChange={(e) => setMealStart(e.target.value)}
                      className="flex-1 border-light rounded-md p-2"
                      required
                    />
                    <span>To</span>
                    <input
                      type="time"
                      value={mealEnd}
                      onChange={(e) => setMealEnd(e.target.value)}
                      className="flex-1 border-light rounded-md p-2"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium mb-1"
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-light rounded-md w-full p-2"
                ></textarea>
              </div>
            </main>
          )}

          {/* Buttons */}
          {loading ? (
            <Spinner size={30} />
          ) : (
            <div className="flex justify-end gap-3 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-md border-light cursor-pointer"
              >
                Cancel
              </button>

              {operation === "upsert" ? (
                <button
                  type="submit"
                  className="px-7 py-2 rounded-md bg-blue-700 text-white cursor-pointer"
                  disabled={!selectedDates?.length}
                >
                  Upsert
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-7 py-2 rounded-md bg-red-600 text-white cursor-pointer"
                  disabled={!selectedDates?.length}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  );
};

export default ScheduleModal;
