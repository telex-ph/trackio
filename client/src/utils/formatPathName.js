const formatPathName = (pathname = "") => {
  const current = pathname.split("/").filter(Boolean).pop() || "";
  return current
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default formatPathName;
