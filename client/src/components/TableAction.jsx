import { AArrowDown } from "lucide-react";

const TableAction = ({ action }) => {
  const handleClick = () => {
    if (action) {
      action();
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <AArrowDown onClick={handleClick} />
    </div>
  );
};

export default TableAction;
