export default function Spinner({
  size = 40,
  color1 = "#1a56db",
  color2 = "#FAF9F6",
}) {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{
          height: size,
          width: size,
          borderColor: color1,
          borderTopColor: color2,
        }}
        className="animate-spin rounded-full border-4"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
