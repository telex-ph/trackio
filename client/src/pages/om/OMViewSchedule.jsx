import React from "react";
import { useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";

const OMViewSchedule = () => {
  const { id } = useParams();
  return (
    <div>
      <p>{id}</p>
      <section>
        <Calendar />
      </section>
    </div>
  );
};

export default OMViewSchedule;
