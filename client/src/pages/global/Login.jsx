import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { Eye, EyeClosed } from "lucide-react";
import trackio from "../../assets/logos/trackio.svg";
import Spinner from "../../assets/loaders/Spinner";
import { useAuth } from "../../hooks/useAuth";
import Wristwatch from "../../assets/illustrations/Wristwatch";
import bg001 from "../../assets/background/bg-002.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginClick = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      await login(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEyeClick = () => setIsShowPassword((prev) => !prev);

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
              boxShadow: "0 25px 60px rgba(128, 0, 0, 0.3)"
            }}
          >
            <div className="flex flex-col gap-3 mb-10">
              <h1 className="text-4xl font-black tracking-tight text-[#800000]">WELCOME BACK</h1>
              <p className="text-gray-500 text-base font-medium">
                PLEASE ENTER YOUR DETAILS TO ACCESS YOUR ACCOUNT.
              </p>
            </div>

            <form className="flex flex-col gap-7 w-full" onSubmit={handleLoginClick}>
              {error && (
                <Alert color="failure" icon={HiInformationCircle} className="rounded-2xl">
                  <span>{error.message}</span>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#800000] font-bold text-sm ml-1">
                  EMAIL ADDRESS
                </Label>
                <TextInput
                  id="email"
                  type="email"
                  name="email"
                  placeholder="hello@telexph.com"
                  required
                  onChange={handleInputChange}
                  value={data.email}
                  className="[&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:rounded-2xl [&_input]:py-5 [&_input]:px-6 [&_input]:text-lg focus:[&_input]:ring-[#800000]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#800000] font-bold text-sm ml-1">
                  PASSWORD
                </Label>
                <div className="relative">
                  <TextInput
                    id="password"
                    name="password"
                    onChange={handleInputChange}
                    type={isShowPassword ? "text" : "password"}
                    required
                    className="[&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:rounded-2xl [&_input]:py-5 [&_input]:px-6 [&_input]:text-lg focus:[&_input]:ring-[#800000]"
                    value={data.password}
                  />
                  <button
                    type="button"
                    onClick={handleEyeClick}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-[#800000] transition-colors"
                  >
                    {isShowPassword ? <Eye size={24} /> : <EyeClosed size={24} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  className="text-sm font-bold text-[#800000] hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  FORGOT PASSWORD?
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
                    style={{ backgroundColor: '#800000' }}
                    disabled={loading}
                  >
                    SIGN IN
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

export default Login;
