import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import { CircleUserRound, ChevronRight } from "lucide-react";
import ScheduleModal from "../../components/modals/ScheduleModal";
import api from "../../utils/axios";
import { useSchedule } from "../../hooks/useSchedule";
import Spinner from "../../assets/loaders/Spinner";

const SharedViewSchedule = ({ role, readOnly }) => {
  const { id } = useParams();
  const { loading: scheduleLoading } = useSchedule({ id });
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [operation, setOperation] = useState("upsert");
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleBtnsClick = (operation) => {
    setOperation(operation);
    setIsOpenModal(true);
  };

  const handleModalClose = () => {
    setIsOpenModal(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        const response = await api.get(`/user/get-user/${id}`);
        const user = response.data;
        setUser(user);
      } catch (error) {
        console.error(error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <div>
      <section className="basis-2/5 mb-4">
        <div className="flex items-center gap-1">
          <Link>
            <h2>Schedule</h2>
          </Link>
          <ChevronRight className="w-6 h-6" />
          <h2>View</h2>
        </div>
        <p className="text-light">
          Centralized schedule management for employees.
        </p>
      </section>
      <section className="container-light border-light p-3 rounded-md mb-4">
        {userLoading ? (
          <Spinner />
        ) : (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CircleUserRound className="w-6 h-6" />
              <h3 className="text-black">
                {user.firstName} {user.lastName}
              </h3>
            </div>
            <div>
              <div className="text-light">{user._id}</div>
              <div>
                Employee ID:{" "}
                <span className="text-light"> {user.employeeId}</span>
              </div>
              <div>
                Role: <span className="text-light">{user.role}</span>
              </div>
              <div>
                Email: <span className="text-light">{user.email}</span>
              </div>
              {/* <div>Group: {user.group}</div> */}
            </div>
          </section>
        )}
        <></>
      </section>
      <section>
        <Calendar
          handleBtnsClick={handleBtnsClick}
          loading={scheduleLoading}
          readOnly={readOnly}
        />
      </section>

      {isOpenModal && (
        <ScheduleModal onClose={handleModalClose} operation={operation} />
      )}
    </div>
  );
};

export default SharedViewSchedule;
