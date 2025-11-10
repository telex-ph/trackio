import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";
import fs from "fs";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), flowbiteReact()],

  // server: isDev
  //   ? {
  //       https: {
  //         key: fs.readFileSync(
  //           path.resolve(__dirname, "keys/localhost-key.pem")
  //         ),
  //         cert: fs.readFileSync(path.resolve(__dirname, "keys/localhost.pem")),
  //       },
  //       port: 5173,
  //     }
  //   : {},

  server: isDev
    ? {
      https: false,
      port: 5173,
    }
    : {},
});
