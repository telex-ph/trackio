import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Checkbox, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

import {
  checkRole,
  getMicrosoftUser,
  microsoftLogin,
} from "../auth/authService";
import api from "../utils/axios";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import microsoftLogo from "../assets/logos/microsoft.svg";
import telexLogo from "../assets/logos/telex.png";
import ellipse from "../assets/shapes/ellipse.svg";

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [error, setError] = useState({
    message: "",
    hasError: false,
  });

  const handleLoginClick = async (e) => {
    e.preventDefault();

    try {
      const user = await api.post("/auth/log-in", data);
      if (user) {
        const loginResponse = await api.post("/auth/create-token", user);
        if (loginResponse.status === 200) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setError({
        message: error.response?.data
          ? "Oops! We couldn't log you in. Please check your email and password."
          : error.message,
        hasError: true,
      });
      setData({ email: "", password: "" });
      console.error("Error: ", error);
    }
  };

  const handleMicrosoftClick = async () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setError({ hasError: false, message: "" });

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEyeClick = () => {
    setIsShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const response = await api.get("/auth/status");
      if (response.data.isValid) {
        navigate("/dashboard");
      }
    };
    fetchUser();
  }, []);

  return (
    <section className="flex h-screen">
      <div className="flex-1 flex gap-10 flex-col justify-start p-8 lg:p-24">
        <div className="flex flex-col gap-2">
          <img src={telexLogo} alt="Telex PH" className="size-20 z-10" />
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-light">
            All fields are required. Make sure your details are correct.
          </p>
        </div>

        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={handleLoginClick}
        >
          {error.hasError && (
            <Alert color="failure" icon={HiInformationCircle}>
              {/* <span className="font-medium">Info alert!</span> Change a few
              things up and try submitting again. */}
              <span>{error.message}</span>
            </Alert>
          )}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" className="text-light">
                Email
              </Label>
            </div>
            <TextInput
              id="email"
              type="email"
              name="email"
              placeholder="harrypotter@telexph.com"
              required
              onChange={handleInputChange}
              value={data.email}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" className="text-light">
                Password
              </Label>
            </div>
            <div className="flex items-stretch gap-2">
              <TextInput
                id="password"
                name="password"
                onChange={handleInputChange}
                type={isShowPassword ? "text" : "password"}
                required
                className="flex-1"
                value={data.password}
              />
              <div className="flex items-center justify-center p-2 border border-light container-light rounded-lg cursor-pointer">
                {isShowPassword ? (
                  <RemoveRedEyeIcon
                    className="text-light"
                    onClick={handleEyeClick}
                  />
                ) : (
                  <VisibilityOffIcon
                    className="text-light"
                    onClick={handleEyeClick}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-light">
                Remember me
              </Label>
            </div>
            <p className="underline text-sm">Forgot Password?</p>
          </div>
          <Button type="submit" className="bg-[#470905] hover:bg-[#470905]">
            Log In
          </Button>
        </form>
        <hr className="text-gray-300" />
        <Button
          type="button"
          className="flex items-center justify-center border border-light container-light rounded-md w-full gap-2 p-2"
          onClick={handleMicrosoftClick}
        >
          <img src={microsoftLogo} className="size-7" alt="Microsoft" />
          <span className="text-sm text-light ">Continue with Microsoft</span>
        </Button>
      </div>
      <div className="flex-1 hidden lg:flex justify-center gap-2 items-center flex-col bg-[#470905] relative rounded-l-lg p-24 overflow-hidden">
        <img src={ellipse} className="absolute -top-64 -right-65" />
        <div className="z-10">
          <img src={telexLogo} alt="Telex PH" className="w-full h-full" />
        </div>

        <p className="text-2xl text-white text-center">
          Business Support Services Inc.
        </p>
      </div>
    </section>
  );
};

export default Login;
