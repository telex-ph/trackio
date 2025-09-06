import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./index.css";
import { ThemeProvider } from "flowbite-react";
import flowbiteTheme from "./theme/flowbiteTheme";
import router from "./router/router.jsx";

import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={flowbiteTheme}>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
