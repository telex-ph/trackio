import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import trackio from "../../assets/logos/trackio.svg";
import api from "../../utils/axios";
import Wristwatch from "../../assets/illustrations/Wristwatch";
import Spinner from "../../assets/loaders/Spinner";
import bg001 from "../../assets/background/bg-002.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ message: "", hasError: false });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // splash screen effect (1.5s)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    setError({ hasError: false, message: "" });
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError({ hasError: true, message: "PLEASE ENTER YOUR EMAIL ADDRESS." });
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError({
        hasError: true,
        message:
          err.response?.data?.message ||
          "OOPS! SOMETHING WENT WRONG. PLEASE TRY AGAIN.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen splash-bg">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <img
            src={trackio}
            alt="TELEX PH"
            className="w-72 h-72 md:w-80 md:h-80 animate-bounceShadow"
          />
          <div className="translate-x-4 md:translate-x-2">
            <p className="text-white text-2xl md:text-4xl font-semibold animate-pulse">
              BUSINESS SUPPORT SERVICES INC.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className="flex h-screen w-full items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bg001})` }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl flex w-full max-w-6xl h-fit md:h-[700px] overflow-hidden">
        <div className="hidden lg:flex flex-1 bg-gray-50 items-center justify-center relative">
          <div className="absolute top-12 left-12">
            <img src={trackio} alt="TRACKIO LOGO" className="w-44 h-auto" />
          </div>
          <div className="absolute -bottom-10 w-full flex justify-center scale-[1.15]">
            <Wristwatch />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center p-8 md:p-16 bg-white">
          <div className="lg:hidden mb-6">
            <img src={trackio} alt="TRACKIO LOGO" className="w-40" />
          </div>
          <div
            className="w-full max-w-lg mx-auto p-12 md:p-14 rounded-[3rem] bg-white border border-gray-100"
            style={{
              boxShadow: "0 25px 60px rgba(128, 0, 0, 0.3)",
            }}
          >
            <div className="flex flex-col gap-3 mb-10">
              <h1 className="text-4xl font-black tracking-tight text-[#800000]">
                FORGOT PASSWORD
              </h1>
              <p className="text-gray-500 text-base font-medium">
                ENTER YOUR EMAIL TO RECEIVE RESET INSTRUCTIONS.
              </p>
            </div>

            <form className="flex flex-col gap-7 w-full" onSubmit={handleSubmit}>
              {error.hasError && (
                <Alert color="failure" icon={HiInformationCircle} className="rounded-2xl">
                  <span>{error.message}</span>
                </Alert>
              )}

              {success && (
                <Alert color="success" icon={HiInformationCircle} className="rounded-2xl">
                  <span>
                    CHECK YOUR EMAIL AT OUTLOOK FOR PASSWORD RESET INSTRUCTIONS!
                  </span>
                </Alert>
              )}

              <Alert color="red" icon={HiInformationCircle} className="rounded-2xl">
                <span className="text-xs font-bold">
                  FOR SECURITY REASONS, YOU CAN ONLY RESET YOUR PASSWORD UP TO{" "}
                  <strong>3 TIMES</strong>.
                </span>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#800000] font-bold text-sm ml-1">
                  EMAIL ADDRESS
                </Label>
                <TextInput
                  id="email"
                  type="email"
                  name="email"
                  placeholder="HDOMINGO@TELEXPH.COM"
                  required
                  onChange={handleInputChange}
                  value={email}
                  className="[&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:rounded-2xl [&_input]:py-5 [&_input]:px-6 [&_input]:text-lg focus:[&_input]:ring-[#800000]"
                />
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  className="text-sm font-bold text-[#800000] hover:underline"
                  onClick={() => navigate("/login")}
                >
                  BACK TO LOGIN
                </button>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="flex justify-center">
                    <Spinner width={4} height={4} />
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-[#800000] hover:bg-maroon-900 py-3 rounded-2xl text-2xl font-black shadow-lg transition-all active:scale-[0.97] border-none"
                    style={{ backgroundColor: "#800000" }}
                    disabled={loading}
                  >
                    SEND RESET LINK
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
