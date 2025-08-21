import { accordionTheme } from "flowbite-react";
import { msalInstance } from "../config/msalConfig";

export const microsoftLogin = async () => {
  await msalInstance.initialize();

  try {
    const response = await msalInstance.loginPopup({
      scopes: ["openid", "profile", "email", "User.Read"],
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getProfile = async (accessToken) => {
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  console.log(data);
};

export const getProfilePicture = async (accessToken) => {
  try {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/photo/$value",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch profile picture");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    return imageUrl;  
  } catch (error) {
    console.error(error);
    return null;
  }
};
