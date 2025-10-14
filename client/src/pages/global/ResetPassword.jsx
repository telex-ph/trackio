import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { Eye, EyeClosed } from "lucide-react";
import trackio from "../../assets/logos/trackio.svg";
import ellipse from "../../assets/shapes/ellipse.svg";
import telexvid from "../../assets/video/telexvid.mp4";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import validatePassword from "../../utils/validatePassword";
import Wristwatch from "../../assets/illustrations/Wristwatch";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const payload = searchParams.get("payload");

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Logo ↔ Video rotation
  useEffect(() => {
    let logoTimer;
    if (!showVideo) {
      logoTimer = setTimeout(() => setShowVideo(true), 6000);
    }
    return () => clearTimeout(logoTimer);
  }, [showVideo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPassword = passwordData.newPassword.trim();
    const confirmPassword = passwordData.confirmPassword.trim();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    const isStrongPassword = validatePassword(newPassword);
    if (!isStrongPassword.valid) {
      toast.error(isStrongPassword.message);
      return;
    }

    if (!payload) {
      return setStatus({
        type: "error",
        message: "Invalid or missing reset link.",
      });
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/verify-forgot-password", {
        payload,
        newPassword,
      });

      setStatus({
        type: "success",
        message: response.data.message || "Password reset successfully!",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Reset link is invalid or expired. Please try again.",
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
          {status.message && (
            <Alert
              color={status.type === "error" ? "failure" : "success"}
              icon={HiInformationCircle}
            >
              <span>{status.message}</span>
            </Alert>
          )}

          {/* New Password Field */}
          <div>
            <Label htmlFor="newPassword" className="text-gray-700 mb-2 block">
              New Password
            </Label>
            <div className="flex items-stretch gap-2">
              <TextInput
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                required
                onChange={handleChange}
                value={passwordData.newPassword}
                className="flex-1"
              />
              <div
                className="flex items-center justify-center p-2 border border-gray-300 rounded-lg cursor-pointer"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? (
                  <Eye className="text-gray-500" />
                ) : (
                  <EyeClosed className="text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-gray-700 mb-2 block"
            >
              Confirm Password
            </Label>
            <div className="flex items-stretch gap-2">
              <TextInput
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                required
                onChange={handleChange}
                value={passwordData.confirmPassword}
                className="flex-1"
              />
              <div
                className="flex items-center justify-center p-2 border border-gray-300 rounded-lg cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <Eye className="text-gray-500" />
                ) : (
                  <EyeClosed className="text-gray-500" />
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="hover:opacity-90 transition-opacity bg-(--primary-color)"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p
          className="underline text-sm cursor-pointer text-gray-500 mt-4 hover:text-(--primary-color) transition-colors"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>

      {/* Right Side */}
      <div className="flex-1 hidden lg:flex justify-center items-center flex-col overflow-hidden relative -z-10">
        <section className="w-full h-full fixed -bottom-40">
          <Wristwatch />
        </section>
      </div>
    </section>
  );
};

export default ResetPassword;
