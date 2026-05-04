import React from "react";
import { FiClock, FiDatabase, FiGlobe, FiMonitor, FiUser } from "react-icons/fi";
import Modal from "../../../../components/ui/Modal";
import { cn } from "../../../../utils/cn";
import type { AuditLogEntry } from "../../../../types/auditLog";
import { formatAuditDateTime, stringifyMetadata } from "../utils";

interface AuditLogDetailModalProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

const InfoRow: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
      {icon}
      {label}
    </div>
    <div className="text-sm font-semibold text-slate-800 break-words">{value}</div>
  </div>
);

const DiffBlock: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/60">
      <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.18em]">{title}</h4>
    </div>
    <pre className="p-5 text-xs leading-6 text-slate-100 overflow-auto max-h-[280px] bg-slate-950">
      {value}
    </pre>
  </div>
);

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const statusClasses =
    entry.status === "Success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-rose-50 text-rose-700 border-rose-100";

  return (
    <Modal
      isOpen={Boolean(entry)}
      onClose={onClose}
      title="Audit Log Details"
      description="Inspect the full event payload and related metadata."
      size="xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn("px-3 py-1 rounded-full text-xs font-black border", statusClasses)}
              >
                {entry.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">
                {entry.resourceType}
              </span>
              {entry.importance === "high" && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-200">
                  Important
                </span>
              )}
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">{entry.action}</h4>
              <p className="text-sm text-slate-500 font-medium">Resource ID: {entry.resourceId}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 text-white px-5 py-4 shadow-xl shadow-slate-900/20">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
              Timestamp
            </div>
            <div className="mt-2 text-sm font-semibold">{formatAuditDateTime(entry.timestamp)}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoRow label="Actor" value={entry.user} icon={<FiUser className="w-3.5 h-3.5" />} />
          <InfoRow
            label="Resource"
            value={`${entry.resourceType} • ${entry.resourceId}`}
            icon={<FiDatabase className="w-3.5 h-3.5" />}
          />
          <InfoRow
            label="IP Address"
            value={entry.ipAddress}
            icon={<FiGlobe className="w-3.5 h-3.5" />}
          />
          <InfoRow
            label="User Agent"
            value={entry.userAgent}
            icon={<FiMonitor className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <DiffBlock title="Old Value" value={stringifyMetadata(entry.oldValue)} />
          <DiffBlock title="New Value" value={stringifyMetadata(entry.newValue)} />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
            <FiClock className="w-3.5 h-3.5" />
            Event Summary
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {entry.action} on {entry.resourceType} {entry.resourceId} was recorded as{" "}
            {entry.status.toLowerCase()} at {formatAuditDateTime(entry.timestamp)}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600">
              Action type: {entry.actionType}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600">
              Importance: {entry.importance}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600">
              Event ID: {entry.id}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuditLogDetailModal;
