import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_KEY);

export const sendPasswordReset = async (to, resetLink) => {
  if (!to) {
    throw new Error("Email destination is required");
  }
  if (!resetLink) {
    throw new Error("Reset link is required");
  }

  try {
    const response = await resend.emails.send({
      from: "Trackio <noreply@telextrackio.com>",
      to,
      subject: "Reset Your Trackio Password",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; padding: 20px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #470905; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your Trackio account.</p>
          <p>Click the button below to reset your password:</p>

          <p style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}"
              style="background-color: #470905; color: #ffffff; padding: 12px 24px; text-decoration: none;
              border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px;">
              Reset Password
            </a>
          </p>

          <p style="font-size: 14px;">
            <strong>This link is valid for 30 minutes.</strong> If it expires, you will need to request a new password reset.
          </p>

          <p style="font-size: 14px; color: #555;">
            If you didn’t request this, please ignore this email. Your password will remain unchanged.
          </p>

          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
            For security reasons, you can only reset your password up to <strong>3 times</strong> within a short period.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <p style="font-size: 12px; color: #aaa; text-align: center;">
            © ${new Date().getFullYear()} Trackio. All rights reserved.
          </p>

         <p style="font-size: 12px; color: #aaa; text-align: center;">
            Created with ❤️ by the Tech Team
          </p>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
