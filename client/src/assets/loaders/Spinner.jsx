export default function Spinner({
  size = 40,
  color1 = "#470905",
  color2 = "#967171",
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
