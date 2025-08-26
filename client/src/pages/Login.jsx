import React, { useState } from "react";
import { Button } from "flowbite-react";
import {
  checkRole,
  getMicrosoftUser,
  microsoftLogin,
} from "../auth/authService";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLoginClick = async () => {
    // Calling Microsoft Authentication page
    const microsoftResponse = await microsoftLogin();

    // Fetching user information from his/her Microsoft account
    const microsoftUser = await getMicrosoftUser(microsoftResponse.accessToken);

    const user = {
      id: microsoftUser.id,
      email: microsoftUser.mail,
      firstName: microsoftUser.givenName,
      lastName: microsoftUser.surname,
      jobTitle: microsoftUser.jobTitle,
    };
    // TODO: check tenantId, disallow users that is not part o the organization (telex, callnovo)
    // TODO: improve this later
    const loginResponse = await api.post("/auth/create-token", user);
    // console.log(loginResponse);

    const role = await checkRole(user.id, microsoftResponse.accessToken);

    console.log("role: ", role);

    if (loginResponse.status === 200) {
      navigate("/dashboard");
    }
  };

  return (
    <div>
      <Button onClick={handleLoginClick}>Login</Button>
    </div>
  );
};

export default Login;
