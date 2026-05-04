import type { ConsensusSectionDto } from "../../../../../types/dataExtraction";

interface ConsensusSidebarProps {
  sections: ConsensusSectionDto[];
  activeSectionId: string;
  totalConflictCount: number;
  getSectionConflictCount: (section: ConsensusSectionDto) => number;
  onSectionChange: (sectionId: string) => void;
}

export default function ConsensusSidebar({
  sections,
  activeSectionId,
  totalConflictCount,
  getSectionConflictCount,
  onSectionChange,
}: ConsensusSidebarProps) {
  return (
    <aside className="w-[20%] overflow-y-auto border-r border-slate-200 bg-white p-4">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-800">Sections</h2>
        <p className="mt-1 text-sm text-slate-500">Extraction Adjudication</p>
      </div>

      <div className="mt-4 space-y-2">
        {sections.map((section) => {
          const sectionConflictCount = getSectionConflictCount(section);
          const isActive = section.sectionId === activeSectionId;

          return (
            <button
              key={section.sectionId}
              type="button"
              onClick={() => onSectionChange(section.sectionId)}
              className={
                isActive
                  ? "w-full rounded-xl border border-blue-500 bg-blue-50 px-4 py-3 text-left"
                  : "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-slate-300"
              }
            >
              <p
                className={
                  isActive
                    ? "text-sm font-semibold text-blue-700"
                    : "text-sm font-semibold text-slate-700"
                }
              >
                {section.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {section.fields.length} fields, {sectionConflictCount} remaining conflicts
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
          Remaining Conflicts
        </p>
        <p className="mt-1 text-lg font-semibold text-amber-900">
          {totalConflictCount}
        </p>
      </div>
    </aside>
  );
}
