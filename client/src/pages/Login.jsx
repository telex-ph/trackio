import React, { useState } from "react";
import { Button } from "flowbite-react";
import {
  checkRole,
  getProfile,
  getProfilePicture,
  microsoftLogin,
} from "../auth/AuthService";

const Login = () => {
  const [profileUrl, setProfileUrl] = useState();

  const handleLoginClick = async () => {
    const response = await microsoftLogin();

    console.log(response.accessToken);
    const user = await getProfile(response.accessToken);
    const url = await getProfilePicture(response.accessToken);

    setProfileUrl(url);
  };

  return (
    <div>
      <Button onClick={handleLoginClick}>Login</Button>

      <img src={profileUrl} />
    </div>
  );
};

export default Login;
