import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { DocumentDraft } from "../../../types/documentEditor";
import { produce } from "immer";
import Button from "../Button";
import Input from "../Input";
import Textarea from "../Textarea";
import { Card, CardContent, CardHeader } from "../Card";

import type { CreateStudySelectionChecklistTemplateRequest } from "../../../types/studySelectionChecklistTemplate";

interface EditorPanelProps {
  onSubmit?: (data: CreateStudySelectionChecklistTemplateRequest | null) => void;
  isSubmitting?: boolean;
  submitText?: string;
  localDraft: DocumentDraft;
  setLocalDraft: React.Dispatch<React.SetStateAction<DocumentDraft>>;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  onSubmit, 
  isSubmitting, 
  submitText,
  localDraft,
  setLocalDraft
}) => {
  const draft = localDraft;

  const handleSubmit = () => {
    if (!onSubmit) return;

    if (!draft.title && draft.sections.length === 0 && draft.paragraphs.length === 0) {
      onSubmit(null);
      return;
    }

    const request: CreateStudySelectionChecklistTemplateRequest = {
      name: draft.title || "Untitled Template",
      description: draft.paragraphs.map((p) => p.text).filter(Boolean).join("\n\n") || "No description provided",
      sections: draft.sections.map((s, sIdx) => ({
        title: s.title || `Section ${sIdx + 1}`,
        description: s.description || "",
        order: sIdx,
        items: s.items.map((i, iIdx) => ({
          text: i.text || `Item ${iIdx + 1}`,
          order: iIdx,
        })),
      })),
    };

    onSubmit(request);
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Title Editor */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
        <Input
          value={draft.title}
          onChange={(e) => setLocalDraft(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter document title"
          className="text-lg font-semibold"
        />
      </section>

      {/* Paragraphs Editor */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Paragraphs/Description</h3>
          <Button variant="outline" size="sm" onClick={() => setLocalDraft(produce(draft, draft => {
            draft.paragraphs.push({ id: uuidv4(), text: "", order: draft.paragraphs.length + 1 });
          }))}>
            <Plus className="w-4 h-4 mr-1" /> Add Paragraph
          </Button>
        </div>
        {draft.paragraphs.map((p, idx) => (
          <Card key={p.id} className="relative group">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Textarea
                  value={p.text}
                  onChange={(e) => setLocalDraft(produce(draft, draft => {
                    const paragraph = draft.paragraphs.find(para => para.id === p.id);
                    if (paragraph) paragraph.text = e.target.value;
                  }))}
                  placeholder={`Paragraph ${idx + 1}`}
                  rows={2}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setLocalDraft(produce(draft, draft => {
                    draft.paragraphs = draft.paragraphs.filter(para => para.id !== p.id).map((para, i) => ({ ...para, order: i + 1 }));
                  }))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Sections Editor */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Sections</h3>
          <Button variant="outline" size="sm" onClick={() => setLocalDraft(produce(draft, draft => {
            draft.sections.push({ id: uuidv4(), title: "", description: "", order: draft.sections.length + 1, items: [] });
          }))}>
            <Plus className="w-4 h-4 mr-1" /> Add Section
          </Button>
        </div>
        {draft.sections.map((section, sIdx) => (
          <Card key={section.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 space-y-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Input
                    value={section.title}
                    onChange={(e) => setLocalDraft(produce(draft, draft => {
                      const s = draft.sections.find(sec => sec.id === section.id);
                      if (s) s.title = e.target.value;
                    }))}
                    placeholder={`Section ${sIdx + 1} Title`}
                    className="font-bold"
                  />
                  <Textarea
                    value={section.description || ""}
                    onChange={(e) => setLocalDraft(produce(draft, draft => {
                      const s = draft.sections.find(sec => sec.id === section.id);
                      if (s) s.description = e.target.value;
                    }))}
                    placeholder="Section description (optional)"
                    rows={1}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={sIdx === 0}
                    onClick={() => setLocalDraft(produce(draft, draft => {
                      [draft.sections[sIdx], draft.sections[sIdx - 1]] = [draft.sections[sIdx - 1], draft.sections[sIdx]];
                      draft.sections.forEach((s, i) => s.order = i + 1);
                    }))}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={sIdx === draft.sections.length - 1}
                    onClick={() => setLocalDraft(produce(draft, draft => {
                      [draft.sections[sIdx], draft.sections[sIdx + 1]] = [draft.sections[sIdx + 1], draft.sections[sIdx]];
                      draft.sections.forEach((s, i) => s.order = i + 1);
                    }))}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setLocalDraft(produce(draft, draft => {
                      draft.sections = draft.sections.filter(s => s.id !== section.id).map((s, i) => ({ ...s, order: i + 1 }));
                    }))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-400">Items ({section.items.length})</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setLocalDraft(produce(draft, draft => {
                    const s = draft.sections.find(sec => sec.id === section.id);
                    if (s) s.items.push({ id: uuidv4(), text: "", order: s.items.length + 1 });
                  }))}>
                    <Plus className="w-3 h-3 mr-1" /> Add Item
                  </Button>
                </div>
                {section.items.map((item, iIdx) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <span className="text-xs font-mono text-gray-400 w-4">{iIdx + 1}.</span>
                    <Input
                      value={item.text}
                      onChange={(e) => setLocalDraft(produce(draft, draft => {
                        const s = draft.sections.find(sec => sec.id === section.id);
                        if (s) {
                          const i = s.items.find(it => it.id === item.id);
                          if (i) i.text = e.target.value;
                        }
                      }))}
                      placeholder={`Item ${iIdx + 1} text`}
                      className="h-9 text-sm"
                    />
                    <div className="flex items-center">
                       <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={iIdx === 0}
                        onClick={() => setLocalDraft(produce(draft, draft => {
                           const s = draft.sections.find(sec => sec.id === section.id);
                           if (s) {
                             [s.items[iIdx], s.items[iIdx - 1]] = [s.items[iIdx - 1], s.items[iIdx]];
                             s.items.forEach((it, i) => it.order = i + 1);
                           }
                        }))}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={iIdx === section.items.length - 1}
                        onClick={() => setLocalDraft(produce(draft, draft => {
                          const s = draft.sections.find(sec => sec.id === section.id);
                          if (s) {
                            [s.items[iIdx], s.items[iIdx + 1]] = [s.items[iIdx + 1], s.items[iIdx]];
                            s.items.forEach((it, i) => it.order = i + 1);
                          }
                        }))}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400"
                        onClick={() => setLocalDraft(produce(draft, draft => {
                          const s = draft.sections.find(sec => sec.id === section.id);
                          if (s) {
                            s.items = s.items.filter(it => it.id !== item.id).map((it, i) => ({ ...it, order: i + 1 }));
                          }
                        }))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Action Area */}
      {onSubmit && (
        <section className="pt-8 border-t border-gray-100 flex justify-end">
          <Button 
            className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (submitText?.includes("Update") ? "Updating..." : "Creating...") : (submitText || "Create Template")}
          </Button>
        </section>
      )}
    </div>
  );
};

