import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MessageSquare,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Drawer from "../../../../components/ui/Drawer";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import FieldComments from "./comments/FieldComments";
import type {
  ConsensusAnswerGroupDto,
  ConsensusFieldDto,
  ConsensusSectionDto,
  ConsensusWorkspaceDto,
  ConsensusValueDto,
  AnswerDetailDto,
  ExtractionCommentDto,
  SubmitConsensusRequestDto,
} from "../../../../types/dataExtraction";
import { FieldTypeEnum, SectionTypeEnum as SectionType } from "../../../../types/dataExtraction";
import type { UseDataExtractionWorkspaceReturn } from "../types";
import ConsensusDocumentDrawer from "./consensusWorkspace/ConsensusDocumentDrawer";
import ConsensusHeader from "./consensusWorkspace/ConsensusHeader";
import ConsensusSidebar from "./consensusWorkspace/ConsensusSidebar";
import ConsensusStateScreen from "./consensusWorkspace/ConsensusStateScreen";
import IsolatedFieldComments from "./comments/IsolatedFieldComments";
import { parseEvidenceCoordinates } from "../utils/evidenceCoordinates";

type ReviewerThreadKey = "reviewer1" | "reviewer2";

interface ActiveConsensusThreadState {
  sectionId: string;
  fieldId: string;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  threadOwnerId: string;
  reviewerKey: ReviewerThreadKey;
  title: string;
}

interface DataExtractionConsensusWorkspaceProps {
  ws: UseDataExtractionWorkspaceReturn;
  dashboardPath: string;
  documentUrl?: string | null;
  onJumpToEvidence?: (coordinatesString: string) => void;
}

const FALLBACK_PDF_URL =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

function normalizeDisplayValue(value: string | null | undefined): string {
  return (value ?? "").trim() || "Not provided";
}

function getAnswerDisplayValue(answer: AnswerDetailDto | null | undefined): string {
  if (!answer) {
    return "Not provided";
  }

  if (answer.isNotReported) {
    return "NR";
  }

  return normalizeDisplayValue(answer.displayValue);
}

function hasEvidenceCoordinates(answer: AnswerDetailDto | null | undefined): boolean {
  return Boolean(answer?.evidenceCoordinates?.trim());
}

function hasFinalEvidenceCoordinates(finalValue: ConsensusValueDto | undefined): boolean {
  return Boolean(finalValue?.evidenceCoordinates?.trim());
}

