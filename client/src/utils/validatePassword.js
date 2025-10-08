const validatePassword = (password) => {
  if (!password || password.trim().length === 0) {
    return { valid: false, message: "Password cannot be empty." };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpper || !hasNumber || !hasSpecial) {
    return {
      valid: false,
      message:
        "Password must include an uppercase letter, number, and special character.",
    };
  }

  return { valid: true };
};

export default validatePassword;
