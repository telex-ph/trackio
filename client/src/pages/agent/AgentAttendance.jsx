import React from "react";

const AgentAttendance = () => {
  return (
    <div>
      <section className="flex gap-5">
        <section className="flex items-center flex-1 p-5 container-light border-light rounded-md">
          <div className="flex-1">
            <h1>WORKING HOURS COUNTER</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 [&>*]:text-center">
            <span>
              <h1 className="bg-white border-light rounded-md">01</h1>
              <span>Hours</span>
            </span>
            <span>
              <h1 className="bg-white border-light rounded-md">28</h1>
              <span>Minutes</span>
            </span>
            <span>
              <h1 className="bg-white border-light rounded-md">42</h1>
              <span>Seconds</span>
            </span>
          </div>
        </section>
        <section className="flex items-center flex-1 p-5 container-light border-light rounded-md">
          <div className="flex-1">
            <h1>SERVER TIME</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 [&>*]:text-center">
            <span>
              <h1 className="bg-white border-light rounded-md">01</h1>
              <span>Hours</span>
            </span>
            <span>
              <h1 className="bg-white border-light rounded-md">28</h1>
              <span>Minutes</span>
            </span>
            <span>
              <h1 className="bg-white border-light rounded-md">42</h1>
              <span>Seconds</span>
            </span>
          </div>
        </section>
      </section>
    </div>
  );
};

export default AgentAttendance;
