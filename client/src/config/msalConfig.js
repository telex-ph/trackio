import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "ce1ef47d-471d-4c3b-a3c5-f9b9e0ac1ea1",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5173/dashboard",
  },
};
export const msalInstance = new PublicClientApplication(msalConfig);
