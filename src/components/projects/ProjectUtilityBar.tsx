import React from "react";
import { FiSearch } from "react-icons/fi";
import Input from "../ui/Input";

interface ProjectUtilityBarProps {
  onSearchChange: (value: string) => void;
}

const ProjectUtilityBar: React.FC<ProjectUtilityBarProps> = ({
  onSearchChange,
}) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 bg-white sticky top-0 z-10 px-6">
      {/* Search Input */}
      <div className="relative w-72">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search"
          className="pl-10 h-10 bg-transparent border-gray-200 focus:border-blue-400 focus:ring-0 rounded-md"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Page Title with Dropdown (Centered) */}
      <div className="flex-1 flex justify-center">
        {/* <Dropdown
          trigger={
            <div className="flex items-center gap-2 group cursor-pointer">
              <h1 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                My Projects
              </h1>
              <FiChevronDown className="text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          }
          align="center"
        >
          <DropdownItem icon={<FiUser />} onClick={() => {}}>
            My projects
          </DropdownItem>
          <DropdownItem icon={<FiUser />} onClick={() => {}}>
            Dong's projects
          </DropdownItem>
        </Dropdown> */}
        <h1 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          My Projects
        </h1>
      </div>

      {/* Right Slot (Empty to balance the Search on the left) */}
      <div className="w-72 hidden md:block"></div>

    </div>
  );
};

export default ProjectUtilityBar;
