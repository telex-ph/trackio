import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import trackio from "../../assets/logos/trackio.svg";
import Wristwatch from "../../assets/illustrations/Wristwatch";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const VerifyCode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const payload = searchParams.get("token");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const code = String(e.target.value).toUpperCase();
    setCode(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify-code", {
        payload,
        code: code.trim(),
      });
      console.log(data);
      if (data.isValid) {
        navigate("/login");
        toast.success(
          "OTP verification successful. Proceeding with your login.",
          { duration: 10000 }
        );
      }
    } catch (error) {
      const err = error.response.data;

      console.log(err.message);

      if (err.code === "ERR_JWT_EXPIRED" || err.code === "INCORRECT_OTP") {
        return toast.error(err.message);
      } else {
        toast.error("OTP verification failed. Please contact Innovation Team");
      }
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
          <h1 className="font-bold">Verify Code</h1>
          <p className="text-light">
            Please enter the verification code sent to your email to continue.
          </p>
        </div>

        <Alert color="success" icon={HiInformationCircle}>
          <strong className="bold">Please read.</strong>

          <div>
            <span>
              Check your email for the <strong>OTP</strong>!
            </span>
          </div>

          <div className="mt-1">
            <span>
              For security reasons, you will only receive an OTP verification
              once
              <strong>
                {" "}
                every 30 days, unless you log in from another PC.
              </strong>
            </span>
          </div>

          <div className="mt-1">
            <span>
              This requirement is part of our security compliance guidelines and
              helps ensure that our system remains secure — as recommended by
              our
              <strong>
                {" "}
                esteemed and very beautiful Audit and Compliance Head
              </strong>
              .
            </span>
          </div>
        </Alert>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          {status.message && (
            <Alert
              color={status.type === "error" ? "failure" : "success"}
              icon={HiInformationCircle}
            >
              <span>{status.message}</span>
            </Alert>
          )}

          {/* Verification Code Field */}
          <div>
            <Label htmlFor="code" className="text-gray-700 mb-2 block">
              Verification Code
            </Label>
            <TextInput
              id="code"
              type="text"
              name="code"
              placeholder="Enter your code"
              required
              onChange={handleChange}
              value={code}
            />
          </div>

          <Button
            type="submit"
            className="hover:opacity-90 transition-opacity bg-(--primary-color)"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
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

export default VerifyCode;
