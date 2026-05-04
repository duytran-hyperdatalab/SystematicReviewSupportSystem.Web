// Alerts Card Component

import { FiAlertTriangle } from "react-icons/fi";
import type { Alert } from "../../types/reviewProcessWorkspace";

interface AlertsCardProps {
  alerts: Alert[];
}

export default function AlertsCard({ alerts }: AlertsCardProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
        Alerts
      </h3>
      <div className="space-y-3 text-sm">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
            <p className="text-gray-700">
              {alert.highlight && <span className="font-medium">{alert.highlight}</span>}{" "}
              {alert.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
