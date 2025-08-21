import React, { useState } from "react";
import { Button } from "flowbite-react";
import { getMicrosoftUser, microsoftLogin } from "../auth/authService";
import api from "../utils/axios";

const Login = () => {
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
    // TODO: check tenantId, disallow users that is not part of the organization (telex, callnovo)
    const loginResponse = await api.post("/auth/login", user);
    console.log(loginResponse);
  };

  return (
    <div>
      <Button onClick={handleLoginClick}>Login</Button>
    </div>
  );
};

export default Login;
