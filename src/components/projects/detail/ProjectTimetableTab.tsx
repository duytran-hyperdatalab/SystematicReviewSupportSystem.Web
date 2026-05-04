import { useMemo, useState } from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import { toDateInputValue } from "../../../utils/dateUtils";

interface ProjectTimetableTabProps {
  projectId: string;
  startDate?: string | null;
  endDate?: string | null;
  isLeader?: boolean;
  isSaving?: boolean;
  onSave: (payload: {
    id: string;
    startDate: string | null;
    endDate: string | null;
  }) => Promise<unknown>;
}

export default function ProjectTimetableTab({
  projectId,
  startDate,
  endDate,
  isLeader = false,
  isSaving = false,
  onSave,
}: ProjectTimetableTabProps) {
  const initialStartDate = toDateInputValue(startDate);
  const initialEndDate = toDateInputValue(endDate);

  const [formStartDate, setFormStartDate] = useState(initialStartDate);
  const [formEndDate, setFormEndDate] = useState(initialEndDate);

  const hasInvalidRange =
    formStartDate.length > 0 &&
    formEndDate.length > 0 &&
    new Date(formStartDate).getTime() > new Date(formEndDate).getTime();

  const canSave = useMemo(
    () =>
      !isSaving &&
      !hasInvalidRange &&
      (formStartDate !== initialStartDate || formEndDate !== initialEndDate),
    [formStartDate, formEndDate, hasInvalidRange, isSaving, initialStartDate, initialEndDate],
  );

  const handleSave = async () => {
    await onSave({
      id: projectId,
      startDate: formStartDate || null,
      endDate: formEndDate || null,
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Project Date Window</h2>
      </div>

      <Card className="border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Start Date
            </label>
            <input
              type="date"
              value={formStartDate}
              onChange={(event) => setFormStartDate(event.target.value)}
              disabled={!isLeader || isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected End Date
            </label>
            <input
              type="date"
              value={formEndDate}
              onChange={(event) => setFormEndDate(event.target.value)}
              disabled={!isLeader || isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>

        {hasInvalidRange && (
          <p className="text-sm text-red-600 mt-3">
            End Date must be the same as or after Start Date.
          </p>
        )}

        {!isLeader && (
          <p className="text-sm text-gray-500 mt-3">
            Only project leaders can update project dates.
          </p>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={() => void handleSave()} disabled={!isLeader || !canSave}>
            {isSaving ? "Saving..." : "Save Dates"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
