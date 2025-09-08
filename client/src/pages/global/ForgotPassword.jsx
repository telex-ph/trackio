import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

import telexLogo from "../../assets/logos/telex.png";
import ellipse from "../../assets/shapes/ellipse.svg";
import api from "../../utils/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ message: "", hasError: false });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setError({ hasError: false, message: "" });
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError({
        message: err.response?.data
          ? "Oops! Something went wrong. Please try again."
          : err.message,
        hasError: true,
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
          <img src={telexLogo} alt="Telex PH" className="size-20 z-10" />
          <h1 className="font-bold">Forgot Password</h1>
          <p className="text-light">
            Enter your email and we will send you instructions to reset your password.
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
              <span>Check your email for password reset instructions!</span>
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
              placeholder="youremail@telexph.com"
              required
              onChange={handleInputChange}
              value={email}
            />
          </div>

          <Button
            type="submit"
            className="bg-[#470905] hover:bg-[#470905]"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p
          className="underline text-sm cursor-pointer text-light mt-4"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>

      {/* Right Side */}
      <div className="flex-1 hidden lg:flex justify-center items-center flex-col bg-[#470905] relative rounded-l-lg p-24 overflow-hidden">
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

export default ForgotPassword;
