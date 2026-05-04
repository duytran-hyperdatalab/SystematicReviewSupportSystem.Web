// PRISMA 2020 Flow Diagram — Visual representation of the systematic review pipeline
// Layout follows PRISMA 2020 standard: Identification → Screening → Eligibility → Included

import { useState, useRef, useCallback } from "react";
import { FiArrowDown, FiMaximize2, FiDownload } from "react-icons/fi";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import type { PrismaNodeResponse, PrismaBreakdownResponse } from "../../../../types/prismaReport";
import { PRISMA_STAGE_LABELS } from "../../../../types/prismaReport";

interface PrismaFlowDiagramProps {
  nodes: PrismaNodeResponse[];
  includedNode: PrismaNodeResponse | null;
  isLoading: boolean;
  isExpanded?: boolean;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCount(n: number): string {
  return n.toLocaleString();
}

// ─────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────

function DiagramSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="flex items-center gap-4 w-full max-w-2xl mx-auto">
            <div className="flex-1 h-20 bg-gray-100 border border-gray-200 rounded-lg" />
            {i < 3 && <div className="h-20 w-36 bg-gray-100 border border-gray-200 rounded-lg" />}
          </div>
          {i < 3 && <div className="w-0.5 h-8 bg-gray-200" />}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface FlowBoxProps {
  label: string;
  count?: number;
  variant: "primary" | "secondary" | "success" | "muted";
  breakdown?: PrismaBreakdownResponse[];
  reasons?: PrismaBreakdownResponse[];
  notes?: string[];
  className?: string;
  isExpanded?: boolean;
}

const VARIANT_STYLES: Record<FlowBoxProps["variant"], string> = {
  primary: "bg-white border-2 border-indigo-300 shadow-sm hover:shadow-md hover:border-indigo-400",
  secondary: "bg-white border border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400",
  success: "bg-green-50 border-2 border-green-500 shadow-sm hover:shadow-md hover:border-green-600",
  muted: "bg-gray-50 border border-gray-200 text-gray-500",
};

function FlowBox({
  label,
  count,
  variant,
  breakdown,
  reasons,
  notes,
  isExpanded = false,
}: FlowBoxProps) {
  const isSideBox = variant === "muted";
  const widthClass = isExpanded
    ? isSideBox
      ? "max-w-[300px]"
      : "max-w-[400px]"
    : isSideBox
      ? "max-w-[240px]"
      : "max-w-[320px]";

  return (
    <div
      className={`rounded-lg px-5 py-4 text-left transition-all duration-150 ${VARIANT_STYLES[variant]} ${widthClass} w-full flex flex-col gap-2 shrink-0 ${isExpanded ? "shadow-md" : ""}`}
      role="group"
    >
      <div className="flex justify-between items-start gap-4">
        <p
          className={`text-sm font-semibold leading-tight uppercase tracking-tight ${isSideBox ? "text-gray-500" : "text-gray-700"}`}
        >
          {label}
        </p>
        {count !== undefined && (
          <p
            className={`text-lg font-bold tabular-nums whitespace-nowrap ${isSideBox ? "text-gray-600 outline-none" : "text-gray-900"}`}
          >
            (n = {formatCount(count)})
          </p>
        )}
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="mt-1 border-t border-gray-100 pt-2 space-y-1">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-gray-600">
              <span className="truncate mr-2">{item.label}</span>
              <span className="font-medium whitespace-nowrap">(n={formatCount(item.count)})</span>
            </div>
          ))}
        </div>
      )}

      {reasons && reasons.length > 0 && (
        <div className="mt-1 border-t border-gray-100 pt-2 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Reasons for exclusion:
          </p>
          {reasons.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-gray-600 italic">
              <span className="truncate mr-2 leading-tight">- {item.label}</span>
              <span className="font-medium whitespace-nowrap">(n={formatCount(item.count)})</span>
            </div>
          ))}
        </div>
      )}

      {notes && notes.length > 0 && (
        <div className="mt-1 border-t border-gray-100 pt-2">
          {notes.map((note, idx) => (
            <p
              key={idx}
              className={`text-[11px] leading-snug ${isSideBox ? "text-gray-400" : "text-indigo-400"} italic`}
            >
              * {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function VerticalConnector({ color = "gray" }: { color?: string }) {
  const colorClass =
    color === "indigo"
      ? "bg-indigo-300"
      : color === "blue"
        ? "bg-blue-300"
        : color === "amber"
          ? "bg-amber-300"
          : color === "green"
            ? "bg-green-300"
            : "bg-gray-300";

  return (
    <div className="flex flex-col items-center py-1">
      <div className={`w-0.5 h-8 ${colorClass}`} />
      <FiArrowDown className={`w-4 h-4 ${colorClass.replace("bg-", "text-")}`} />
    </div>
  );
}

function SideArrow() {
  return (
    <div className="flex flex-row md:flex-row items-center justify-center h-full min-w-[40px]">
      <div className="hidden md:block w-8 h-0.5 bg-gray-200" />
      <FiArrowDown className="w-4 h-4 text-gray-300 md:-rotate-90 md:ml-[-2px]" />
    </div>
  );
}

interface SectionLabelProps {
  label: string;
  color: string;
}

function SectionLabel({ label, color }: SectionLabelProps) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className="flex items-start md:items-center mb-6">
      <div className="flex-1 border-t-2 border-dashed border-gray-200" />
      <span
        className={`mx-4 px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border shadow-sm ${colorClasses[color] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}
      >
        {label}
      </span>
      <div className="flex-1 border-t-2 border-dashed border-gray-200" />
    </div>
  );
}

function PrismaFlowColumn({
  nodes,
  variant = "primary",
  isExpanded = false,
}: {
  nodes: PrismaNodeResponse[];
  variant?: "primary" | "secondary";
  isExpanded?: boolean;
}) {
  const mainWidthClass = isExpanded ? "md:w-[400px]" : "md:w-[320px]";
  const sideMinWidthClass = isExpanded ? "md:min-w-[340px]" : "md:min-w-[280px]";

  return (
    <div className={`w-full flex flex-col items-center ${isExpanded ? "gap-y-6" : "gap-y-1"}`}>
      {nodes.map((node, idx) => (
        <div key={idx} className="w-full flex flex-col items-center">
          {/* Row Layout: Main Box + Arrow + Side Box */}
          <div
            className={`flex flex-col md:flex-row items-center justify-center gap-2 ${isExpanded ? "md:gap-8" : "md:gap-4"} w-full`}
          >
            {/* Main Node Vertical Stack */}
            <div
              className={`w-full flex flex-col items-center md:items-end shrink-0 ${mainWidthClass}`}
            >
              <FlowBox
                label={PRISMA_STAGE_LABELS[node.stage] ?? node.stage}
                count={node.total}
                breakdown={node.breakdown}
                reasons={node.reasons}
                notes={node.notes}
                variant={variant}
                isExpanded={isExpanded}
              />

              {/* Vertical Connector */}
              {idx < nodes.length - 1 && (
                <div className="flex justify-center w-full">
                  <VerticalConnector color={variant === "primary" ? "indigo" : "blue"} />
                </div>
              )}
            </div>

            {/* Side Box Connector */}
            <div
              className={`flex flex-col md:flex-row items-center justify-center min-w-0 ${sideMinWidthClass} w-full md:w-auto`}
            >
              {node.sideBox ? (
                <div className="flex flex-col md:flex-row items-center w-full">
                  <SideArrow />
                  <FlowBox
                    label={PRISMA_STAGE_LABELS[node.sideBox.stage] ?? node.sideBox.stage}
                    count={node.sideBox.total}
                    breakdown={node.sideBox.breakdown}
                    reasons={node.sideBox.reasons}
                    variant="muted"
                    className="border-dashed bg-gray-50/30"
                    isExpanded={isExpanded}
                  />
                </div>
              ) : (
                <div className="hidden md:block w-full" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function PrismaFlowDiagram({
  nodes,
  includedNode,
  isLoading,
  isExpanded: initialIsExpanded = false,
}: PrismaFlowDiagramProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleExportImage = useCallback(async () => {
    if (diagramRef.current === null) return;

    try {
      // Export with a slight delay to ensure all styles are applied
      const dataUrl = await toPng(diagramRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 3, // Higher resolution
        style: {
          padding: "40px",
          margin: "0",
          backgroundColor: "#ffffff",
        },
      });
      saveAs(dataUrl, "prisma-flow-diagram.png");
    } catch (err) {
      console.error("Failed to export PRISMA diagram:", err);
    }
  }, []);

  if (isLoading) return <DiagramSkeleton />;

  // Identify nodes by stage groups for visual separation
  const identificationNodes = nodes.filter((n) =>
    ["RecordsIdentified", "DuplicateRecordsRemoved"].includes(n.stage),
  );
  const filteringNodes = nodes.filter((n) =>
    [
      "RecordsScreened",
      "RecordsExcluded",
      "ReportsSoughtForRetrieval",
      "ReportsNotRetrieved",
      "ReportsAssessed",
      "ReportsExcluded",
    ].includes(n.stage),
  );

  const renderDiagram = (isExpanded: boolean) => (
    <div
      ref={diagramRef}
      className={`prisma-flow-diagram py-10 ${isExpanded ? "px-12 w-fit" : "px-6 md:px-10 w-full max-w-[1000px] overflow-x-hidden"} mx-auto print:py-2 transition-all duration-300 bg-white`}
      role="figure"
      aria-label="PRISMA 2020 flow diagram"
    >
      {/* ── IDENTIFICATION ── */}
      <div className="mb-12">
        <SectionLabel label="Identification" color="indigo" />
        <PrismaFlowColumn nodes={identificationNodes} variant="primary" isExpanded={isExpanded} />
      </div>

      {/* ── SCREENING & ELIGIBILITY ── */}
      <div className="mb-12">
        <div className="flex justify-center mb-6">
          <VerticalConnector color="indigo" />
        </div>
        <SectionLabel label="Screening & Eligibility" color="blue" />
        <PrismaFlowColumn nodes={filteringNodes} variant="secondary" isExpanded={isExpanded} />
      </div>

      {/* ── INCLUDED ── */}
      {includedNode && (
        <div className={`mt-4 flex flex-col items-center ${isExpanded ? "mt-12" : "mt-4"}`}>
          <div className="flex justify-center mb-6">
            <VerticalConnector color="blue" />
          </div>
          <SectionLabel label="Studies Included" color="green" />
          <div
            className={`w-full flex justify-center ${isExpanded ? "max-w-[700px]" : "max-w-[540px]"}`}
          >
            <FlowBox
              label={PRISMA_STAGE_LABELS[includedNode.stage] ?? includedNode.stage}
              count={includedNode.total}
              variant="success"
              className="border-green-600 shadow-xl ring-4 ring-green-50 text-center"
              isExpanded={isExpanded}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="flex justify-end items-center gap-3 mb-4 px-4 font-inter">
        <button
          onClick={handleExportImage}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          title="Download diagram as high-quality PNG"
        >
          <FiDownload className="w-4 h-4" />
          Export PNG
        </button>
        {!initialIsExpanded && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all shadow-sm active:scale-95"
          >
            <FiMaximize2 className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
            View Full Diagram
          </button>
        )}
      </div>

      {renderDiagram(initialIsExpanded)}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-white w-full h-full rounded-2xl shadow-2xl relative flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full" />
                PRISMA 2020 Flow Diagram - Detailed View
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExportImage}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <FiDownload className="w-4 h-4" />
                  Export PNG
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <FiMaximize2 className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50/30 p-8 md:p-12">
              <div className="min-w-fit mx-auto">{renderDiagram(true)}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
