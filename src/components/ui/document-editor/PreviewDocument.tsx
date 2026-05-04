import React from "react";
import type { DocumentDraft } from "../../../types/documentEditor";
import type { StudySelectionChecklistTemplate } from "../../../types/studySelectionChecklistTemplate";

interface PreviewDocumentProps {
  draft?: DocumentDraft;
  template?: StudySelectionChecklistTemplate | null;
  renderItem?: (item: any) => React.ReactNode;
  renderSectionTitle?: (section: any) => React.ReactNode;
}

export const PreviewDocument: React.FC<PreviewDocumentProps> = ({
  draft,
  template,
  renderItem,
  renderSectionTitle
}) => {
  // If template is provided, map its fields to the display structure
  const displayData = template ? {
    title: template.name,
    paragraphs: template.description ? [{ id: 'desc', text: template.description, order: 0 }] : [],
    sections: template.sections || []
  } : draft;

  if (!displayData) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white min-h-[400px] shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center rounded-xl">
        <p className="text-gray-400 italic">No document data provided.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white min-h-[1000px] shadow-sm border border-gray-100 p-12 sm:p-16 lg:p-20 flex flex-col gap-8 transition-all duration-300">
      {/* Title */}
      <header>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {(displayData as any)?.title || (displayData as any)?.name || <span className="text-gray-300 italic">Untitled Document</span>}
        </h1>
        <div className="h-1 w-20 bg-blue-600 mt-4 rounded-full"></div>
      </header>

      {/* Paragraphs / Description */}
      <div className="space-y-4">
        {displayData.paragraphs.length > 0 ? (
          displayData.paragraphs.map((p) => (
            <p key={p.id} className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
              {p.text || <span className="text-gray-200">Empty paragraph...</span>}
            </p>
          ))
        ) : (
          <p className="text-gray-300 italic text-sm">No introductory paragraphs added.</p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {displayData.sections.length > 0 ? (
          displayData.sections.map((section) => (
            <section key={section.id} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-between gap-3">
                  <span>
                    {section.title || <span className="text-gray-300 italic">Untitled Section</span>}
                  </span>
                  {renderSectionTitle && renderSectionTitle(section)}
                </h2>
                {section.description && (
                  <p className="mt-2 text-gray-500 text-sm italic">{section.description}</p>
                )}
              </div>

              <div className="ml-11">
                {section.items.length > 0 ? (
                  <ol className="space-y-4 list-decimal marker:text-blue-500 marker:font-bold">
                    {section.items.map((item) => (
                      <li key={item.id} className="pl-3 text-gray-700 font-medium">
                        <div className="flex items-center justify-between gap-4">
                          <span>
                            {item.text || <span className="text-gray-300 italic">No text provided</span>}
                          </span>
                          {renderItem && renderItem(item)}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-300 italic text-sm">No items in this section.</p>
                )}
              </div>
            </section>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-300 font-medium italic">Your sections will appear here.</p>
          </div>
        )}
      </div>

      {/* Footer / Meta */}
      <footer className="mt-auto pt-16 border-t border-gray-50 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
          Generated Document • {new Date().toLocaleDateString()}
        </p>
      </footer>
    </div>
  );
};

