import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../../../components/ui/Button";
import { toastError } from "../../../../utils/toast";
import {
  FieldTypeEnum,
  SectionTypeEnum,
  type AnswerDetailDto,
  type ExtractionCommentDto,
  type ExtractedValueDto,
  type ExtractionFieldDto,
  type ExtractionSectionDto,
  type SubmitExtractionRequestDto,
} from "../../../../types/dataExtraction";
import type { PaperWithDecisionsResponse } from "../../../../types/studySelection";
import type { UseDataExtractionWorkspaceReturn } from "../types.ts";
import FieldComments from "./comments/FieldComments";
import ReviewerFormPane from "./reviewerWorkspace/ReviewerFormPane";
import ReviewerPdfPanel from "./reviewerWorkspace/ReviewerPdfPanel";
import ReviewerSidebar from "./reviewerWorkspace/ReviewerSidebar";
import {
  FALLBACK_PDF_URL,
  flattenTemplateFields,
  getMatrixFieldKey,
  getSectionId,
  mapExtractedValueToFormValue,
  mapFormValueToExtractedValue,
  MATRIX_COLUMN_ID_KEY,
  MATRIX_ITEM_NAME_KEY,
  renderInputControl,
  toDomId,
} from "./reviewerWorkspace/reviewerFormUtils";
import type {
  FieldNotReportedState,
  FlattenedTemplateField,
  FormFieldValue,
  FormFieldState,
  MatrixFieldNotReportedState,
} from "./reviewerWorkspace/types";
import {
  parseEvidenceCoordinates,
  mergeEvidenceCoordinates,
} from "../utils/evidenceCoordinates";

interface DataExtractionReviewerWorkspaceProps {
  ws: UseDataExtractionWorkspaceReturn;
  dashboardPath: string;
  documentUrl?: string | null;
}

interface EvidenceTargetState {
  fieldKey: string;
  sectionId: string | null;
  rowIndex: number | null;
}

const METADATA_FIELD_MAP: Record<string, keyof PaperWithDecisionsResponse> = {
  author: "authors",
  "study title": "title",
  year: "publicationYear",
  "doi/url": "doi",
  "publication venue (e.g., icse, tse, fse)": "journal",
  "publisher/database (e.g., ieee, acm, springer)": "publisher",
};

function isValueEmpty(value: FormFieldValue | undefined | null): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (typeof value === "number") {
    return !Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

function resolveMetadataFieldValue(
  fieldName: string,
  paper: PaperWithDecisionsResponse
): FormFieldValue {
  const normalizedFieldName = fieldName.trim().toLowerCase();

  if (normalizedFieldName === "doi/url") {
    const doi = paper.doi?.trim();
    if (doi) {
      return doi;
    }

    return paper.url?.trim() || null;
  }

  if (normalizedFieldName === "publication venue (e.g., icse, tse, fse)") {
    return paper.journal?.trim() || paper.conferenceName?.trim() || null;
  }

  if (
    normalizedFieldName === "publisher/database (e.g., ieee, acm, springer)"
  ) {
    return paper.publisher?.trim() || paper.source?.trim() || null;
  }

  const mappedKey = METADATA_FIELD_MAP[normalizedFieldName];
  if (!mappedKey) {
    return null;
  }

  const rawValue = paper[mappedKey];

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof rawValue === "number") {
    return Number.isFinite(rawValue) ? rawValue : null;
  }

  return null;
}

function createFieldState(
  value: FormFieldValue,
  evidenceCoordinates: string | null = null
): FormFieldState {
  return {
    value,
    evidenceCoordinates,
  };
}

function buildCommentKey(
  sectionId: string,
  fieldId: string,
  matrixColumnId: string | null,
  matrixRowIndex: number | null
): string {
  return `${sectionId}::${fieldId}::${matrixColumnId ?? "root"}::${
    matrixRowIndex === null || matrixRowIndex === undefined
      ? "root"
      : String(matrixRowIndex)
  }`;
}

