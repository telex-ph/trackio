import { useState, useEffect } from "react";
import ServerTime from "../../components/ServerTime";
import WorkingTime from "../../components/WorkingTime";
import TimeBox from "../../components/TimeBox";
import { useStore } from "../../store/useStore";
import api from "../../utils/axios";
import { DateTime } from "luxon";

const AgentAttendance = () => {
  const user = useStore((state) => state.user);
  const [attendance, setAttendance] = useState();
  const [loading, setLoading] = useState(true);

  const addAttendance = async (userId) => {
    try {
      const result = await api.post(`/attendance/add-attendance/${userId}`);
      console.log(result.data);
      await fetchAttendance();
    } catch (error) {
      // TODO: show eror modal or some sort of that
      console.log(`Error updating ${error}: `, error);
    }
  };

  const updateAttendance = async (field) => {
    // Get the current time in UTC since Mongodb accepts UTC format
    // Using the attendance._id;
    const now = DateTime.utc().toJSDate();
    const data = {
      id: attendance._id,
      fields: {
        [field]: now,
      },
    };
    try {
      await api.patch("/attendance/update-attendance", data);
      await fetchAttendance();
    } catch (error) {
      // TODO: show eror modal or some sort of that
      console.log(`Error updating ${field}: `, error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/get-attendance/${user._id}`);
      const attendance = response.data;
      console.log(attendance[0]);

      setAttendance(attendance[0]);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <section className="flex gap-5">
        <WorkingTime timeIn={attendance?.timeIn} />
        <ServerTime />
      </section>
      <section className="grid grid-cols-5 gap-4 pt-5">
        <TimeBox
          isTwoBtn={false}
          title={"Time In"}
          startTime={attendance?.timeIn}
          fieldOne={"timeIn"}
          bgColor={"C2E6E1"}
          textColor={"00B69B"}
          btnClick={() => addAttendance(user._id)}
        />
        <TimeBox
          isTwoBtn={true}
          title={"1st Break"}
          startTime={attendance?.firstBreakStart}
          endTime={attendance?.firstBreakEnd}
          fieldOne={"firstBreakStart"}
          fieldTwo={"firstBreakEnd"}
          bgColor={"F5E3C6"}
          textColor={"B48B47"}
          btnClick={updateAttendance}
        />
        <TimeBox
          isTwoBtn={true}
          title={"Lunch"}
          startTime={attendance?.lunchStart}
          endTime={attendance?.lunchEnd}
          fieldOne={"lunchStart"}
          fieldTwo={"lunchEnd"}
          bgColor={"D1C2F4"}
          textColor={"4B00FC"}
          btnClick={updateAttendance}
        />
        <TimeBox
          isTwoBtn={true}
          title={"2nd Break"}
          startTime={attendance?.secondBreakStart}
          endTime={attendance?.secondBreakEnd}
          fieldOne={"secondBreakStart"}
          fieldTwo={"secondBreakEnd"}
          bgColor={"F5E3C6"}
          textColor={"B48B47"}
          btnClick={updateAttendance}
        />
        <TimeBox
          isTwoBtn={false}
          title={"Time Out"}
          startTime={attendance?.timeOut}
          fieldOne={"timeOut"}
          bgColor={"F5CDCD"}
          textColor={"FF3838"}
          btnClick={updateAttendance}
        />
      </section>
    </div>
  );
};

export default AgentAttendance;
