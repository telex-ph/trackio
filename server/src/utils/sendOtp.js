import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_KEY);

export const sendOtp = async (to, otpCode) => {
  if (!to) {
    throw new Error("Email destination is required");
  }
  if (!otpCode) {
    throw new Error("OTP code is required");
  }

  try {
    const response = await resend.emails.send({
      from: "Trackio <noreply@telextrackio.com>",
      to,
      subject: "Your Trackio OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; padding: 20px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #470905; text-align: center;">Your One-Time Password (OTP)</h2>
          <p>Hello,</p>
          <p>Use the OTP code below to complete your verification:</p>

          <p style="text-align: center; margin: 24px 0; font-size: 24px; font-weight: bold; color: #470905;">
            ${otpCode}
          </p>

          <p style="font-size: 14px;">
            <strong>This OTP is valid for 30 minutes.</strong> Do not share it with anyone.
          </p>

          <p style="font-size: 14px; color: #555;">
            If you didn’t request this, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <p style="font-size: 12px; color: #aaa; text-align: center;">
            © ${new Date().getFullYear()} Trackio. All rights reserved.
          </p>

          <p style="font-size: 12px; color: #aaa; text-align: center;">
            Created with ❤️ by the Innovation Team
          </p>
        </div>
      `,
    });

    console.log("OTP email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
