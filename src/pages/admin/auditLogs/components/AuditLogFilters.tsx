import React from "react";
import { FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import Select from "../../../../components/ui/Select";
import { AUDIT_LOG_ACTION_OPTIONS, AUDIT_LOG_STATUS_OPTIONS } from "../constants";

interface AuditLogFiltersProps {
  searchTerm: string;
  users: string[];
  selectedUser: string;
  selectedActionType: string;
  selectedStatus: string;
  startDate: string;
  endDate: string;
  onSearchTermChange: (value: string) => void;
  onSelectedUserChange: (value: string) => void;
  onSelectedActionTypeChange: (value: string) => void;
  onSelectedStatusChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

const fieldClassName =
  "w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all";

const DateField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="space-y-2 block">
    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
      {label}
    </span>
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClassName}
    />
  </label>
);

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  searchTerm,
  users,
  selectedUser,
  selectedActionType,
  selectedStatus,
  startDate,
  endDate,
  onSearchTermChange,
  onSelectedUserChange,
  onSelectedActionTypeChange,
  onSelectedStatusChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  const userOptions = users.map((user) => ({ value: user, label: user }));

  return (
    <section className="bg-white rounded-4xl border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.22em]">
            <FiFilter className="w-3 h-3" />
            Filters
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Search and narrow audit activity
          </h3>
        </div>

        <button
          type="button"
          onClick={onReset}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
            "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200",
          )}
        >
          <FiRefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <label className="space-y-2 block lg:col-span-1">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Search
          </span>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search by user or resource ID"
              className={cn(fieldClassName, "pl-11")}
            />
          </div>
        </label>

        <label className="space-y-2 block">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            User
          </span>
          <Select
            value={selectedUser}
            onChange={(event) => onSelectedUserChange(event.target.value)}
            options={userOptions}
            placeholder="All users"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Action
          </span>
          <Select
            value={selectedActionType}
            onChange={(event) => onSelectedActionTypeChange(event.target.value)}
            options={AUDIT_LOG_ACTION_OPTIONS.slice(1)}
            placeholder="All actions"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Status
          </span>
          <Select
            value={selectedStatus}
            onChange={(event) => onSelectedStatusChange(event.target.value)}
            options={AUDIT_LOG_STATUS_OPTIONS.slice(1)}
            placeholder="All statuses"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
        <DateField label="Date from" value={startDate} onChange={onStartDateChange} />
        <DateField label="Date to" value={endDate} onChange={onEndDateChange} />

        <div className="flex items-center gap-3 xl:justify-end">
          <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-500">
            Filters are applied locally to mock data.
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuditLogFilters;
