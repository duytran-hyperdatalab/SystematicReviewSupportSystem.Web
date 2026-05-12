import React from "react";
import { FiPieChart } from "react-icons/fi";

const AnalyticsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100">
        <FiPieChart className="w-10 h-10 text-indigo-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics</h2>
      <p className="text-gray-500 max-w-md">
        Analytics dashboard is coming soon. This section will provide insights and statistics about your systematic review projects.
      </p>
    </div>
  );
};

export default AnalyticsPage;