function parseCommaSeparatedIds(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function buildAnswerStateKey(
  sectionId: string,
  fieldId: string,
  matrixColumnId: string | null,
  matrixRowIndex: number | null
): string {
  const normalizedColumnId = matrixColumnId ?? "root";
  const normalizedRowIndex =
    matrixRowIndex === null || matrixRowIndex === undefined ? "root" : String(matrixRowIndex);

  return `${sectionId}-${fieldId}-${normalizedColumnId}-${normalizedRowIndex}`;
}

function getPrimaryAnswerGroup(
  field: ConsensusFieldDto
): ConsensusAnswerGroupDto | null {
  return field.answers?.[0] ?? null;
}

function getMatrixAnswerGroup(
  field: ConsensusFieldDto,
  matrixRowIndex: number,
  matrixColumnId: string | null
): ConsensusAnswerGroupDto | null {
  const normalizedColumnId = matrixColumnId ?? "";

  return (
    (field.answers ?? []).find(
      (answerGroup) =>
        answerGroup.matrixRowIndex === matrixRowIndex &&
        (answerGroup.matrixColumnId ?? "") === normalizedColumnId
    ) ?? null
  );
}

function answersAreConflicted(
  answer1: AnswerDetailDto | null | undefined,
  answer2: AnswerDetailDto | null | undefined
): boolean {
  if (!answer1 || !answer2) {
    return !!answer1 !== !!answer2;
  }

  if (Boolean(answer1.isNotReported) !== Boolean(answer2.isNotReported)) {
    return true;
  }

  if (answer1.isNotReported && answer2.isNotReported) {
    return false;
  }

  // Compare by optionId if both have it
  if (answer1.optionId && answer2.optionId) {
    return answer1.optionId !== answer2.optionId;
  }

  // Compare stringValue (for text, multiselect)
  if (answer1.stringValue || answer2.stringValue) {
    return (answer1.stringValue ?? "").trim() !== (answer2.stringValue ?? "").trim();
  }

  // Compare numericValue (for integer, decimal)
  if (answer1.numericValue !== null || answer2.numericValue !== null) {
    return answer1.numericValue !== answer2.numericValue;
  }

  // Compare booleanValue
  if (answer1.booleanValue !== null || answer2.booleanValue !== null) {
    return answer1.booleanValue !== answer2.booleanValue;
  }

  return false;
}

function isFieldResolved(finalValue: ConsensusValueDto | undefined): boolean {
  if (!finalValue) {
    return false;
  }

  if (finalValue.isNotReported) {
    return true;
  }

  const hasOptionId = (finalValue.optionId ?? "").trim().length > 0;
  const hasStringValue = (finalValue.stringValue ?? "").trim().length > 0;
  const hasNumericValue =
    finalValue.numericValue !== null && finalValue.numericValue !== undefined;
  const hasBooleanValue =
    finalValue.booleanValue !== null && finalValue.booleanValue !== undefined;

  return hasOptionId || hasStringValue || hasNumericValue || hasBooleanValue;
}

function hasUnresolvedConflict(
  sectionId: string,
  field: ConsensusFieldDto,
  answerGroup: ConsensusAnswerGroupDto | null,
  effectiveFinalAnswers: Record<string, ConsensusValueDto>,
  explicitlyResolvedFields: Set<string>
): boolean {
  if (!answerGroup) {
    return false;
  }

  // If the backend already saved a final answer, it is permanently resolved
  // regardless of whether the value is empty or not
  if (answerGroup.finalAnswer) {
    return false;
  }

  const isConflicted = answersAreConflicted(
    answerGroup.reviewer1Answer,
    answerGroup.reviewer2Answer
  );
  if (!isConflicted) {
    return false;
  }

  const answerKey = buildAnswerStateKey(
    sectionId,
    field.fieldId,
    answerGroup.matrixColumnId ?? null,
    answerGroup.matrixRowIndex ?? null
  );

  // If leader explicitly touched this cell, it's resolved even if empty
  if (explicitlyResolvedFields.has(answerKey)) {
    return false;
  }

  return !isFieldResolved(effectiveFinalAnswers[answerKey]);
}

function countSectionUnresolvedConflicts(
  section: ConsensusSectionDto,
  effectiveFinalAnswers: Record<string, ConsensusValueDto>,
  explicitlyResolvedFields: Set<string>
): number {
  return section.fields.reduce((count, field) => {
    const answerGroups = field.answers ?? [];

    if (answerGroups.length === 0) {
      return count;
    }

    const unresolvedCount = answerGroups.filter((answerGroup) =>
      hasUnresolvedConflict(
        section.sectionId,
        field,
        answerGroup,
        effectiveFinalAnswers,
        explicitlyResolvedFields
      )
    ).length;

    return count + unresolvedCount;
  }, 0);
}

function buildInitialFinalAnswers(
  workspace: ConsensusWorkspaceDto | null
): Record<string, ConsensusValueDto> {
  if (!workspace) {
    return {};
  }

  const answers: Record<string, ConsensusValueDto> = {};

  workspace.sections.forEach((section) => {
    section.fields.forEach((field) => {
      (field.answers ?? []).forEach((answerGroup) => {
        const key = buildAnswerStateKey(
          section.sectionId,
          field.fieldId,
          answerGroup.matrixColumnId ?? null,
          answerGroup.matrixRowIndex ?? null
        );

        let defaultAnswer: AnswerDetailDto | null = null;

        if (answerGroup.finalAnswer) {
          // Completed/read-only flow: respect persisted consensus value from backend.
          defaultAnswer = answerGroup.finalAnswer;
        } else {
          // Ongoing consensus flow: auto-fill only when both reviewers agree.
          const isConflict = answersAreConflicted(
            answerGroup.reviewer1Answer,
            answerGroup.reviewer2Answer
          );
          defaultAnswer = isConflict
            ? null
            : answerGroup.reviewer1Answer ?? answerGroup.reviewer2Answer;
        }

        answers[key] = {
          fieldId: field.fieldId,
          optionId: defaultAnswer?.optionId ?? null,
          stringValue: defaultAnswer?.stringValue ?? null,
          numericValue: defaultAnswer?.numericValue ?? null,
          booleanValue: defaultAnswer?.booleanValue ?? null,
          isNotReported: Boolean(defaultAnswer?.isNotReported),
          matrixColumnId: answerGroup.matrixColumnId ?? null,
          matrixRowIndex: answerGroup.matrixRowIndex ?? null,
          evidenceCoordinates: defaultAnswer?.evidenceCoordinates ?? null,
        };
      });
    });
  });

  return answers;
}

function buildSelectOptions(
  field: ConsensusFieldDto
): Array<{ value: string; label: string }> {
  const options = (field.options ?? [])
    .filter((option) => !!option.optionId)
    .map((option) => ({
      value: option.optionId ?? "",
      label: option.value,
    }));

  return [
    { value: "", label: "Select final answer" },
    ...options,
  ];
}

export default function DataExtractionConsensusWorkspace({
  ws,
  dashboardPath,
  documentUrl,
  onJumpToEvidence,
}: DataExtractionConsensusWorkspaceProps) {
  const navigate = useNavigate();
  const consensusWorkspace = ws.consensusWorkspace;
  const isLoading = ws.isConsensusLoading;

  const currentPaperStatus = useMemo(() => {
    if (!ws.selectedPaperId) {
      return null;
    }

    return ws.getPaperStatus(ws.selectedPaperId);
  }, [ws]);

  const isCompletedPaper = currentPaperStatus === "completed";
  const isCorrectionMode = ws.isCurrentUserLeader && isCompletedPaper;

  // Completed papers are editable only by project leaders for quick corrections.
  const isReadOnly = useMemo(() => {
    if (!ws.selectedPaperId) {
      return true;
    }

    return isCompletedPaper && !ws.isCurrentUserLeader;
  }, [isCompletedPaper, ws]);

  const reviewer1Name = ws.selectedRecord?.draftsByReviewer
    ? Object.keys(ws.selectedRecord.draftsByReviewer)[0] ?? "Reviewer 1"
    : "Reviewer 1";
  const reviewer2Name = ws.selectedRecord?.draftsByReviewer
    ? Object.keys(ws.selectedRecord.draftsByReviewer)[1] ?? "Reviewer 2"
    : "Reviewer 2";

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isDocumentDrawerOpen, setIsDocumentDrawerOpen] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<Record<string, ConsensusValueDto>>({});
  const [explicitlyResolvedFields, setExplicitlyResolvedFields] = useState<Set<string>>(
    new Set()
  );
  const [manualMatrixRows, setManualMatrixRows] = useState<Record<string, number>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<ActiveConsensusThreadState | null>(
    null
  );

  const initialFinalAnswers = useMemo(
    () => buildInitialFinalAnswers(consensusWorkspace),
    [consensusWorkspace]
  );

  const effectiveFinalAnswers = useMemo(
    () => ({ ...initialFinalAnswers, ...finalAnswers }),
    [initialFinalAnswers, finalAnswers]
  );

  const unresolvedConflictCount = useMemo(() => {
    if (!consensusWorkspace) {
      return 0;
    }

    return consensusWorkspace.sections.reduce(
      (count, section) =>
        count +
        countSectionUnresolvedConflicts(
          section,
          effectiveFinalAnswers,
          explicitlyResolvedFields
        ),
      0
    );
  }, [consensusWorkspace, effectiveFinalAnswers, explicitlyResolvedFields]);

  const totalConflictCount = useMemo(
    () => (isReadOnly ? 0 : unresolvedConflictCount),
    [isReadOnly, unresolvedConflictCount]
  );

  const hasUnresolvedConflicts = useMemo(
    () => unresolvedConflictCount > 0,
    [unresolvedConflictCount]
  );

  // Derive the effective active section ID, defaulting to the first section if none is set
  const effectiveActiveSectionId = useMemo(() => {
    if (!consensusWorkspace) {
      return null;
    }

    const sectionIds = consensusWorkspace.sections.map((s) => s.sectionId);
    if (activeSectionId && sectionIds.includes(activeSectionId)) {
      return activeSectionId;
    }

    return sectionIds[0] ?? null;
  }, [activeSectionId, consensusWorkspace]);

  const activeSection = useMemo(() => {
    if (!consensusWorkspace || !effectiveActiveSectionId) {
      return null;
    }
    return consensusWorkspace.sections.find((s) => s.sectionId === effectiveActiveSectionId) ?? null;
  }, [consensusWorkspace, effectiveActiveSectionId]);

  const activeConflictCount = useMemo(() => {
    if (!activeSection) {
      return 0;
    }

    return countSectionUnresolvedConflicts(
      activeSection,
      effectiveFinalAnswers,
      explicitlyResolvedFields
    );
  }, [activeSection, effectiveFinalAnswers, explicitlyResolvedFields]);

  const getSectionConflictCount = useCallback(
    (section: ConsensusSectionDto) =>
      countSectionUnresolvedConflicts(
        section,
        effectiveFinalAnswers,
        explicitlyResolvedFields
      ),
    [effectiveFinalAnswers, explicitlyResolvedFields]
  );

  const getFieldType = useCallback(
    (fieldId: string): FieldTypeEnum | null => {
      if (!consensusWorkspace) {
        return null;
      }

      for (const section of consensusWorkspace.sections) {
        const field = section.fields.find((f) => f.fieldId === fieldId);
        if (field) {
          return field.fieldType;
        }
      }

      return null;
    },
    [consensusWorkspace]
  );

  const normalizedDocumentUrl = normalizeDisplayValue(documentUrl);
  const effectiveDocumentUrl = normalizedDocumentUrl || FALLBACK_PDF_URL;
  const isUsingFallbackDocument = normalizedDocumentUrl.length === 0;

  const handleJumpToEvidence = useCallback(
    (coordinatesString: string) => {
      const normalizedCoordinates = coordinatesString.trim();
      if (!normalizedCoordinates) {
        return;
      }

      if (onJumpToEvidence) {
        onJumpToEvidence(normalizedCoordinates);
        return;
      }

      const coordinates = parseEvidenceCoordinates(normalizedCoordinates);
      if (coordinates.length === 0) {
        return;
      }

      ws.setActiveHighlights(coordinates);
      setIsDocumentDrawerOpen(true);
    },
    [onJumpToEvidence, ws]
  );

  const matrixRowIndexes = useMemo(() => {
    if (!activeSection || activeSection.sectionType !== SectionType.MatrixGrid) {
      return [];
    }

    const rowIndexSet = new Set<number>();

    activeSection.fields.forEach((field) => {
      (field.answers ?? []).forEach((answerGroup) => {
        if (
          typeof answerGroup.matrixRowIndex === "number" &&
          Number.isFinite(answerGroup.matrixRowIndex)
        ) {
          rowIndexSet.add(answerGroup.matrixRowIndex);
        }
      });
    });

    const maxReviewerRowIndex = rowIndexSet.size > 0 ? Math.max(...rowIndexSet) : -1;
    const manualRowCount = manualMatrixRows[activeSection.sectionId] ?? 0;
    const totalRowCount = Math.max(maxReviewerRowIndex + 1, 0) + manualRowCount;

    return Array.from({ length: totalRowCount }, (_, index) => index);
  }, [activeSection, manualMatrixRows]);

  const matrixColumns = useMemo(() => {
    if (!activeSection || activeSection.sectionType !== SectionType.MatrixGrid) {
      return [];
    }

    return activeSection.matrixColumns ?? [];
  }, [activeSection]);

  const handleAddMatrixRow = useCallback((sectionId: string) => {
    setManualMatrixRows((previous) => ({
      ...previous,
      [sectionId]: (previous[sectionId] ?? 0) + 1,
    }));
  }, []);

  const handleFinalAnswerChange = useCallback(
    (
      sectionId: string,
      field: ConsensusFieldDto,
      matrixColumnId: string | null,
      matrixRowIndex: number | null,
      newValue: string
    ) => {
      const key = buildAnswerStateKey(sectionId, field.fieldId, matrixColumnId, matrixRowIndex);

      // Parse the value based on field type
      let parsedValue: ConsensusValueDto;

      if (field.fieldType === FieldTypeEnum.SingleSelect) {
        const selectedOption = (field.options ?? []).find(
          (option) => option.optionId === newValue
        );

        parsedValue = {
          fieldId: field.fieldId,
          optionId: selectedOption?.optionId ?? null,
          stringValue: selectedOption?.value ?? null,
          numericValue: null,
          booleanValue: null,
          isNotReported: false,
          matrixColumnId,
          matrixRowIndex,
          evidenceCoordinates: effectiveFinalAnswers[key]?.evidenceCoordinates ?? null,
        };
      } else if (field.fieldType === FieldTypeEnum.Integer) {
        const numericValue = newValue ? parseInt(newValue, 10) : null;
        parsedValue = {
          fieldId: field.fieldId,
          optionId: null,
          stringValue: null,
          numericValue: Number.isNaN(numericValue) ? null : numericValue,
          booleanValue: null,
          isNotReported: false,
          matrixColumnId,
          matrixRowIndex,
          evidenceCoordinates: effectiveFinalAnswers[key]?.evidenceCoordinates ?? null,
        };
      } else if (field.fieldType === FieldTypeEnum.Decimal) {
        const numericValue = newValue ? parseFloat(newValue) : null;
        parsedValue = {
          fieldId: field.fieldId,
          optionId: null,
          stringValue: null,
          numericValue: Number.isNaN(numericValue) ? null : numericValue,
          booleanValue: null,
          isNotReported: false,
          matrixColumnId,
          matrixRowIndex,
          evidenceCoordinates: effectiveFinalAnswers[key]?.evidenceCoordinates ?? null,
        };
      } else if (field.fieldType === FieldTypeEnum.Boolean) {
        parsedValue = {
          fieldId: field.fieldId,
          optionId: null,
          stringValue: null,
          numericValue: null,
          booleanValue: newValue === "true" ? true : newValue === "false" ? false : null,
          isNotReported: false,
          matrixColumnId,
          matrixRowIndex,
          evidenceCoordinates: effectiveFinalAnswers[key]?.evidenceCoordinates ?? null,
        };
      } else if (field.fieldType === FieldTypeEnum.MultiSelect) {
        const selectedOptionIds = new Set(
          parseCommaSeparatedIds(effectiveFinalAnswers[key]?.stringValue)
        );
        const nextOptionId = newValue.trim();

        if (nextOptionId.length > 0) {
          if (selectedOptionIds.has(nextOptionId)) {
            selectedOptionIds.delete(nextOptionId);
          } else {
            selectedOptionIds.add(nextOptionId);
          }
        }

        parsedValue = {
          fieldId: field.fieldId,
          optionId: null,
          stringValue: Array.from(selectedOptionIds).join(",") || null,
          numericValue: null,
          booleanValue: null,
          isNotReported: false,
          matrixColumnId,
          matrixRowIndex,
          evidenceCoordinates: effectiveFinalAnswers[key]?.evidenceCoordinates ?? null,
        };
      } else {
        // Text, MultiSelect, default
        parsedValue = {
          fieldId: field.fieldId,
          optionId: null,
          stringValue: newValue || null,
          numericValue: null,
          booleanValue: null,
          isNotReported: false,
          matrixColumnId,
          matrixRowIndex,
          evidenceCoordinates: effectiveFinalAnswers[key]?.evidenceCoordinates ?? null,
        };
      }

      setFinalAnswers((prev) => ({
        ...prev,
        [key]: parsedValue,
      }));

      setExplicitlyResolvedFields((previous) => {
        const next = new Set(previous);
        next.add(key);
        return next;
      });
    },
    [effectiveFinalAnswers]
  );

  const handleUseReviewerAnswer = useCallback(
    (
      sectionId: string,
      field: ConsensusFieldDto,
      answerGroup: ConsensusAnswerGroupDto | null,
      reviewerKey: "reviewer1Answer" | "reviewer2Answer"
    ) => {
      const answer = answerGroup?.[reviewerKey] ?? null;

      const key = buildAnswerStateKey(
        sectionId,
        field.fieldId,
        answerGroup?.matrixColumnId ?? null,
        answerGroup?.matrixRowIndex ?? null
      );

      const normalizedMultiSelectStringValue =
        answer?.isNotReported
          ? null
          : field.fieldType === FieldTypeEnum.MultiSelect
          ? (answer?.stringValue ?? answer?.displayValue ?? "").trim() || null
          : answer?.stringValue ?? null;

      setFinalAnswers((prev) => ({
        ...prev,
        [key]: {
          fieldId: field.fieldId,
          optionId: answer?.optionId ?? null,
          stringValue: normalizedMultiSelectStringValue,
          numericValue: answer?.numericValue ?? null,
          booleanValue: answer?.booleanValue ?? null,
          isNotReported: Boolean(answer?.isNotReported),
          matrixColumnId: answerGroup?.matrixColumnId ?? null,
          matrixRowIndex: answerGroup?.matrixRowIndex ?? null,
          evidenceCoordinates: answer?.evidenceCoordinates ?? null,
        },
      }));

      setExplicitlyResolvedFields((previous) => {
        const next = new Set(previous);
        next.add(key);
        return next;
      });
    },
    []
  );

  const handleFinalAnswerNotReportedChange = useCallback(
    (
      sectionId: string,
      field: ConsensusFieldDto,
      matrixColumnId: string | null,
      matrixRowIndex: number | null,
      isNotReported: boolean
    ) => {
      const key = buildAnswerStateKey(sectionId, field.fieldId, matrixColumnId, matrixRowIndex);

      setFinalAnswers((previous) => {
        const existing = previous[key];

        return {
          ...previous,
          [key]: {
            fieldId: field.fieldId,
            optionId: isNotReported ? null : (existing?.optionId ?? null),
            stringValue: isNotReported ? null : (existing?.stringValue ?? null),
            numericValue: isNotReported ? null : (existing?.numericValue ?? null),
            booleanValue: isNotReported ? null : (existing?.booleanValue ?? null),
            isNotReported,
            matrixColumnId,
            matrixRowIndex,
            evidenceCoordinates: isNotReported
              ? null
              : (existing?.evidenceCoordinates ?? null),
          },
        };
      });

      setExplicitlyResolvedFields((previous) => {
        const next = new Set(previous);
        next.add(key);
        return next;
      });
    },
    []
  );

  const renderFinalDecisionControl = useCallback(
    (
      sectionId: string,
      field: ConsensusFieldDto,
      matrixColumnId: string | null,
      matrixRowIndex: number | null,
      finalValue: ConsensusValueDto | undefined,
      compact = false
    ) => {
      const isNotReported = Boolean(finalValue?.isNotReported);
      const controlDisabled = isReadOnly || isNotReported;
      let control: ReactNode;

      if (field.fieldType === FieldTypeEnum.SingleSelect) {
        control = (
          <Select
            value={finalValue?.optionId ?? ""}
            onChange={(event) =>
              handleFinalAnswerChange(sectionId, field, matrixColumnId, matrixRowIndex, event.target.value)
            }
            options={buildSelectOptions(field)}
            disabled={controlDisabled}
          />
        );
      } else if (field.fieldType === FieldTypeEnum.Boolean) {
        control = (
          <Select
            value={finalValue?.booleanValue === null ? "" : String(finalValue?.booleanValue)}
            onChange={(event) =>
              handleFinalAnswerChange(sectionId, field, matrixColumnId, matrixRowIndex, event.target.value)
            }
            options={[
              { value: "", label: "Select final answer" },
              { value: "true", label: "True" },
              { value: "false", label: "False" },
            ]}
            disabled={controlDisabled}
          />
        );
      } else if (field.fieldType === FieldTypeEnum.MultiSelect) {
        const selectedOptionIds = new Set(parseCommaSeparatedIds(finalValue?.stringValue));

        control = (
          <div
            className={
              compact
                ? "max-h-32 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2"
                : "max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3"
            }
          >
            {(field.options ?? []).map((option) => {
              const optionId = option.optionId ?? "";
              const isChecked = optionId.length > 0 && selectedOptionIds.has(optionId);

              return (
                <label
                  key={optionId || option.value}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      handleFinalAnswerChange(sectionId, field, matrixColumnId, matrixRowIndex, optionId)
                    }
                    disabled={controlDisabled || optionId.length === 0}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option.value}</span>
                </label>
              );
            })}
          </div>
        );
      } else if (field.fieldType === FieldTypeEnum.Integer) {
        control = (
          <Input
            type="number"
            step="1"
            value={finalValue?.numericValue ?? ""}
            onChange={(event) =>
              handleFinalAnswerChange(sectionId, field, matrixColumnId, matrixRowIndex, event.target.value)
            }
            placeholder="Enter final decision"
            className="bg-white"
            disabled={controlDisabled}
          />
        );
      } else if (field.fieldType === FieldTypeEnum.Decimal) {
        control = (
          <Input
            type="number"
            step="any"
            value={finalValue?.numericValue ?? ""}
            onChange={(event) =>
              handleFinalAnswerChange(sectionId, field, matrixColumnId, matrixRowIndex, event.target.value)
            }
            placeholder="Enter final decision"
            className="bg-white"
            disabled={controlDisabled}
          />
        );
      } else {
        control = (
          <Input
            type="text"
            value={finalValue?.stringValue ?? ""}
            onChange={(event) =>
              handleFinalAnswerChange(sectionId, field, matrixColumnId, matrixRowIndex, event.target.value)
            }
            placeholder="Enter final decision"
            className="bg-white"
            disabled={controlDisabled}
          />
        );
      }

      return (
        <div className="space-y-2">
          {!isReadOnly ? (
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={isNotReported}
                onChange={(event) =>
                  handleFinalAnswerNotReportedChange(
                    sectionId,
                    field,
                    matrixColumnId,
                    matrixRowIndex,
                    event.target.checked
                  )
                }
                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
              />
              Not Reported
            </label>
          ) : null}

          {isNotReported ? (
            <p className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              NR
            </p>
          ) : null}

          {control}
        </div>
      );
    },
    [
      handleFinalAnswerChange,
      handleFinalAnswerNotReportedChange,
      isReadOnly,
    ]
  );

  const submitConsensusNow = useCallback(() => {
    if (!ws.selectedPaperId || !consensusWorkspace) {
      return;
    }

    const values: ConsensusValueDto[] = [];

    // Iterate over all effective final answers and build payload
    Object.values(effectiveFinalAnswers).forEach((answer) => {
      const fieldType = getFieldType(answer.fieldId);

      if (answer.isNotReported) {
        values.push({
          fieldId: answer.fieldId,
          optionId: null,
          stringValue: null,
          numericValue: null,
          booleanValue: null,
          isNotReported: true,
          matrixColumnId: answer.matrixColumnId ?? null,
          matrixRowIndex: answer.matrixRowIndex ?? null,
          evidenceCoordinates: answer.evidenceCoordinates ?? null,
        });
        return;
      }

      if (fieldType === FieldTypeEnum.MultiSelect) {
        // Parse comma-separated IDs from stringValue
        const selectedOptionIds = parseCommaSeparatedIds(answer.stringValue);

        if (selectedOptionIds.length > 0) {
          // Push a separate object for each selected optionId
          selectedOptionIds.forEach((optionId) => {
            values.push({
              fieldId: answer.fieldId,
              optionId: optionId,
              stringValue: null,
              numericValue: null,
              booleanValue: null,
              isNotReported: false,
              matrixColumnId: answer.matrixColumnId ?? null,
              matrixRowIndex: answer.matrixRowIndex ?? null,
              evidenceCoordinates: answer.evidenceCoordinates ?? null,
            });
          });
        }
        // If selectedOptionIds is empty, do not push anything.
        // The backend's EAV model represents empty selection by the absence of records.
      } else {
        // Non-MultiSelect: push the answer directly as-is
        // This preserves explicitly selected empty values
        values.push(answer);
      }
    });

    const payload: SubmitConsensusRequestDto = { values };
    ws.submitConsensus(ws.selectedPaperId, payload);
  }, [effectiveFinalAnswers, consensusWorkspace, ws, getFieldType]);

  const handleSaveAndComplete = useCallback(() => {
    if (hasUnresolvedConflicts) {
      setIsConfirmModalOpen(true);
      return;
    }

    submitConsensusNow();
  }, [hasUnresolvedConflicts, submitConsensusNow]);

  const handleSubmitFieldComment = useCallback(
    async (
      fieldId: string,
      threadOwnerId: string,
      matrixColumnId: string | null,
      matrixRowIndex: number | null,
      content: string
    ) => {
      if (!ws.selectedPaperId) {
        return;
      }

      await ws.addFieldComment(ws.selectedPaperId, fieldId, {
        threadOwnerId,
        content,
        matrixColumnId,
        matrixRowIndex,
      });
    },
    [ws]
  );

  const renderFinalDecisionCommentButton = useCallback(
    (
      field: ConsensusFieldDto,
      matrixColumnId: string | null,
      matrixRowIndex: number | null,
      comments: ExtractionCommentDto[],
      titleSuffix?: string
    ) => {
      if (!ws.selectedPaperId || !ws.currentUserId) {
        return null;
      }

      const suffix = titleSuffix?.trim() ?? "";
      const title =
        suffix.length > 0
          ? `Final Decision - ${field.name} / ${suffix}`
          : `Final Decision - ${field.name}`;

      return (
        <FieldComments
          title={title}
          comments={comments}
          currentUserId={ws.currentUserId}
          isSending={ws.isAddingFieldComment}
          onSendComment={(content) =>
            handleSubmitFieldComment(
              field.fieldId,
              ws.currentUserId ?? "",
              matrixColumnId,
              matrixRowIndex,
              content
            )
          }
        />
      );
    },
    [handleSubmitFieldComment, ws.currentUserId, ws.isAddingFieldComment, ws.selectedPaperId]
  );

  const openThread = useCallback(
    (
      reviewerKey: ReviewerThreadKey,
      sectionId: string,
      fieldId: string,
      fieldName: string,
      matrixColumnId: string | null,
      matrixRowIndex: number | null,
      columnName?: string
    ) => {
      const threadOwnerId =
        reviewerKey === "reviewer1"
          ? consensusWorkspace?.reviewer1Id ?? ""
          : consensusWorkspace?.reviewer2Id ?? "";

      if (!threadOwnerId) {
        return;
      }

      const baseTitle =
        reviewerKey === "reviewer1"
          ? `${reviewer1Name} Thread`
          : `${reviewer2Name} Thread`;
      const targetTitle =
        matrixRowIndex === null
          ? `${baseTitle} - ${fieldName}`
          : `${baseTitle} - ${fieldName}${columnName ? ` / ${columnName}` : ""} (Item #${matrixRowIndex + 1})`;

      setActiveThread({
        sectionId,
        fieldId,
        matrixColumnId,
        matrixRowIndex,
        threadOwnerId,
        reviewerKey,
        title: targetTitle,
      });
    },
    [consensusWorkspace, reviewer1Name, reviewer2Name]
  );

  const activeThreadComments = useMemo(() => {
    if (!consensusWorkspace || !activeThread) {
      return [];
    }

    const section = consensusWorkspace.sections.find(
      (item) => item.sectionId === activeThread.sectionId
    );
    const field = section?.fields.find((item) => item.fieldId === activeThread.fieldId);
    const answerGroup = (field?.answers ?? []).find(
      (group) =>
        (group.matrixColumnId ?? null) === activeThread.matrixColumnId &&
        (group.matrixRowIndex ?? null) === activeThread.matrixRowIndex
    );

    if (!answerGroup) {
      return [];
    }

    return activeThread.reviewerKey === "reviewer1"
      ? answerGroup.reviewer1Answer?.comments ?? []
      : answerGroup.reviewer2Answer?.comments ?? [];
  }, [activeThread, consensusWorkspace]);

  if (isLoading) {
    return (
      <ConsensusStateScreen
        onBack={() => navigate(dashboardPath)}
        isLoading
      />
    );
  }

  if (!consensusWorkspace || !activeSection) {
    return (
      <ConsensusStateScreen
        onBack={() => navigate(dashboardPath)}
        message="No consensus data available for this study."
      />
    );
  }

  const paperTitle = ws.selectedStudy?.title ?? "Unknown Study";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      <ConsensusHeader
        paperTitle={paperTitle}
        onBack={() => navigate(dashboardPath)}
        onOpenDocument={() => setIsDocumentDrawerOpen(true)}
      />

      <main className="flex flex-1 min-h-0">
        <ConsensusSidebar
          sections={consensusWorkspace.sections}
          activeSectionId={activeSection.sectionId}
          totalConflictCount={totalConflictCount}
          getSectionConflictCount={getSectionConflictCount}
          onSectionChange={setActiveSectionId}
        />

        <section className="w-[80%] overflow-y-auto p-6">
          {isCorrectionMode && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Correction Mode
            </div>
          )}

          {isReadOnly && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <p className="font-medium">💙 Read-Only Mode</p>
              <p className="mt-1 text-blue-700">This paper's extraction is completed. You are viewing the consensus in read-only mode.</p>
            </div>
          )}

          <Card className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeSection.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Compare Reviewer 1 and Reviewer 2 values, then set the final decision.
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {activeConflictCount} remaining conflicts in this section
              </span>
            </div>

            {activeSection.sectionType === SectionType.FlatForm ? (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Field Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {reviewer1Name}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {reviewer2Name}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Final Decision
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {activeSection.fields.map((field) => {
                      const answerGroup = getPrimaryAnswerGroup(field);
                      const rev1Answer = answerGroup?.reviewer1Answer ?? null;
                      const rev2Answer = answerGroup?.reviewer2Answer ?? null;
                      const rowHasConflict = answersAreConflicted(
                        rev1Answer,
                        rev2Answer
                      );
                      const sectionKey = buildAnswerStateKey(
                        activeSection.sectionId,
                        field.fieldId,
                        null,
                        null
                      );
                      const finalValue = effectiveFinalAnswers[sectionKey];
                      const rowHasUnresolvedConflict = hasUnresolvedConflict(
                        activeSection.sectionId,
                        field,
                        answerGroup,
                        effectiveFinalAnswers,
                        explicitlyResolvedFields
                      );
                      const rowConflictResolved =
                        rowHasConflict && !rowHasUnresolvedConflict;

                      return (
                        <tr
                          key={field.fieldId}
                          className={
                            rowHasUnresolvedConflict
                              ? "border-t border-amber-100 bg-amber-50"
                              : rowConflictResolved
                                ? "border-t border-emerald-100 bg-emerald-50/40"
                              : "border-t border-slate-100 bg-white"
                          }
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-2">
                              {rowHasUnresolvedConflict ? (
                                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
                              ) : (
                                <CheckCircle2
                                  className={
                                    rowConflictResolved
                                      ? "mt-0.5 h-4 w-4 text-emerald-600 shrink-0"
                                      : "mt-0.5 h-4 w-4 text-green-600 shrink-0"
                                  }
                                />
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {field.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {rowHasUnresolvedConflict
                                    ? "Conflict detected"
                                    : rowConflictResolved
                                      ? "Conflict resolved"
                                      : "Answers match"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                              <div className="min-w-0 flex-1">
                                {getAnswerDisplayValue(rev1Answer)}
                              </div>
                              {hasEvidenceCoordinates(rev1Answer) ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleJumpToEvidence(
                                      rev1Answer?.evidenceCoordinates ?? ""
                                    )
                                  }
                                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                  aria-label="View evidence"
                                  title="View evidence"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() =>
                                  openThread(
                                    "reviewer1",
                                    activeSection.sectionId,
                                    field.fieldId,
                                    field.name,
                                    null,
                                    null
                                  )
                                }
                                className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                aria-label="Open reviewer 1 thread"
                                title="Open reviewer 1 thread"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                {(rev1Answer?.comments?.length ?? 0) > 0 ? (
                                  <span className="absolute -right-1 -top-1 inline-flex min-w-3.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                                    {rev1Answer?.comments?.length}
                                  </span>
                                ) : null}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                              <div className="min-w-0 flex-1">
                                {getAnswerDisplayValue(rev2Answer)}
                              </div>
                              {hasEvidenceCoordinates(rev2Answer) ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleJumpToEvidence(
                                      rev2Answer?.evidenceCoordinates ?? ""
                                    )
                                  }
                                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                  aria-label="View evidence"
                                  title="View evidence"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() =>
                                  openThread(
                                    "reviewer2",
                                    activeSection.sectionId,
                                    field.fieldId,
                                    field.name,
                                    null,
                                    null
                                  )
                                }
                                className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                aria-label="Open reviewer 2 thread"
                                title="Open reviewer 2 thread"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                {(rev2Answer?.comments?.length ?? 0) > 0 ? (
                                  <span className="absolute -right-1 -top-1 inline-flex min-w-3.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                                    {rev2Answer?.comments?.length}
                                  </span>
                                ) : null}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="space-y-2">
                              {renderFinalDecisionControl(
                                activeSection.sectionId,
                                field,
                                null,
                                null,
                                finalValue
                              )}

                              {hasFinalEvidenceCoordinates(finalValue) ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleJumpToEvidence(finalValue?.evidenceCoordinates ?? "")
                                  }
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                  aria-label="View final evidence"
                                  title="View final evidence"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              ) : null}

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-500">
                                  Final decision note
                                </span>
                                {renderFinalDecisionCommentButton(
                                  field,
                                  null,
                                  null,
                                  answerGroup?.finalAnswer?.comments ?? []
                                )}
                              </div>

                              {!isReadOnly && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUseReviewerAnswer(
                                        activeSection.sectionId,
                                        field,
                                        answerGroup,
                                        "reviewer1Answer"
                                      )
                                    }
                                    className="!px-2 text-xs"
                                  >
                                    Use R1
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUseReviewerAnswer(
                                        activeSection.sectionId,
                                        field,
                                        answerGroup,
                                        "reviewer2Answer"
                                      )
                                    }
                                    className="!px-2 text-xs"
                                  >
                                    Use R2
                                  </Button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {matrixRowIndexes.length === 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-[980px] w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-left">
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Field
                          </th>
                          {matrixColumns.map((column, columnIndex) => (
                            <th
                              key={column.columnId ?? `matrix-column-${columnIndex}`}
                              className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                            >
                              {column.name}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="border-t border-slate-200">
                          <td
                            colSpan={Math.max(matrixColumns.length + 1, 1)}
                            className="bg-white px-3 py-4 text-sm text-slate-500"
                          >
                            No matrix rows yet. Use + Add Item to start consensus.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  matrixRowIndexes.map((rowIndex) => (
                    <div
                      key={`${activeSection.sectionId}-matrix-row-${rowIndex}`}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <h3 className="mb-3 text-sm font-semibold text-slate-800">
                        Item #{rowIndex + 1}
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="min-w-[980px] w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-left">
                              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Field
                              </th>
                              {matrixColumns.map((column, columnIndex) => (
                                <th
                                  key={column.columnId ?? `matrix-column-${columnIndex}`}
                                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                                >
                                  {column.name}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {activeSection.fields.map((field) => (
                              <tr key={`${field.fieldId}-row-${rowIndex}`} className="border-t border-slate-200">
                                <td className="bg-white px-3 py-3 align-top text-sm font-semibold text-slate-800">
                                  {field.name}
                                </td>

                                {matrixColumns.map((column, columnIndex) => {
                                  const answerGroup = getMatrixAnswerGroup(
                                    field,
                                    rowIndex,
                                    column.columnId ?? null
                                  );
                                  const rev1Answer = answerGroup?.reviewer1Answer ?? null;
                                  const rev2Answer = answerGroup?.reviewer2Answer ?? null;
                                  const hasConflict = answersAreConflicted(rev1Answer, rev2Answer);
                                  const hasReviewerData = !!answerGroup;
                                  const answerKey = buildAnswerStateKey(
                                    activeSection.sectionId,
                                    field.fieldId,
                                    column.columnId ?? null,
                                    rowIndex
                                  );
                                  const finalValue = effectiveFinalAnswers[answerKey];
                                  const unresolved = hasUnresolvedConflict(
                                    activeSection.sectionId,
                                    field,
                                    answerGroup,
                                    effectiveFinalAnswers,
                                    explicitlyResolvedFields
                                  );
                                  const rowConflictResolved = hasConflict && !unresolved;

                                  return (
                                    <td
                                      key={`${field.fieldId}-${column.columnId ?? `column-${columnIndex}`}`}
                                      className={
                                        unresolved
                                          ? "bg-amber-50 px-3 py-3 align-top"
                                          : "bg-white px-3 py-3 align-top"
                                      }
                                    >
                                      <div className="space-y-2">
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            {reviewer1Name}
                                          </p>
                                          <div className="mt-1 flex items-start gap-2 text-xs text-slate-700">
                                            <p className="min-w-0 flex-1">
                                              {getAnswerDisplayValue(rev1Answer)}
                                            </p>
                                            {hasEvidenceCoordinates(rev1Answer) ? (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleJumpToEvidence(
                                                    rev1Answer?.evidenceCoordinates ?? ""
                                                  )
                                                }
                                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                aria-label="View evidence"
                                                title="View evidence"
                                              >
                                                <Eye className="h-3 w-3" />
                                              </button>
                                            ) : null}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openThread(
                                                  "reviewer1",
                                                  activeSection.sectionId,
                                                  field.fieldId,
                                                  field.name,
                                                  column.columnId ?? null,
                                                  rowIndex,
                                                  column.name
                                                )
                                              }
                                              className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                              aria-label="Open reviewer 1 thread"
                                              title="Open reviewer 1 thread"
                                            >
                                              <MessageSquare className="h-3 w-3" />
                                              {(rev1Answer?.comments?.length ?? 0) > 0 ? (
                                                <span className="absolute -right-1 -top-1 inline-flex min-w-3.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                                                  {rev1Answer?.comments?.length}
                                                </span>
                                              ) : null}
                                            </button>
                                          </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            {reviewer2Name}
                                          </p>
                                          <div className="mt-1 flex items-start gap-2 text-xs text-slate-700">
                                            <p className="min-w-0 flex-1">
                                              {getAnswerDisplayValue(rev2Answer)}
                                            </p>
                                            {hasEvidenceCoordinates(rev2Answer) ? (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleJumpToEvidence(
                                                    rev2Answer?.evidenceCoordinates ?? ""
                                                  )
                                                }
                                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                aria-label="View evidence"
                                                title="View evidence"
                                              >
                                                <Eye className="h-3 w-3" />
                                              </button>
                                            ) : null}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openThread(
                                                  "reviewer2",
                                                  activeSection.sectionId,
                                                  field.fieldId,
                                                  field.name,
                                                  column.columnId ?? null,
                                                  rowIndex,
                                                  column.name
                                                )
                                              }
                                              className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                              aria-label="Open reviewer 2 thread"
                                              title="Open reviewer 2 thread"
                                            >
                                              <MessageSquare className="h-3 w-3" />
                                              {(rev2Answer?.comments?.length ?? 0) > 0 ? (
                                                <span className="absolute -right-1 -top-1 inline-flex min-w-3.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                                                  {rev2Answer?.comments?.length}
                                                </span>
                                              ) : null}
                                            </button>
                                          </div>
                                        </div>

                                        {renderFinalDecisionControl(
                                          activeSection.sectionId,
                                          field,
                                          column.columnId ?? null,
                                          rowIndex,
                                          finalValue,
                                          true
                                        )}

                                        {hasFinalEvidenceCoordinates(finalValue) ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleJumpToEvidence(
                                                finalValue?.evidenceCoordinates ?? ""
                                              )
                                            }
                                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            aria-label="View final evidence"
                                            title="View final evidence"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </button>
                                        ) : null}

                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-[11px] font-medium text-slate-500">
                                            Final decision note
                                          </span>
                                          {renderFinalDecisionCommentButton(
                                            field,
                                            column.columnId ?? null,
                                            rowIndex,
                                            answerGroup?.finalAnswer?.comments ?? [],
                                            column.name
                                          )}
                                        </div>

                                        {unresolved ? (
                                          <div className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Conflict detected
                                          </div>
                                        ) : rowConflictResolved ? (
                                          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-800">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Conflict resolved
                                          </div>
                                        ) : (
                                          <div className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            {hasReviewerData
                                              ? "Answers match"
                                              : `Manual item #${rowIndex + 1}`}
                                          </div>
                                        )}

                                        {!isReadOnly && hasReviewerData && (
                                          <div className="flex gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="!px-2 text-xs"
                                              onClick={() =>
                                                handleUseReviewerAnswer(
                                                  activeSection.sectionId,
                                                  field,
                                                  answerGroup,
                                                  "reviewer1Answer"
                                                )
                                              }
                                            >
                                              Use R1
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="!px-2 text-xs"
                                              onClick={() =>
                                                handleUseReviewerAnswer(
                                                  activeSection.sectionId,
                                                  field,
                                                  answerGroup,
                                                  "reviewer2Answer"
                                                )
                                              }
                                            >
                                              Use R2
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}

                {!isReadOnly && (
                  <div className="border-t border-slate-100 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleAddMatrixRow(activeSection.sectionId)}
                      className="w-full"
                    >
                      + Add Item
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className="sticky bottom-0 mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <p
              className={
                hasUnresolvedConflicts && !isReadOnly
                  ? "text-sm font-medium text-amber-700"
                  : "text-sm text-slate-500"
              }
            >
              {isReadOnly
                ? "This consensus has been finalized."
                : isCorrectionMode
                  ? "Review and update finalized consensus data for synthesis readiness."
                : hasUnresolvedConflicts
                  ? `Please resolve all ${unresolvedConflictCount} remaining conflicts before completing.`
                  : "Resolve conflicts and confirm final answers for this study."}
            </p>
            {!isReadOnly && (
              <Button
                onClick={handleSaveAndComplete}
                isLoading={ws.isSubmittingConsensus}
                disabled={ws.isSubmittingConsensus}
              >
                {isCompletedPaper ? "Update Final Data" : "Save & Complete Consensus"}
              </Button>
            )}
          </div>
        </section>
      </main>

      {isConfirmModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Confirm Save With Unresolved Conflicts
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              There are still {unresolvedConflictCount} unresolved conflicts. If you proceed, empty values will be submitted for these fields. Are you sure you want to {isCompletedPaper ? "update the finalized consensus data" : "complete this consensus"}?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={ws.isSubmittingConsensus}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  submitConsensusNow();
                }}
                isLoading={ws.isSubmittingConsensus}
                disabled={ws.isSubmittingConsensus}
              >
                Confirm Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Drawer
        isOpen={Boolean(activeThread)}
        onClose={() => setActiveThread(null)}
        title={activeThread?.title ?? "Field Thread"}
        side="right"
        maxWidth="max-w-xl"
      >
        {activeThread ? (
          <IsolatedFieldComments
            comments={activeThreadComments}
            isLoading={ws.isAddingFieldComment}
            onAddComment={(content) =>
              handleSubmitFieldComment(
                activeThread.fieldId,
                activeThread.threadOwnerId,
                activeThread.matrixColumnId,
                activeThread.matrixRowIndex,
                content
              )
            }
          />
        ) : null}
      </Drawer>

      <ConsensusDocumentDrawer
        isOpen={isDocumentDrawerOpen}
        effectiveDocumentUrl={effectiveDocumentUrl}
        isUsingFallbackDocument={isUsingFallbackDocument}
        activeHighlights={ws.activeHighlights}
        onClose={() => setIsDocumentDrawerOpen(false)}
      />
    </div>
  );
}
