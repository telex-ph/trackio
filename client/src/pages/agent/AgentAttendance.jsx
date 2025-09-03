import React, { useState } from "react";
import { Button } from "flowbite-react";
import { Square } from "lucide-react";
import { useEffect } from "react";
import Table from "../../components/Table";
import ServerTime from "../../components/ServerTime";

const AgentAttendance = () => {
  return (
    <div>
      <section className="flex gap-5">
        <section className="flex items-center gap-5 flex-1 p-5 container-light border-light rounded-md">
          <div className="flex-1">
            <h1>WORKING HOURS COUNTER</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 [&>*]:text-center">
            <span>
              <h1 className="bg-white border-light text-light rounded-md">
                01
              </h1>
              <span className="text-light">Hours</span>
            </span>
            <span>
              <h1 className="bg-white border-light text-light rounded-md">
                28
              </h1>
              <span className="text-light">Minutes</span>
            </span>
            <span>
              <h1 className="bg-white border-light text-light rounded-md">
                42
              </h1>
              <span className="text-light">Seconds</span>
            </span>
          </div>
        </section>
        <ServerTime />
      </section>
      <section className="grid grid-cols-5 gap-4 pt-5">
        <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
          <span>Time In</span>
          <Button className="bg-[#C2E6E1] text-[#00B69B] hover:bg-[#00B69B] hover:text-white font-bold">
            Start of Shift
          </Button>
          <span className="text-light">Time Recorded:</span>
        </div>
        <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
          <span>1st Break</span>
          <div className="flex gap-3">
            <Button className="flex-1 bg-[#F5E3C6] text-[#B48B47] hover:bg-[#B48B47] hover:text-white font-bold">
              Start
            </Button>
            <Button className="bg-red-500 hover:bg-red-700 p-2">
              <Square />
            </Button>
          </div>
          <span className="text-light">Time Recorded:</span>
        </div>
        <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
          <span>Lunch</span>
          <div className="flex gap-3">
            <Button className="flex-1 bg-[#D1C2F4] text-[#4B00FC] hover:bg-[#4B00FC] hover:text-white font-bold">
              Start
            </Button>
            <Button className="bg-red-500 hover:bg-red-700 p-2">
              <Square />
            </Button>
          </div>
          <span className="text-light">Time Recorded:</span>
        </div>
        <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
          <span>2nd Break</span>
          <div className="flex gap-3">
            <Button className=" flex-1 bg-[#F5E3C6] text-[#B48B47] hover:bg-[#B48B47] hover:text-white font-bold">
              Start
            </Button>
            <Button className="bg-red-500 hover:bg-red-700 p-2">
              <Square />
            </Button>
          </div>
          <span className="text-light">Time Recorded:</span>
        </div>
        <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
          <span>Time Out</span>
          <Button className="bg-[#F5CDCD] text-[#FF3838] hover:bg-[#FF3838] hover:text-white font-bold">
            End of Shift
          </Button>
          <span className="text-light">Time Recorded:</span>
        </div>
      </section>
    </div>
  );
};

export default AgentAttendance;
