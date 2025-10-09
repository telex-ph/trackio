import { Info } from "lucide-react";

const TableAction = ({ action }) => {
  const handleClick = () => {
    if (action) {
      action();
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <button
        onClick={handleClick}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        title="View Details"
      >
        <Info size={18} className="text-gray-600" />
      </button>
    </div>
  );
};

export default TableAction;
