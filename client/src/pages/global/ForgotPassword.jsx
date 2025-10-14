import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

import trackio from "../../assets/logos/trackio.svg";
import ellipse from "../../assets/shapes/ellipse.svg";
import telexvid from "../../assets/video/telexvid.mp4";
import api from "../../utils/axios";
import Wristwatch from "../../assets/illustrations/Wristwatch";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ message: "", hasError: false });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showVideo, setShowVideo] = useState(false);

  // Rotate between logo and video
  useEffect(() => {
    let logoTimer;
    if (!showVideo) {
      logoTimer = setTimeout(() => setShowVideo(true), 6000);
    }
    return () => clearTimeout(logoTimer);
  }, [showVideo]);

  const handleInputChange = (e) => {
    setError({ hasError: false, message: "" });
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError({ hasError: true, message: "Please enter your email address." });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError({
        hasError: true,
        message:
          err.response?.data?.message ||
          "Oops! Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex h-screen">
      {/* Left Side */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 gap-10">
        <div className="flex flex-col gap-2">
          <img src={trackio} alt="Telex PH" className="size-60 z-10 h-fit" />
          <h1 className="font-bold">Login</h1>
          <p className="text-light">
            All fields are required. Make sure your details are correct.
          </p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          {error.hasError && (
            <Alert color="failure" icon={HiInformationCircle}>
              <span>{error.message}</span>
            </Alert>
          )}

          {success && (
            <Alert color="success" icon={HiInformationCircle}>
              <span>
                Check your email at Outlook for password reset instructions!
              </span>
            </Alert>
          )}

          <Alert color="red" icon={HiInformationCircle}>
            <span className="text-sm mt-1">
              For security reasons, you can only reset your password up to{" "}
              <strong>3 times</strong>.
            </span>
          </Alert>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
            </div>
            <TextInput
              id="email"
              type="email"
              name="email"
              placeholder="youremail@telexph.com"
              required
              onChange={handleInputChange}
              value={email}
            />
          </div>

          <Button
            type="submit"
            className="hover:opacity-90 transition-opacity bg-(--primary-color)"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p
          className="underline text-sm cursor-pointer text-gray-500 mt-4 hover:text-(--primary-color) transition-colors"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>

      <div className="flex-1 hidden lg:flex justify-center items-center flex-col overflow-hidden relative -z-10">
        <section className="w-full h-full fixed -bottom-40">
          <Wristwatch />
        </section>
      </div>

      {/* Right Side */}
      {/* <div className="flex-1 hidden lg:flex justify-center items-center flex-col hover:text-(--primary-color)] relative rounded-l-lg p-24 overflow-hidden border border-[#582e2b]/40">
        <img
          src={ellipse}
          className="absolute -top-64 -right-65"
          alt="Background Shape"
        />

  
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-6 transition-all duration-[1500ms] ease-in-out ${
            showVideo ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
           
            alt="Telex PH"
            className="w-3/4 h-3/4 object-contain"
          />
          <p className="text-4xl md:text-5xl text-white text-center font-semibold">
            Business Support Services Inc.
          </p>
        </div>

    
        {showVideo && (
          <video
            src={telexvid}
            autoPlay
            muted
            className={`absolute inset-0 w-full h-full object-cover rounded-l-lg transition-all duration-[1500ms] ease-in-out ${
              showVideo ? "opacity-100" : "opacity-0"
            }`}
            onEnded={() => setTimeout(() => setShowVideo(false), 500)} // smooth fade back
          />
        )}
      </div> */}
    </section>
  );
};

export default ForgotPassword;
