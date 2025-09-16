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
  const [loginAttempts, setLoginAttempts] = useState(0);

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
      console.log("Attempting login...");
      setLoginAttempts(prev => prev + 1);
      
      const response = await api.post("/auth/log-in", data);
      const responseData = response.data;

      console.log("Login response:", responseData);

      if (responseData.user) {
        console.log("Login successful, user data:", responseData.user);
        
        // For iOS devices with JWT tokens
        if (responseData.authMethod === "jwt" && responseData.tokens) {
          console.log("Storing JWT tokens for iOS device");
          localStorage.setItem('accessToken', responseData.tokens.accessToken);
          localStorage.setItem('refreshToken', responseData.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(responseData.user));
          
          // Use React Router for iOS instead of window.location.href
          console.log("iOS: Using React Router navigation");
          setTimeout(() => {
            navigate(`/${responseData.user.role}/dashboard`, { 
              replace: true,
              state: { fromLogin: true }
            });
          }, 200);
          return;
        }
        
        // For non-iOS devices
        setTimeout(() => {
          console.log("Redirecting to dashboard...");
          navigate(`/${responseData.user.role}/dashboard`, { replace: true });
        }, 100);
        
        return;
      }
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        attempt: loginAttempts
      });
      
      setError({
        message: error.response?.data?.error
          ? "Oops! We couldn't log you in. Please check your email and password."
          : error.message,
        hasError: true,
      });
    }
  };

  const handleMicrosoftClick = async () => {
    try {
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
      console.log("Microsoft login role: ", role);

      if (loginResponse.status === 200) {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Microsoft login error:", error);
      setError({
        message: "Microsoft login failed. Please try again.",
        hasError: true,
      });
    }
  };

  // Check auth status with better error handling
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Checking authentication status...");
        
        // For iOS devices, check localStorage first
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          const storedUser = localStorage.getItem('user');
          const accessToken = localStorage.getItem('accessToken');
          
          if (storedUser && accessToken) {
            try {
              const user = JSON.parse(storedUser);
              console.log("Found stored user data for iOS:", user);
              
              // Use React Router instead of window.location.href
              navigate(`/${user.role}/dashboard`, { 
                replace: true,
                state: { fromAuth: true }
              });
              return;
            } catch (parseError) {
              console.log("Error parsing stored user data:", parseError);
              localStorage.clear();
            }
          }
        } else {
          // For non-iOS, use normal API call
          const response = await api.get("/auth/status");
          const user = response.data.user;
          const isValid = response.data.isValid;

          console.log("Auth status response:", { isValid, user, authMethod: response.data.authMethod });

          if (isValid && user) {
            console.log("Valid session found, redirecting...");
            navigate(`/${user.role}/dashboard`, { replace: true });
            return;
          }
        }
        
        console.log("No valid authentication found");
      } catch (error) {
        console.log("Auth check error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } finally {
        setLoading(false);
      }
    };

    if (!showSplash) {
      fetchUser();
    }
  }, [showSplash, navigate]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

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
          {/* Debug info for iOS testing */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500">
              Login attempts: {loginAttempts} | User-Agent: {navigator.userAgent.includes('iPhone') ? 'iOS' : 'Other'}
            </p>
          )}
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