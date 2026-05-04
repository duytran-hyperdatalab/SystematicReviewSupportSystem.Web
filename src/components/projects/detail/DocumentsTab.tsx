import React from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import type { CommissioningDocument } from "../../../types/coreAndGovernance";
import { FiPlus, FiExternalLink, FiBriefcase } from "react-icons/fi";

interface DocumentsTabProps {
  documents: CommissioningDocument[];
  onAdd: () => void;
  isLeader?: boolean;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents, onAdd, isLeader = true }) => {

  console.log("Check doc: ", documents);
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 items-center gap-2">
            Commissioning Documents
          </h2>
        </div>
        {isLeader && (
          <Button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all rounded-lg flex items-center gap-2"
          >
            <FiPlus />
            Add Document
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.document_id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 w-full">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Scope & Requirements</h4>
                <p className="text-gray-800 leading-relaxed text-sm">{doc.scope}</p>
              </div>

              <div className="pt-4 border-t border-gray-300 space-y-4">
                <div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight leading-none mb-1">Sponsor</p>
                  <p className="text-sm font-bold text-gray-900">{doc.sponsor}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight leading-none mb-1">Budget</p>
                    <p className="text-sm font-bold text-gray-900">${doc.budget?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>

                  {doc.document_url && (
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm w-full"
                    >
                      <FiExternalLink className="w-3.5 h-3.5" />
                      View Full Document
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {documents.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <FiBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No commissioning documents added yet</p>
            <p className="text-sm text-gray-400 mt-1">Add documents to define the project's financial and legal scope.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;
