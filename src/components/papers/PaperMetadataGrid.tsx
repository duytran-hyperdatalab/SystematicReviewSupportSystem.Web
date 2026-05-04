import React, { memo, useMemo } from "react";
import { FiCalendar, FiBook, FiMapPin } from "react-icons/fi";
import type { PaperResponse } from "../../types/paper";

interface PaperMetadataGridProps {
  paper: PaperResponse;
}

/** Single metadata row */
function MetadataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider w-32 shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-gray-800 wrap-break-word min-w-0">{value}</dd>
    </div>
  );
}

/**
 * Bibliographic metadata grid for Paper Details.
 * Renders publication info, journal, and conference metadata.
 * Hides empty fields gracefully.
 */
const PaperMetadataGrid: React.FC<PaperMetadataGridProps> = ({ paper }) => {
  // Publication fields
  const publicationFields = useMemo(() => {
    const fields: { label: string; value: React.ReactNode }[] = [];

    if (paper.publicationType) fields.push({ label: "Type", value: paper.publicationType });
    if (paper.journal) fields.push({ label: "Journal", value: paper.journal });
    if (paper.journalIssn) fields.push({ label: "ISSN", value: paper.journalIssn });

    // Volume/Issue/Pages combined
    const vip = [
      paper.volume ? `Vol. ${paper.volume}` : null,
      paper.issue ? `Iss. ${paper.issue}` : null,
      paper.pages ? `pp. ${paper.pages}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    if (vip) fields.push({ label: "Volume / Issue", value: vip });

    if (paper.publisher) fields.push({ label: "Publisher", value: paper.publisher });

    if (paper.publicationDate) {
      const date = new Date(paper.publicationDate);
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      fields.push({ label: "Published", value: formatted });
    } else if (paper.publicationYear) {
      fields.push({ label: "Year", value: paper.publicationYear });
    }

    if (paper.language) fields.push({ label: "Language", value: paper.language });

    return fields;
  }, [paper]);

  // Conference fields (only show section if any exist)
  const conferenceFields = useMemo(() => {
    const fields: { label: string; value: React.ReactNode }[] = [];

    if (paper.conferenceName) fields.push({ label: "Conference", value: paper.conferenceName });

    const location = [paper.conferenceLocation, paper.conferenceCountry].filter(Boolean).join(", ");
    if (location) fields.push({ label: "Location", value: location });

    if (paper.conferenceYear) fields.push({ label: "Year", value: String(paper.conferenceYear) });

    return fields;
  }, [paper]);

  return (
    <section className="mb-6">
      {/* Publication Metadata */}
      {publicationFields.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiBook className="w-3.5 h-3.5" />
            Bibliographic Details
          </h3>
          <div className="bg-gray-50/60 rounded-lg border border-gray-100 px-4 divide-y divide-gray-100">
            {publicationFields.map((field) => (
              <MetadataRow key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
      )}

      {/* Conference Metadata (conditional) */}
      {conferenceFields.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiMapPin className="w-3.5 h-3.5" />
            Conference
          </h3>
          <div className="bg-amber-50/40 rounded-lg border border-amber-100 px-4 divide-y divide-amber-100/60">
            {conferenceFields.map((field) => (
              <MetadataRow key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state if no metadata at all */}
      {publicationFields.length === 0 && conferenceFields.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
          <FiCalendar className="w-5 h-5 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400 italic">No bibliographic metadata available</p>
        </div>
      )}
    </section>
  );
};

export default memo(PaperMetadataGrid);
