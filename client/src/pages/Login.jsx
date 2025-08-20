import React from "react";
import { Button } from "flowbite-react";
import { getProfile, microsoftLogin } from "../auth/AuthService";

const Login = () => {
  const handleLoginClick = async () => {
    const response = await microsoftLogin();

    console.log(response.accessToken);
    await getProfile(response.accessToken);
  };

  return (
    <div>
      <Button onClick={handleLoginClick}>Login</Button>
    </div>
  );
};

export default Login;
