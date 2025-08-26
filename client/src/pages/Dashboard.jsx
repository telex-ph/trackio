import { Button } from "flowbite-react";
import api from "../utils/axios";

const Dashboard = () => {
  const getAccounts = async () => {
    const data = await api.get("/accounts/get-accounts");
    console.log(data);
  };

  return (
    <div>
      <Button onClick={getAccounts}>Dashboard</Button>
    </div>
  );
};

export default Dashboard;
