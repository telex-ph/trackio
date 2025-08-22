export const handleExpiredToken = (req, res, next) => {
  if (req.tokenExpired) {
    return res
      .status(401)
      .json({ code: "ACCESS_TOKEN_EXPIRED", message: "Access token expired" });
  }
  next();
};
