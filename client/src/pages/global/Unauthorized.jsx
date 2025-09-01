import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

const Unauthorized = () => {
  const navigator = useNavigate();
  // This prevents the loop bug, since we are navigating the user
  // back to the dashboard if the user exists in the login.
  const removeCookies = async () => {
    const response = await api.get("/auth/delete-token");
    const isLoggedOut = response.data.isLoggedOut;
    if (isLoggedOut) {
      navigator("/login");
    }
  };

  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-red-600">403</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl!">
          Unauthorized Access
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          You don't have permission to access that page. If you believe this is
          an error, please notify the Tech Team.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            onClick={removeCookies}
            className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Go back home
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Unauthorized;