export default function DataExtractionReviewerWorkspace({
  ws,
  dashboardPath,
  documentUrl,
}: DataExtractionReviewerWorkspaceProps) {
  const navigate = useNavigate();
  const selectedPaperId = ws.selectedPaperId;
  const submitExtraction = ws.submitExtraction;
  const isSubmittingExtraction = ws.isSubmittingExtraction;
  const paperStatus = selectedPaperId
    ? ws.getPaperStatus(selectedPaperId)
    : "todo";
  const isWorkspaceLocked =
    !!selectedPaperId &&
    (paperStatus === "awaiting-consensus" ||
      paperStatus === "completed" ||
      ws.hasCurrentUserSubmitted(selectedPaperId));
  const normalizedDocumentUrl = (documentUrl ?? "").trim();
  const effectiveDocumentUrl = normalizedDocumentUrl || FALLBACK_PDF_URL;
  const isUsingFallbackDocument = normalizedDocumentUrl.length === 0;

  const [activeSectionIdState, setActiveSectionIdState] = useState("");
  const [formValues, setFormValues] = useState<Record<string, FormFieldState>>({});
  const [notReportedFields, setNotReportedFields] =
    useState<FieldNotReportedState>({});
  const [matrixValues, setMatrixValues] = useState<
    Record<string, Record<string, FormFieldState>[]>
  >({});
  const [matrixNotReportedFields, setMatrixNotReportedFields] =
    useState<MatrixFieldNotReportedState>({});
  const [localCommentsByKey, setLocalCommentsByKey] = useState<
    Record<string, ExtractionCommentDto[]>
  >({});
  const [activeEvidenceTarget, setActiveEvidenceTarget] =
    useState<EvidenceTargetState | null>(null);
  const hasAutoFilledPaperRef = useRef<string | null>(null);
  const hasHydratedReviewerWorkspaceRef = useRef<string | null>(null);

  const sections = useMemo<ExtractionSectionDto[]>(
    () => ws.selectedTemplate?.sections ?? [],
    [ws.selectedTemplate]
  );

  const sectionById = useMemo(() => {
    const map: Record<string, ExtractionSectionDto> = {};

    sections.forEach((section) => {
      const sectionId = getSectionId(section);
      if (sectionId) {
        map[sectionId] = section;
      }
    });

    return map;
  }, [sections]);

  const commentMap = useMemo(() => {
    const map = new Map<string, ExtractionCommentDto[]>();
    const reviewerWorkspace = ws.reviewerWorkspace;

    if (!reviewerWorkspace) {
      return map;
    }

    reviewerWorkspace.sections.forEach((section) => {
      section.fields.forEach((field) => {
        (field.answers ?? []).forEach((answerGroup) => {
          const key = buildCommentKey(
            section.sectionId,
            field.fieldId,
            answerGroup.matrixColumnId ?? null,
            answerGroup.matrixRowIndex ?? null
          );

          map.set(key, answerGroup.answer?.comments ?? []);
        });
      });
    });

    return map;
  }, [ws.reviewerWorkspace]);

  const fieldContextById = useMemo(() => {
    const map = new Map<
      string,
      {
        field: ExtractionFieldDto;
        sectionId: string;
      }
    >();

    const collectFields = (fields: ExtractionFieldDto[], sectionId: string) => {
      for (const field of fields) {
        if (field.fieldId) {
          map.set(field.fieldId, {
            field,
            sectionId,
          });
        }

        if (field.subFields?.length) {
          collectFields(field.subFields, sectionId);
        }
      }
    };

    sections.forEach((section) => {
      const sectionId = getSectionId(section);
      if (sectionId) {
        collectFields(section.fields ?? [], sectionId);
      }
    });

    return map;
  }, [sections]);

  const activeSectionId = useMemo(() => {
    if (
      activeSectionIdState &&
      sections.some((section) => getSectionId(section) === activeSectionIdState)
    ) {
      return activeSectionIdState;
    }

    return sections[0] ? getSectionId(sections[0]) : "";
  }, [activeSectionIdState, sections]);

  const activeSection = useMemo(
    () =>
      sections.find((section) => getSectionId(section) === activeSectionId) ??
      sections[0] ??
      null,
    [activeSectionId, sections]
  );

  const fieldById = useMemo(() => {
    const fieldMap = new Map<string, ExtractionFieldDto>();

    const collectFields = (fields: ExtractionFieldDto[]) => {
      for (const field of fields) {
        if (field.fieldId) {
          fieldMap.set(field.fieldId, field);
        }

        if (field.subFields?.length) {
          collectFields(field.subFields);
        }
      }
    };

    for (const section of sections) {
      collectFields(section.fields || []);
    }

    return fieldMap;
  }, [sections]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMatrixValues((previous) => {
        let hasChanges = false;
        const next = { ...previous };

        for (const section of sections) {
          if (section.sectionType !== SectionTypeEnum.MatrixGrid) {
            continue;
          }

          if (!section.matrixColumns || section.matrixColumns.length === 0) {
            continue;
          }

          const sectionId = getSectionId(section);
          const existingRows = next[sectionId] ?? [];

          if (existingRows.length > 0) {
            continue;
          }

          next[sectionId] = section.matrixColumns.map((column) => ({
            [MATRIX_ITEM_NAME_KEY]: createFieldState(column.name),
            [MATRIX_COLUMN_ID_KEY]: createFieldState(column.columnId ?? null),
          }));
          hasChanges = true;
        }

        return hasChanges ? next : previous;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [sections]);

  const flattenedFields = useMemo(() => {
    if (!activeSection || activeSection.sectionType !== SectionTypeEnum.FlatForm) {
      return [];
    }

    return flattenTemplateFields(activeSection.fields ?? []);
  }, [activeSection]);

  useEffect(() => {
    const paperId = selectedPaperId;
    const selectedPaper = ws.selectedStudy?.raw;

    if (!paperId || !selectedPaper) {
      return;
    }

    if (hasAutoFilledPaperRef.current === paperId) {
      return;
    }

    const hasAnyUserValue = Object.values(formValues).some((state) =>
      !isValueEmpty(state.value)
    );

    if (hasAnyUserValue) {
      hasAutoFilledPaperRef.current = paperId;
      return;
    }

    const initialUpdates: Record<string, FormFieldState> = {};

    for (const item of ws.allFields) {
      const field = item.field;

      if (!field.fieldId) {
        continue;
      }

      const metadataValue = resolveMetadataFieldValue(field.name, selectedPaper);
      if (isValueEmpty(metadataValue)) {
        continue;
      }

      initialUpdates[field.fieldId] = createFieldState(metadataValue);
    }

    hasAutoFilledPaperRef.current = paperId;

    if (Object.keys(initialUpdates).length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFormValues((previous) => ({
        ...previous,
        ...initialUpdates,
      }));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [formValues, selectedPaperId, ws.allFields, ws.selectedStudy]);

  useEffect(() => {
    const reviewerWorkspace = ws.reviewerWorkspace;

    if (!selectedPaperId || !reviewerWorkspace) {
      return;
    }

    const hydrationKey = `${selectedPaperId}:${reviewerWorkspace.reviewerId ?? "reviewer"}`;
    if (hasHydratedReviewerWorkspaceRef.current === hydrationKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const flatFormUpdates: Record<string, FormFieldState> = {};
      const matrixUpdatesBySection: Record<
        string,
        Record<number, Record<string, FormFieldState>>
      > = {};
      const nextNotReportedFields: FieldNotReportedState = {};
      const nextMatrixNotReportedFields: MatrixFieldNotReportedState = {};

      const toExtractedValue = (
        field: ExtractionFieldDto,
        answer: AnswerDetailDto,
        matrixColumnId: string | null,
        matrixRowIndex: number | null
      ): ExtractedValueDto => ({
        fieldId: field.fieldId as string,
        optionId: answer.optionId ?? null,
        stringValue: answer.stringValue ?? null,
        numericValue: answer.numericValue ?? null,
        booleanValue: answer.booleanValue ?? null,
        matrixColumnId,
        matrixRowIndex,
        isNotReported: answer.isNotReported,
        evidenceCoordinates: answer.evidenceCoordinates ?? null,
      });

      reviewerWorkspace.sections.forEach((section) => {
        section.fields.forEach((field) => {
          (field.answers ?? []).forEach((answerGroup) => {
            const answer = answerGroup.answer;
            if (!field.fieldId || !answer) {
              return;
            }

            const parsedValue = mapExtractedValueToFormValue(
              field as unknown as ExtractionFieldDto,
              toExtractedValue(
                field as unknown as ExtractionFieldDto,
                answer,
                answerGroup.matrixColumnId ?? null,
                answerGroup.matrixRowIndex ?? null
              )
            );

            if (
              answerGroup.matrixRowIndex === null ||
              answerGroup.matrixRowIndex === undefined
            ) {
              flatFormUpdates[field.fieldId] = createFieldState(
                parsedValue,
                answer.evidenceCoordinates ?? null
              );
              nextNotReportedFields[field.fieldId] = Boolean(answer.isNotReported);
              return;
            }

            const rowIndex = answerGroup.matrixRowIndex;
            if (!matrixUpdatesBySection[section.sectionId]) {
              matrixUpdatesBySection[section.sectionId] = {};
            }

            if (!matrixUpdatesBySection[section.sectionId][rowIndex]) {
              matrixUpdatesBySection[section.sectionId][rowIndex] = {};
            }

            const targetRow = matrixUpdatesBySection[section.sectionId][rowIndex];
            targetRow[field.fieldId] = createFieldState(
              parsedValue,
              answer.evidenceCoordinates ?? null
            );

            if (!nextMatrixNotReportedFields[section.sectionId]) {
              nextMatrixNotReportedFields[section.sectionId] = {};
            }

            if (!nextMatrixNotReportedFields[section.sectionId][rowIndex]) {
              nextMatrixNotReportedFields[section.sectionId][rowIndex] = {};
            }

            nextMatrixNotReportedFields[section.sectionId][rowIndex][field.fieldId] =
              Boolean(answer.isNotReported);

            if (answerGroup.matrixColumnId) {
              targetRow[MATRIX_COLUMN_ID_KEY] = createFieldState(answerGroup.matrixColumnId);

              if (!targetRow[MATRIX_ITEM_NAME_KEY]?.value) {
                const matchedColumn = (section.matrixColumns ?? []).find(
                  (column) => column.columnId === answerGroup.matrixColumnId
                );

                if (matchedColumn?.name) {
                  targetRow[MATRIX_ITEM_NAME_KEY] = createFieldState(matchedColumn.name);
                }
              }
            }
          });
        });
      });

      if (Object.keys(flatFormUpdates).length > 0) {
        setFormValues((previous) => ({
          ...previous,
          ...flatFormUpdates,
        }));
      }

      if (Object.keys(nextNotReportedFields).length > 0) {
        setNotReportedFields((previous) => ({
          ...previous,
          ...nextNotReportedFields,
        }));
      }

      if (Object.keys(matrixUpdatesBySection).length > 0) {
        setMatrixValues((previous) => {
          const nextMatrixValues = { ...previous };

          Object.entries(matrixUpdatesBySection).forEach(([sectionId, rowUpdates]) => {
            const section = sectionById[sectionId];
            const existingRows = [...(nextMatrixValues[sectionId] ?? [])];

            Object.entries(rowUpdates)
              .map(([rowIndex, values]) => [Number(rowIndex), values] as const)
              .sort((left, right) => left[0] - right[0])
              .forEach(([rowIndex, values]) => {
                while (existingRows.length <= rowIndex) {
                  const fallbackColumn = section?.matrixColumns?.[existingRows.length];

                  existingRows.push({
                    ...(fallbackColumn?.name
                      ? { [MATRIX_ITEM_NAME_KEY]: createFieldState(fallbackColumn.name) }
                      : {}),
                    ...(fallbackColumn?.columnId
                      ? { [MATRIX_COLUMN_ID_KEY]: createFieldState(fallbackColumn.columnId) }
                      : {}),
                  });
                }

                existingRows[rowIndex] = {
                  ...(existingRows[rowIndex] ?? {}),
                  ...values,
                };

                const mergedRow = existingRows[rowIndex];
                if (!mergedRow[MATRIX_COLUMN_ID_KEY]?.value) {
                  const fallbackColumn = section?.matrixColumns?.[rowIndex];

                  if (fallbackColumn?.columnId) {
                    mergedRow[MATRIX_COLUMN_ID_KEY] = createFieldState(fallbackColumn.columnId);
                  }

                  if (!mergedRow[MATRIX_ITEM_NAME_KEY]?.value && fallbackColumn?.name) {
                    mergedRow[MATRIX_ITEM_NAME_KEY] = createFieldState(fallbackColumn.name);
                  }
                }
              });

            nextMatrixValues[sectionId] = existingRows;
          });

          return nextMatrixValues;
        });
      }

      if (Object.keys(nextMatrixNotReportedFields).length > 0) {
        setMatrixNotReportedFields((previous) => ({
          ...previous,
          ...nextMatrixNotReportedFields,
        }));
      }

      hasHydratedReviewerWorkspaceRef.current = hydrationKey;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedPaperId, sectionById, ws.reviewerWorkspace]);

  const setFieldState = useCallback(
    (
      fieldKey: string,
      value: FormFieldValue,
      evidenceCoordinates?: string | null
    ) => {
      setFormValues((previous) => {
        const existingState = previous[fieldKey] ?? createFieldState(null);

        return {
          ...previous,
          [fieldKey]: {
            value,
            evidenceCoordinates:
              evidenceCoordinates === undefined
                ? existingState.evidenceCoordinates ?? null
                : evidenceCoordinates,
          },
        };
      });
    },
    []
  );

  const setFieldNotReported = useCallback(
    (fieldKey: string, isNotReported: boolean) => {
      setNotReportedFields((previous) => ({
        ...previous,
        [fieldKey]: isNotReported,
      }));

      if (isNotReported) {
        setFieldState(fieldKey, null);
      }
    },
    [setFieldState]
  );

  const addMatrixRow = useCallback((sectionId: string) => {
    setMatrixValues((previous) => {
      const currentRows = previous[sectionId] ?? [];

      return {
        ...previous,
        [sectionId]: [...currentRows, {}],
      };
    });
  }, []);

  const removeMatrixRow = useCallback((sectionId: string, rowIndex: number) => {
    setMatrixValues((previous) => {
      const currentRows = previous[sectionId] ?? [];

      if (rowIndex < 0 || rowIndex >= currentRows.length) {
        return previous;
      }

      return {
        ...previous,
        [sectionId]: currentRows.filter((_, index) => index !== rowIndex),
      };
    });
  }, []);

  const setMatrixFieldValue = useCallback(
    (
      sectionId: string,
      rowIndex: number,
      fieldKey: string,
      value: FormFieldValue
    ) => {
      setMatrixValues((previous) => {
        const currentRows = previous[sectionId] ?? [];

        if (rowIndex < 0 || rowIndex >= currentRows.length) {
          return previous;
        }

        const nextRows = currentRows.map((row, index) =>
          index === rowIndex
            ? {
                ...row,
                [fieldKey]: {
                  value,
                  evidenceCoordinates:
                    row[fieldKey]?.evidenceCoordinates ?? null,
                },
              }
            : row
        );

        return {
          ...previous,
          [sectionId]: nextRows,
        };
      });
    },
    []
  );

  const setMatrixFieldNotReported = useCallback(
    (
      sectionId: string,
      rowIndex: number,
      fieldKey: string,
      isNotReported: boolean
    ) => {
      setMatrixNotReportedFields((previous) => {
        const sectionState = previous[sectionId] ?? {};
        const rowState = sectionState[rowIndex] ?? {};

        return {
          ...previous,
          [sectionId]: {
            ...sectionState,
            [rowIndex]: {
              ...rowState,
              [fieldKey]: isNotReported,
            },
          },
        };
      });

      if (isNotReported) {
        setMatrixFieldValue(sectionId, rowIndex, fieldKey, null);
      }
    },
    [setMatrixFieldValue]
  );

  const isFieldNotReported = useCallback(
    (fieldKey: string) => Boolean(notReportedFields[fieldKey]),
    [notReportedFields]
  );

  const isMatrixFieldNotReported = useCallback(
    (sectionId: string, rowIndex: number, fieldKey: string) =>
      Boolean(matrixNotReportedFields[sectionId]?.[rowIndex]?.[fieldKey]),
    [matrixNotReportedFields]
  );

  const getEvidenceCoordinatesForTarget = useCallback(
    (target: EvidenceTargetState | null): string | null => {
      if (!target) {
        return null;
      }

      if (target.sectionId && target.rowIndex !== null) {
        return (
          matrixValues[target.sectionId]?.[target.rowIndex]?.[target.fieldKey]
            ?.evidenceCoordinates ?? null
        );
      }

      return formValues[target.fieldKey]?.evidenceCoordinates ?? null;
    },
    [formValues, matrixValues]
  );

  const handleSelectEvidenceTarget = useCallback(
    (fieldKey: string, sectionId: string | null, rowIndex: number | null) => {
      if (
        activeEvidenceTarget?.fieldKey === fieldKey &&
        activeEvidenceTarget?.sectionId === sectionId &&
        activeEvidenceTarget?.rowIndex === rowIndex
      ) {
        setActiveEvidenceTarget(null);
        ws.setActiveHighlights([]);
        return;
      }

      const nextTarget: EvidenceTargetState = {
        fieldKey,
        sectionId,
        rowIndex,
      };

      setActiveEvidenceTarget(nextTarget);

      const linkedEvidence = getEvidenceCoordinatesForTarget(nextTarget);
      const parsedHighlights = parseEvidenceCoordinates(linkedEvidence);
      ws.setActiveHighlights(parsedHighlights);
    },
    [activeEvidenceTarget, getEvidenceCoordinatesForTarget, ws]
  );

  const setEvidenceForTarget = useCallback(
    (target: EvidenceTargetState | null, evidenceCoordinates: string | null) => {
      if (!target) {
        return;
      }

      if (target.sectionId && target.rowIndex !== null) {
        setMatrixValues((previous) => {
          const currentRows = previous[target.sectionId as string] ?? [];

          if (
            target.rowIndex === null ||
            target.rowIndex < 0 ||
            target.rowIndex >= currentRows.length
          ) {
            return previous;
          }

          const nextRows = currentRows.map((row, index) =>
            index === target.rowIndex
              ? {
                  ...row,
                  [target.fieldKey]: {
                    value: row[target.fieldKey]?.value ?? null,
                    evidenceCoordinates,
                  },
                }
              : row
          );

          return {
            ...previous,
            [target.sectionId as string]: nextRows,
          };
        });
        return;
      }

      setFormValues((previous) => {
        const existingState = previous[target.fieldKey] ?? createFieldState(null);

        return {
          ...previous,
          [target.fieldKey]: {
            ...existingState,
            evidenceCoordinates,
          },
        };
      });
    },
    []
  );

  const handleUseEvidenceSelection = useCallback(
    (coordinates: UseDataExtractionWorkspaceReturn["activeHighlights"]) => {
      if (!activeEvidenceTarget) {
        return;
      }

      const currentEvidenceCoordinates = getEvidenceCoordinatesForTarget(activeEvidenceTarget);
      const serializedCoordinates = mergeEvidenceCoordinates(
        currentEvidenceCoordinates,
        coordinates
      );
      setEvidenceForTarget(activeEvidenceTarget, serializedCoordinates);
      ws.setActiveHighlights(parseEvidenceCoordinates(serializedCoordinates));
    },
    [activeEvidenceTarget, getEvidenceCoordinatesForTarget, setEvidenceForTarget, ws]
  );

  const handleRemoveEvidenceForTarget = useCallback(() => {
    if (!activeEvidenceTarget) {
      return;
    }

    setEvidenceForTarget(activeEvidenceTarget, null);
    ws.setActiveHighlights([]);
  }, [activeEvidenceTarget, setEvidenceForTarget, ws]);

  const isEvidenceTargetActive = useCallback(
    (fieldKey: string, sectionId: string | null, rowIndex: number | null): boolean =>
      activeEvidenceTarget?.fieldKey === fieldKey &&
      activeEvidenceTarget?.sectionId === sectionId &&
      activeEvidenceTarget?.rowIndex === rowIndex,
    [activeEvidenceTarget]
  );

  const hasActiveTargetEvidence = useMemo(() => {
    const linkedEvidence = getEvidenceCoordinatesForTarget(activeEvidenceTarget);
    return Boolean(linkedEvidence?.trim());
  }, [activeEvidenceTarget, getEvidenceCoordinatesForTarget]);

  const activeEvidenceTargetLabel = useMemo(() => {
    if (!activeEvidenceTarget) {
      return null;
    }

    const fieldName =
      fieldById.get(activeEvidenceTarget.fieldKey)?.name ?? activeEvidenceTarget.fieldKey;

    if (activeEvidenceTarget.sectionId && activeEvidenceTarget.rowIndex !== null) {
      const sectionName =
        sectionById[activeEvidenceTarget.sectionId]?.name ?? activeEvidenceTarget.sectionId;
      return `${sectionName} - ${fieldName} (Row ${activeEvidenceTarget.rowIndex + 1})`;
    }

    return fieldName;
  }, [activeEvidenceTarget, fieldById, sectionById]);

  const renderFieldControl = useCallback(
    (item: FlattenedTemplateField, disabled = false) => {
      const { field, fieldKey } = item;
      const currentValue = formValues[fieldKey]?.value ?? null;
      const controlId = `field-${toDomId(fieldKey)}`;

      return renderInputControl(
        field,
        currentValue,
        (value) => setFieldState(fieldKey, value),
        controlId,
        isWorkspaceLocked || disabled
      );
    },
    [formValues, isWorkspaceLocked, setFieldState]
  );

  const matrixFields = useMemo(() => {
    if (!activeSection || activeSection.sectionType !== SectionTypeEnum.MatrixGrid) {
      return [];
    }

    return [...(activeSection.fields ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [activeSection]);

  const currentRows = useMemo(() => {
    if (!activeSection || activeSection.sectionType !== SectionTypeEnum.MatrixGrid) {
      return [];
    }

    return matrixValues[activeSectionId] ?? [];
  }, [activeSection, activeSectionId, matrixValues]);

  const buildSubmissionPayload = useCallback((): SubmitExtractionRequestDto => {
    const values: ExtractedValueDto[] = [];

    const normalizeMultiSelectIds = (rawValue: FormFieldValue): string[] => {
      if (!Array.isArray(rawValue)) {
        return [];
      }

      return rawValue
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    };

    const flatFieldKeys = new Set<string>([
      ...Object.keys(formValues),
      ...Object.keys(notReportedFields),
    ]);

    for (const fieldKey of flatFieldKeys) {
      const fieldState = formValues[fieldKey] ?? null;
      const rawValue = fieldState?.value ?? null;
      const field = fieldById.get(fieldKey);
      if (!field || !field.fieldId) {
        continue;
      }

      const isNotReported = Boolean(notReportedFields[fieldKey]);

      if (isNotReported) {
        const notReportedValue = mapFormValueToExtractedValue(
          field,
          null,
          null,
          null,
          true,
          fieldState?.evidenceCoordinates ?? null
        );

        if (notReportedValue) {
          values.push(notReportedValue);
        }

        continue;
      }

      if (field.fieldType === FieldTypeEnum.MultiSelect) {
        const selectedOptionIds = normalizeMultiSelectIds(rawValue);

        selectedOptionIds.forEach((selectedId) => {
          values.push({
            fieldId: field.fieldId as string,
            optionId: selectedId,
            stringValue: null,
            numericValue: null,
            booleanValue: null,
            matrixColumnId: null,
            matrixRowIndex: null,
            evidenceCoordinates: fieldState?.evidenceCoordinates ?? null,
          });
        });

        continue;
      }

      const extractedValue = mapFormValueToExtractedValue(
        field,
        rawValue,
        null,
        null,
        false,
        fieldState?.evidenceCoordinates ?? null
      );

      if (extractedValue) {
        values.push(extractedValue);
      }
    }

    for (const [sectionId, rows] of Object.entries(matrixValues)) {
      rows.forEach((row, rowIndex) => {
        const matrixColumnIdRaw = row[MATRIX_COLUMN_ID_KEY]?.value;
        const matrixColumnId =
          typeof matrixColumnIdRaw === "string" && matrixColumnIdRaw.trim().length > 0
            ? matrixColumnIdRaw
            : null;

        const rowNotReportedState =
          matrixNotReportedFields[sectionId]?.[rowIndex] ?? {};
        const rowFieldKeys = new Set<string>([
          ...Object.keys(row),
          ...Object.keys(rowNotReportedState),
        ]);

        rowFieldKeys.forEach((fieldKey) => {
          if (fieldKey === MATRIX_ITEM_NAME_KEY || fieldKey === MATRIX_COLUMN_ID_KEY) {
            return;
          }

          const rawValue = row[fieldKey]?.value ?? null;

          const field = fieldById.get(fieldKey);
          if (!field || !field.fieldId) {
            return;
          }

          const isNotReported = Boolean(rowNotReportedState[fieldKey]);

          if (isNotReported) {
            const notReportedValue = mapFormValueToExtractedValue(
              field,
              null,
              matrixColumnId,
              rowIndex,
              true,
              row[fieldKey]?.evidenceCoordinates ?? null
            );

            if (notReportedValue) {
              values.push(notReportedValue);
            }

            return;
          }

          if (field.fieldType === FieldTypeEnum.MultiSelect) {
            const selectedOptionIds = normalizeMultiSelectIds(
              rawValue as FormFieldValue
            );

            selectedOptionIds.forEach((selectedId) => {
              values.push({
                fieldId: field.fieldId as string,
                optionId: selectedId,
                stringValue: null,
                numericValue: null,
                booleanValue: null,
                matrixColumnId,
                matrixRowIndex: rowIndex,
                evidenceCoordinates: row[fieldKey]?.evidenceCoordinates ?? null,
              });
            });

            return;
          }

          const extractedValue = mapFormValueToExtractedValue(
            field,
            rawValue as FormFieldValue,
            matrixColumnId,
            rowIndex,
            false,
            row[fieldKey]?.evidenceCoordinates ?? null
          );

          if (extractedValue) {
            values.push(extractedValue);
          }
        });
      });
    }

    return { values };
  }, [fieldById, formValues, matrixNotReportedFields, matrixValues, notReportedFields]);

  const handleSubmitExtraction = useCallback(() => {
    if (!selectedPaperId) {
      return;
    }

    const missingRequiredFields: string[] = [];

    sections.forEach((section) => {
      const sectionId = getSectionId(section);

      if (section.sectionType === SectionTypeEnum.FlatForm) {
        const flatFields = flattenTemplateFields(section.fields ?? []);
        flatFields.forEach(({ field, fieldKey }) => {
          if (
            field.isRequired &&
            !isFieldNotReported(fieldKey) &&
            isValueEmpty(formValues[fieldKey]?.value)
          ) {
            missingRequiredFields.push(`${section.name} - ${field.name}`);
          }
        });
      } else if (section.sectionType === SectionTypeEnum.MatrixGrid) {
        const rows = matrixValues[sectionId] ?? [];
        const mFields = section.fields ?? [];

        rows.forEach((row, rowIndex) => {
          mFields.forEach((field, fieldIndex) => {
            if (field.isRequired) {
              const fieldKey = getMatrixFieldKey(field, fieldIndex);
              if (
                !isMatrixFieldNotReported(sectionId, rowIndex, fieldKey) &&
                isValueEmpty(row[fieldKey]?.value)
              ) {
                missingRequiredFields.push(
                  `${section.name} - ${field.name} (Row ${rowIndex + 1})`
                );
              }
            }
          });
        });
      }
    });

    if (missingRequiredFields.length > 0) {
      const uniqueMissingFields = [...new Set(missingRequiredFields)];

      toastError(
        "Validation Failed",
        `Please fill in all required fields:\n${uniqueMissingFields.join("\n")}`
      );
      return;
    }

    const payload = buildSubmissionPayload();
    submitExtraction(selectedPaperId, payload);
  }, [
    buildSubmissionPayload,
    formValues,
    isFieldNotReported,
    isMatrixFieldNotReported,
    matrixValues,
    selectedPaperId,
    sections,
    submitExtraction,
  ]);

  const handleAutoExtract = useCallback(async () => {
    const templateId = ws.selectedTemplate?.templateId ?? null;

    if (!selectedPaperId || !templateId) {
      return;
    }

    try {
      const extractedValues = await ws.autoExtractWithAI(selectedPaperId, templateId);

      if (!extractedValues.length) {
        return;
      }

      const flatFormUpdates: Record<string, FormFieldState> = {};
      const matrixUpdatesBySection: Record<
        string,
        Record<number, Record<string, FormFieldState>>
      > = {};
      const nextNotReportedFields: FieldNotReportedState = {};
      const nextMatrixNotReportedFields: MatrixFieldNotReportedState = {};

      extractedValues.forEach((extractedValue) => {
        const fieldContext = fieldContextById.get(extractedValue.fieldId);
        if (!fieldContext?.field.fieldId) {
          return;
        }

        const isNotReported = Boolean(extractedValue.isNotReported);
        const evidenceCoordinates =
          extractedValue.evidenceCoordinates ?? extractedValue.EvidenceCoordinates ?? null;
        const parsedValue = isNotReported
          ? null
          : mapExtractedValueToFormValue(fieldContext.field, extractedValue);

        if (
          extractedValue.matrixRowIndex === null ||
          extractedValue.matrixRowIndex === undefined
        ) {
          flatFormUpdates[fieldContext.field.fieldId] = createFieldState(
            parsedValue,
            evidenceCoordinates
          );
          nextNotReportedFields[fieldContext.field.fieldId] = isNotReported;
          return;
        }

        const rowIndex = extractedValue.matrixRowIndex;
        if (rowIndex < 0) {
          return;
        }

        if (!matrixUpdatesBySection[fieldContext.sectionId]) {
          matrixUpdatesBySection[fieldContext.sectionId] = {};
        }

        if (!matrixUpdatesBySection[fieldContext.sectionId][rowIndex]) {
          matrixUpdatesBySection[fieldContext.sectionId][rowIndex] = {};
        }

        const targetRow = matrixUpdatesBySection[fieldContext.sectionId][rowIndex];
        targetRow[fieldContext.field.fieldId] = createFieldState(
          parsedValue,
          evidenceCoordinates
        );

        if (!nextMatrixNotReportedFields[fieldContext.sectionId]) {
          nextMatrixNotReportedFields[fieldContext.sectionId] = {};
        }

        if (!nextMatrixNotReportedFields[fieldContext.sectionId][rowIndex]) {
          nextMatrixNotReportedFields[fieldContext.sectionId][rowIndex] = {};
        }

        nextMatrixNotReportedFields[fieldContext.sectionId][rowIndex][
          fieldContext.field.fieldId
        ] = isNotReported;

        if (extractedValue.matrixColumnId) {
          targetRow[MATRIX_COLUMN_ID_KEY] = createFieldState(
            extractedValue.matrixColumnId
          );

          if (!targetRow[MATRIX_ITEM_NAME_KEY]?.value) {
            const section = sectionById[fieldContext.sectionId];
            const matchedColumn = (section?.matrixColumns ?? []).find(
              (column) => column.columnId === extractedValue.matrixColumnId
            );

            if (matchedColumn?.name) {
              targetRow[MATRIX_ITEM_NAME_KEY] = createFieldState(matchedColumn.name);
            }
          }
        }
      });

      if (Object.keys(flatFormUpdates).length > 0) {
        setFormValues((previous) => ({
          ...previous,
          ...flatFormUpdates,
        }));
      }

      if (Object.keys(nextNotReportedFields).length > 0) {
        setNotReportedFields((previous) => ({
          ...previous,
          ...nextNotReportedFields,
        }));
      }

      if (Object.keys(matrixUpdatesBySection).length > 0) {
        setMatrixValues((previous) => {
          const nextMatrixValues = { ...previous };

          Object.entries(matrixUpdatesBySection).forEach(([sectionId, rowUpdates]) => {
            const section = sectionById[sectionId];
            const existingRows = [...(nextMatrixValues[sectionId] ?? [])];

            Object.entries(rowUpdates)
              .map(([rowIndex, values]) => [Number(rowIndex), values] as const)
              .sort((left, right) => left[0] - right[0])
              .forEach(([rowIndex, values]) => {
                while (existingRows.length <= rowIndex) {
                  const fallbackColumn = section?.matrixColumns?.[existingRows.length];

                  existingRows.push({
                    ...(fallbackColumn?.name
                      ? { [MATRIX_ITEM_NAME_KEY]: createFieldState(fallbackColumn.name) }
                      : {}),
                    ...(fallbackColumn?.columnId
                      ? { [MATRIX_COLUMN_ID_KEY]: createFieldState(fallbackColumn.columnId) }
                      : {}),
                  });
                }

                existingRows[rowIndex] = {
                  ...(existingRows[rowIndex] ?? {}),
                  ...values,
                };

                const mergedRow = existingRows[rowIndex];
                if (!mergedRow[MATRIX_COLUMN_ID_KEY]?.value) {
                  const fallbackColumn = section?.matrixColumns?.[rowIndex];

                  if (fallbackColumn?.columnId) {
                    mergedRow[MATRIX_COLUMN_ID_KEY] = createFieldState(fallbackColumn.columnId);
                  }

                  if (!mergedRow[MATRIX_ITEM_NAME_KEY]?.value && fallbackColumn?.name) {
                    mergedRow[MATRIX_ITEM_NAME_KEY] = createFieldState(fallbackColumn.name);
                  }
                }
              });

            nextMatrixValues[sectionId] = existingRows;
          });

          return nextMatrixValues;
        });
      }

      if (Object.keys(nextMatrixNotReportedFields).length > 0) {
        setMatrixNotReportedFields((previous) => {
          const next = { ...previous };

          Object.entries(nextMatrixNotReportedFields).forEach(
            ([sectionId, rowStates]) => {
              next[sectionId] = {
                ...(next[sectionId] ?? {}),
                ...rowStates,
              };
            }
          );

          return next;
        });
      }
    } catch (error) {
      void error;
    }
  }, [fieldContextById, sectionById, selectedPaperId, ws]);

  const handleAskAiField = useCallback(
    async (
      field: ExtractionFieldDto,
      matrixColumnId: string | null,
      matrixRowIndex: number | null
    ) => {
      const askAiResult = await ws.handleAskAiForField(
        field,
        matrixColumnId,
        matrixRowIndex
      );

      if (!askAiResult || !field.fieldId) {
        return;
      }

      const fieldId = field.fieldId;
      const targetValue = askAiResult.value;

      if (
        askAiResult.matrixRowIndex === null ||
        askAiResult.matrixRowIndex === undefined
      ) {
        const askAiIsNotReported = Boolean(askAiResult.isNotReported);
        setFieldNotReported(field.fieldId, askAiIsNotReported);
        setFieldState(
          field.fieldId,
          askAiIsNotReported ? null : targetValue,
          askAiResult.evidenceCoordinates ?? null
        );
        return;
      }

      const targetRowIndex = askAiResult.matrixRowIndex;

      const targetSectionId =
        fieldContextById.get(field.fieldId)?.sectionId ?? activeSectionId;

      if (!targetSectionId) {
        return;
      }

      const askAiIsNotReported = Boolean(askAiResult.isNotReported);

      setMatrixNotReportedFields((previous) => {
        const sectionState = previous[targetSectionId] ?? {};
        const rowState = sectionState[targetRowIndex] ?? {};

        return {
          ...previous,
          [targetSectionId]: {
            ...sectionState,
            [targetRowIndex]: {
              ...rowState,
              [fieldId]: askAiIsNotReported,
            },
          },
        };
      });

      setMatrixValues((previous) => {
        const existingRows = [...(previous[targetSectionId] ?? [])];

        while (existingRows.length <= targetRowIndex) {
          const fallbackColumn =
            sectionById[targetSectionId]?.matrixColumns?.[existingRows.length];

          existingRows.push({
            ...(fallbackColumn?.name
              ? { [MATRIX_ITEM_NAME_KEY]: createFieldState(fallbackColumn.name) }
              : {}),
            ...(fallbackColumn?.columnId
              ? { [MATRIX_COLUMN_ID_KEY]: createFieldState(fallbackColumn.columnId) }
              : {}),
          });
        }

        const row = existingRows[targetRowIndex] ?? {};
        const nextRow: Record<string, FormFieldState> = {
          ...row,
          [fieldId]: createFieldState(
            askAiIsNotReported ? null : targetValue,
            askAiResult.evidenceCoordinates ?? null
          ),
        };

        if (askAiResult.matrixColumnId) {
          nextRow[MATRIX_COLUMN_ID_KEY] = createFieldState(askAiResult.matrixColumnId);

          if (!nextRow[MATRIX_ITEM_NAME_KEY]?.value) {
            const matchedColumn = (sectionById[targetSectionId]?.matrixColumns ?? []).find(
              (column) => column.columnId === askAiResult.matrixColumnId
            );

            if (matchedColumn?.name) {
              nextRow[MATRIX_ITEM_NAME_KEY] = createFieldState(matchedColumn.name);
            }
          }
        }

        existingRows[targetRowIndex] = nextRow;

        return {
          ...previous,
          [targetSectionId]: existingRows,
        };
      });
    },
    [
      activeSectionId,
      fieldContextById,
      sectionById,
      setFieldNotReported,
      setFieldState,
      setMatrixNotReportedFields,
      ws,
    ]
  );

  const renderCommentButton = useCallback(
    (params: {
      field: ExtractionFieldDto;
      sectionId: string;
      matrixColumnId: string | null;
      matrixRowIndex: number | null;
    }) => {
      if (!selectedPaperId || !params.field.fieldId) {
        return null;
      }

      const threadOwnerId = ws.reviewerWorkspace?.reviewerId ?? ws.currentUserId ?? "";
      if (!threadOwnerId) {
        return null;
      }

      const key = buildCommentKey(
        params.sectionId,
        params.field.fieldId,
        params.matrixColumnId,
        params.matrixRowIndex
      );
      const scopedLocalKey = `${selectedPaperId ?? "paper"}::${key}`;

      const serverComments = commentMap.get(key) ?? [];
      const localComments = localCommentsByKey[scopedLocalKey] ?? [];
      const comments = serverComments.length > 0 ? serverComments : localComments;

      return (
        <FieldComments
          title={params.field.name}
          comments={comments}
          currentUserId={ws.currentUserId}
          isSending={ws.isAddingFieldComment}
          onSendComment={async (content) => {
            const shouldUseLocalFallback = !ws.reviewerWorkspace;
            const optimisticCommentId = `local-${Date.now()}`;

            if (shouldUseLocalFallback) {
              const optimisticComment: ExtractionCommentDto = {
                id: optimisticCommentId,
                fieldId: params.field.fieldId as string,
                threadOwnerId,
                userId: ws.currentUserId ?? "",
                userName: "You",
                content,
                createdAt: new Date().toISOString(),
              };

              setLocalCommentsByKey((previous) => ({
                ...previous,
                [scopedLocalKey]: [
                  ...(previous[scopedLocalKey] ?? []),
                  optimisticComment,
                ],
              }));
            }

            try {
              await ws.addFieldComment(selectedPaperId, params.field.fieldId as string, {
                threadOwnerId,
                content,
                matrixColumnId: params.matrixColumnId,
                matrixRowIndex: params.matrixRowIndex,
              });
            } catch (error) {
              if (shouldUseLocalFallback) {
                setLocalCommentsByKey((previous) => ({
                  ...previous,
                  [scopedLocalKey]: (previous[scopedLocalKey] ?? []).filter(
                    (comment) => comment.id !== optimisticCommentId
                  ),
                }));
              }

              throw error;
            }
          }}
        />
      );
    },
    [commentMap, localCommentsByKey, selectedPaperId, ws]
  );

  if (!ws.selectedTemplate) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 p-6">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              {ws.isLoading ? "Loading template..." : "No template found"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {ws.isLoading
                ? "Please wait while extraction template data is loaded."
                : "Assign an extraction template to this process to continue."}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(dashboardPath)}
              className="mt-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeSectionDescription =
    activeSection?.sectionType === SectionTypeEnum.MatrixGrid
      ? "This section uses matrix grid extraction."
      : "Capture extraction values for this section.";

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-100 pb-16">
      {ws.isDirectMode ? (
        <div className="border-b border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-800">
          ⚡️ Direct Extraction Mode (Leader). Submitting this will finalize the
          data and skip the consensus phase.
        </div>
      ) : null}

      {isWorkspaceLocked ? (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm font-medium text-amber-800">
          Your submission is locked. Waiting for consensus or leader review.
        </div>
      ) : null}

      <div className="flex h-full min-w-[1080px]">
        <ReviewerPdfPanel
          effectiveDocumentUrl={effectiveDocumentUrl}
          isUsingFallbackDocument={isUsingFallbackDocument}
          activeHighlights={ws.activeHighlights}
          activeEvidenceTargetLabel={activeEvidenceTargetLabel}
          canUseEvidenceSelection={Boolean(activeEvidenceTarget)}
          canRemoveEvidence={Boolean(activeEvidenceTarget) && hasActiveTargetEvidence}
          onUseEvidenceSelection={handleUseEvidenceSelection}
          onRemoveEvidence={handleRemoveEvidenceForTarget}
        />

        <ReviewerSidebar
          sections={sections}
          activeSectionId={activeSectionId}
          selectedTemplateName={ws.selectedTemplate.name}
          isAutoExtracting={ws.isAutoExtracting}
          isSubmittingExtraction={isSubmittingExtraction}
          canAutoExtract={
            !!selectedPaperId && !!ws.selectedTemplate?.templateId && !isWorkspaceLocked
          }
          canSubmit={!!selectedPaperId && !isWorkspaceLocked}
          isReadOnly={isWorkspaceLocked}
          onAutoExtract={handleAutoExtract}
          onSectionChange={setActiveSectionIdState}
          onBack={() => navigate(dashboardPath)}
          onSubmitExtraction={handleSubmitExtraction}
          submitButtonLabel={
            ws.isDirectMode ? "Save & Complete Final Data" : "Submit Extraction"
          }
        />

        <ReviewerFormPane
          activeSection={activeSection}
          activeSectionId={activeSectionId}
          activeSectionDescription={activeSectionDescription}
          activeEvidenceTargetLabel={activeEvidenceTargetLabel}
          matrixFields={matrixFields}
          fieldStates={formValues}
          currentRows={currentRows}
          flattenedFields={flattenedFields}
          renderFieldControl={renderFieldControl}
          isFieldNotReported={isFieldNotReported}
          isMatrixFieldNotReported={isMatrixFieldNotReported}
          isReadOnly={isWorkspaceLocked}
          isAskingAi={ws.isAskingAi}
          isEvidenceTargetActive={isEvidenceTargetActive}
          onAskAiField={handleAskAiField}
          onSelectEvidenceTarget={handleSelectEvidenceTarget}
          onSetMatrixFieldValue={setMatrixFieldValue}
          onToggleFieldNotReported={setFieldNotReported}
          onToggleMatrixFieldNotReported={setMatrixFieldNotReported}
          onRemoveMatrixRow={removeMatrixRow}
          onAddMatrixRow={addMatrixRow}
          renderCommentButton={renderCommentButton}
        />
      </div>
    </div>
  );
}
