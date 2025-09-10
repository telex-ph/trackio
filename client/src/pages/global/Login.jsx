import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Checkbox, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

import {
  checkRole,
  getMicrosoftUser,
  microsoftLogin,
} from "../../auth/authService";
import api from "../../utils/axios";
import { Eye, EyeClosed } from "lucide-react";
import microsoftLogo from "../../assets/logos/microsoft.svg";
import telexLogo from "../../assets/logos/telex.png";
import ellipse from "../../assets/shapes/ellipse.svg";
import telexvid from "../../assets/video/telexvid.mp4";

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [error, setError] = useState({ message: "", hasError: false });
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Right side animation state
  const [showVideo, setShowVideo] = useState(false);

  // Splash screen (1.5s)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Toggle logo -> video -> logo
  useEffect(() => {
    let logoTimer;

    if (!showVideo) {
      // Stay logo for 6s then switch to video
      logoTimer = setTimeout(() => {
        setShowVideo(true);
      }, 6000);
    }

    return () => clearTimeout(logoTimer);
  }, [showVideo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError({ hasError: false, message: "" });
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEyeClick = () => setIsShowPassword((prev) => !prev);

  const handleLoginClick = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/log-in", data);
      const user = response.data;
      if (user) {
        const loginResponse = await api.post("/auth/create-token", user);
        if (loginResponse.status === 200) {
          navigate(`/${user.role}/dashboard`);
        }
      }
    } catch (error) {
      setError({
        message: error.response?.data
          ? "Oops! We couldn't log you in. Please check your email and password."
          : error.message,
        hasError: true,
      });
      console.error("Error: ", error);
    }
  };

  // TODO: remove this since in microsoft azure, we cannot get thier shifts
  const handleMicrosoftClick = async () => {
    const microsoftResponse = await microsoftLogin();
    const microsoftUser = await getMicrosoftUser(microsoftResponse.accessToken);

    const user = {
      id: microsoftUser.id,
      email: microsoftUser.mail,
      firstName: microsoftUser.givenName,
      lastName: microsoftUser.surname,
      jobTitle: microsoftUser.jobTitle,
    };

    const loginResponse = await api.post("/auth/create-token", user);
    const role = await checkRole(user.id, microsoftResponse.accessToken);
    console.log("role: ", role);

    if (loginResponse.status === 200) navigate("/dashboard");
  };

  // Check auth status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/status");
        const user = response.data.user;
        const isValid = response.data.isValid;
        if (isValid && user) navigate(`/${user.role}/dashboard`);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen splash-bg">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <img
            src={telexLogo}
            alt="Telex PH"
            className="w-72 h-72 md:w-80 md:h-80 animate-bounceShadow"
          />
          <div className="translate-x-4 md:translate-x-2">
            <p className="text-white text-2xl md:text-4xl font-semibold animate-pulse">
              Business Support Services Inc.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <p>Checking authentication...</p>;

  return (
    <section className="flex h-screen">
      {/* Left Side */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 gap-10">
        <div className="flex flex-col gap-2">
          <img src={telexLogo} alt="Telex PH" className="size-20 z-10" />
          <h1 className="font-bold">Login</h1>
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
              <span>{error.message}</span>
            </Alert>
          )}

          <div>
            <Label htmlFor="email" className="text-light mb-2 block">
              Email
            </Label>
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
            <Label htmlFor="password" className="text-light mb-2 block">
              Password
            </Label>
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
                  <Eye className="text-light" onClick={handleEyeClick} />
                ) : (
                  <EyeClosed className="text-light" onClick={handleEyeClick} />
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
            <p
              className="underline text-sm cursor-pointer text-light"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </p>
          </div>

          <Button type="submit" className="bg-[#470905] hover:bg-[#470905]">
            Log In
          </Button>
        </form>

        {/* OR separator */}
        <div className="relative flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="absolute px-2 text-gray-500 bg-white left-1/2 -translate-x-1/2">
            OR
          </span>
        </div>

        {/* Microsoft login */}
        <Button
          type="button"
          className="flex items-center justify-center border border-light container-light rounded-md w-full gap-2 p-2"
          onClick={handleMicrosoftClick}
        >
          <img src={microsoftLogo} className="size-7" alt="Microsoft" />
          <span className="text-sm text-light ">Continue with Microsoft</span>
        </Button>
      </div>

      {/* Right Side */}
      <div className="flex-1 hidden lg:flex justify-center items-center flex-col bg-[#470905] relative rounded-l-lg p-24 overflow-hidden border border-[#582e2b]/40">
        <img
          src={ellipse}
          className="absolute -top-64 -right-65"
          alt="Background Shape"
        />

        {/* Logo + Title */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-6 transition-all duration-1500 ease-in-out ${
            showVideo ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={telexLogo}
            alt="Telex PH"
            className="w-3/4 h-3/4 object-contain"
          />
          <p className="text-4xl md:text-5xl text-white text-center font-semibold">
            Business Support Services Inc.
          </p>
        </div>

        {/* Video (play once, then back to logo) */}
        {showVideo && (
          <video
            src={telexvid}
            autoPlay
            muted
            className={`absolute inset-0 w-full h-full object-cover rounded-l-lg transition-all duration-1500 ease-in-out ${
              showVideo ? "opacity-100" : "opacity-0"
            }`}
            onEnded={() => setShowVideo(false)}
          />
        )}
      </div>
    </section>
  );
};

export default Login;
