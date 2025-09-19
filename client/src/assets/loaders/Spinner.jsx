export default function Spinner({ height, width }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`h-${height} w-${width} animate-spin rounded-full border-4 border-white border-t-gray-400`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
