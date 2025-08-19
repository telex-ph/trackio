import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./index.css";
import { Button, ThemeProvider } from "flowbite-react";
import flowbiteTheme from "./theme/flowbiteTheme";
import router from "./router/router.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={flowbiteTheme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
