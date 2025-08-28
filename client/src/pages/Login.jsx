import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Checkbox } from "flowbite-react";
import {
  checkRole,
  getMicrosoftUser,
  microsoftLogin,
} from "../auth/authService";
import api from "../utils/axios";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import microsoftLogo from "../assets/logos/microsoft.svg";
import telexLogo from "../assets/logos/telex.png";
import ellipse from "../assets/shapes/ellipse.svg";

const Login = () => {
  const navigate = useNavigate();

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
      <div className="flex-1 flex gap-10 flex-col justify-start p-24">
        <div className="flex flex-col gap-2">
          <img src={telexLogo} alt="Telex PH" className="size-20 z-10" />
          <h1 className="text-3xl font-bold">Login</h1>
          <p>All fields are required. Make sure your details are correct.</p>
        </div>
        <form className="flex flex-col gap-4 w-full">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" className="text-light">
                Email
              </Label>
            </div>
            <TextInput
              id="email"
              type="email"
              placeholder="harrypotter@telexph.com"
              required
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
                type="password"
                required
                className="flex-1"
              />
              <div className="flex items-center justify-center p-2 border border-light container-light rounded-lg cursor-pointer">
                <RemoveRedEyeIcon className="text-light" />
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
          <Button type="submit">Log In</Button>
        </form>
        <hr className="text-gray-300" />

        <Button
          type="button"
          className="flex items-center justify-center border border-light container-light rounded-md w-full gap-2"
        >
          <img src={microsoftLogo} className="size-7" alt="Microsoft" />
          <span className="text-sm text-light ">Continue with Microsoft</span>
        </Button>
      </div>
      <div className="flex-1 bg-[#470905] relative rounded-l-lg p-24 flex justify-center gap-2 items-center flex-col overflow-hidden">
        <img src={ellipse} className="absolute -top-64 -right-65" />
        <img src={telexLogo} alt="Telex PH" className="size-3/4 z-10" />
        <p className="text-2xl text-white">Business Support Services Inc.</p>
      </div>
    </section>
  );
};

export default Login;
