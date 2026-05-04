import { forwardRef } from "react";
import { FiChevronRight } from "react-icons/fi";

const FlowArrow = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div 
      ref={ref}
      className="hidden lg:flex items-center justify-center h-16 px-2 opacity-0"
      data-flow-arrow
    >
      <FiChevronRight className="w-6 h-6 text-gray-300" />
    </div>
  );
});

FlowArrow.displayName = "FlowArrow";

export default FlowArrow;
