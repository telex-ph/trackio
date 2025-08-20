import { Button } from "flowbite-react";
import axios from "axios";

const Dashboard = () => {
  const testBackend = async () => {
    const response = await axios.get("http://localhost:3000/test");
    console.log(response.data);
  };

  return (
    <div>
      <Button onClick={testBackend}>Dashboard</Button>
    </div>
  );
};

export default Dashboard;
