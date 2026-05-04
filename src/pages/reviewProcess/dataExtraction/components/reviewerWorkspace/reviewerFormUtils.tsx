import {
  FieldTypeEnum,
  type ExtractedValueDto,
  type ExtractionFieldDto,
  type ExtractionSectionDto,
} from "../../../../../types/dataExtraction";
import type { FlattenedTemplateField, FormFieldValue } from "./types";

export const MATRIX_ITEM_NAME_KEY = "__matrixItemName";
export const MATRIX_COLUMN_ID_KEY = "__matrixColumnId";
export const FALLBACK_PDF_URL =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export function getSectionId(section: ExtractionSectionDto): string {
  return section.sectionId ?? section.name;
}

export function toDomId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
}

export function getMatrixFieldKey(
  field: ExtractionFieldDto,
  fieldIndex: number
): string {
  if (field.fieldId) {
    return field.fieldId;
  }

  return `${toDomId(field.name || "field")}-${fieldIndex}`;
}

export function flattenTemplateFields(
  fields: ExtractionFieldDto[],
  depth = 0,
  keyPrefix = ""
): FlattenedTemplateField[] {
  const sorted = [...fields].sort((a, b) => a.orderIndex - b.orderIndex);

  return sorted.flatMap((field, index) => {
    const fallbackKey = `${keyPrefix}${field.name || "field"}-${index}`;
    const fieldKey = field.fieldId ?? fallbackKey;
    const children = flattenTemplateFields(
      field.subFields ?? [],
      depth + 1,
      `${fieldKey}-`
    );

    return [{ field, fieldKey, depth }, ...children];
  });
}

export function mapFormValueToExtractedValue(
  field: ExtractionFieldDto,
  value: FormFieldValue,
  matrixColumnId: string | null,
  matrixRowIndex: number | null,
  isNotReported = false,
  evidenceCoordinates: string | null = null
): ExtractedValueDto | null {
  if (!field.fieldId) {
    return null;
  }

  const extractedValue: ExtractedValueDto = {
    fieldId: field.fieldId,
    optionId: null,
    stringValue: null,
    numericValue: null,
    booleanValue: null,
    matrixColumnId,
    matrixRowIndex,
    isNotReported,
    evidenceCoordinates,
  };

  if (isNotReported) {
    return extractedValue;
  }

  if (
    field.fieldType === FieldTypeEnum.Integer ||
    field.fieldType === FieldTypeEnum.Decimal
  ) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return null;
    }

    return {
      ...extractedValue,
      numericValue: value,
    };
  }

  if (field.fieldType === FieldTypeEnum.Boolean) {
    if (typeof value !== "boolean") {
      return null;
    }

    return {
      ...extractedValue,
      booleanValue: value,
    };
  }

  if (field.fieldType === FieldTypeEnum.SingleSelect) {
    if (typeof value !== "string") {
      return null;
    }

    const selectedOptionId = value.trim();
    if (!selectedOptionId) {
      return null;
    }

    return {
      ...extractedValue,
      optionId: selectedOptionId,
    };
  }

  if (field.fieldType === FieldTypeEnum.MultiSelect) {
    // MultiSelect is serialized by the payload builder as one DTO per optionId.
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  return {
    ...extractedValue,
    stringValue: normalizedValue,
  };
}

export function renderInputControl(
  field: ExtractionFieldDto,
  value: FormFieldValue,
  onChange: (value: FormFieldValue) => void,
  controlId: string,
  disabled = false
) {
  if (
    field.fieldType === FieldTypeEnum.Integer ||
    field.fieldType === FieldTypeEnum.Decimal
  ) {
    const inputValue =
      typeof value === "number" && Number.isFinite(value)
        ? String(value)
        : "";

    return (
      <input
        id={controlId}
        type="number"
        step={field.fieldType === FieldTypeEnum.Decimal ? "any" : 1}
        disabled={disabled}
        value={inputValue}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
      />
    );
  }

  if (field.fieldType === FieldTypeEnum.Boolean) {
    const booleanValue =
      value === true ? "true" : value === false ? "false" : "";

    return (
      <div className="rounded-xl border border-slate-300 bg-white px-3 py-2 disabled:border-slate-200 disabled:bg-slate-100">
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-700">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={controlId}
              value="true"
              disabled={disabled}
              checked={booleanValue === "true"}
              onChange={() => onChange(true)}
              className="h-4 w-4 border-slate-300"
            />
            Yes
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={controlId}
              value="false"
              disabled={disabled}
              checked={booleanValue === "false"}
              onChange={() => onChange(false)}
              className="h-4 w-4 border-slate-300"
            />
            No
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  if (field.fieldType === FieldTypeEnum.SingleSelect) {
    const selectedValue = typeof value === "string" ? value : "";

    return (
      <select
        id={controlId}
        disabled={disabled}
        value={selectedValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue === "" ? null : nextValue);
        }}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
      >
        <option value="">Select...</option>
        {(field.options ?? []).map((option, optionIndex) => (
          <option
            key={option.optionId ?? `${controlId}-option-${optionIndex}`}
            value={option.optionId ?? ""}
          >
            {option.value}
          </option>
        ))}
      </select>
    );
  }

  if (field.fieldType === FieldTypeEnum.MultiSelect) {
    const selectedValues = Array.isArray(value)
      ? value.filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.trim().length > 0
        )
      : [];

    return (
      <div className="space-y-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
        {(field.options ?? []).map((option, optionIndex) => {
          const key = option.optionId ?? `${controlId}-option-${optionIndex}`;
          const checkboxId = `${controlId}-checkbox-${optionIndex}`;
          const optionId = option.optionId ?? "";
          const isChecked = optionId.length > 0 && selectedValues.includes(optionId);

          return (
            <label
              key={key}
              htmlFor={checkboxId}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                id={checkboxId}
                type="checkbox"
                disabled={disabled}
                checked={isChecked}
                onChange={(event) => {
                  if (!optionId) {
                    return;
                  }

                  const updatedValues = event.target.checked
                    ? [...selectedValues, optionId]
                    : selectedValues.filter(
                        (selected: string) => selected !== optionId
                      );
                  onChange(updatedValues);
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                aria-label={option.value}
              />
              <span>{option.value}</span>
            </label>
          );
        })}
      </div>
    );
  }

  const textValue = typeof value === "string" ? value : "";

  return (
    <textarea
      id={controlId}
      disabled={disabled}
      value={textValue}
      onChange={(event) => onChange(event.target.value)}
      placeholder={`Enter ${field.name.toLowerCase()}`}
      rows={3}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
    />
  );
}

export function resolveOptionValue(
  field: ExtractionFieldDto,
  optionId: string | null,
  fallbackStringValue: string | null
): string | null {
  if (optionId) {
    const matchedById = (field.options ?? []).find(
      (option) => option.optionId === optionId
    );

    if (matchedById) {
      return matchedById.value;
    }
  }

  const normalizedFallback = (fallbackStringValue ?? "").trim();
  if (!normalizedFallback) {
    return null;
  }

  const matchedByValue = (field.options ?? []).find(
    (option) => option.value === normalizedFallback
  );
  if (matchedByValue) {
    return matchedByValue.value;
  }

  const matchedByFallbackId = (field.options ?? []).find(
    (option) => option.optionId === normalizedFallback
  );
  if (matchedByFallbackId) {
    return matchedByFallbackId.value;
  }

  return normalizedFallback;
}

export function parseAutoExtractedMultiSelect(
  field: ExtractionFieldDto,
  extractedValue: ExtractedValueDto
): string[] {
  const normalizeEntry = (entry: unknown): string | null => {
    if (typeof entry !== "string") {
      return null;
    }

    const normalized = entry.trim();
    if (!normalized) {
      return null;
    }

    const asOptionId = (field.options ?? []).find(
      (option) => option.optionId === normalized
    );
    if (asOptionId?.optionId) {
      return asOptionId.optionId;
    }

    const asOptionValue = (field.options ?? []).find(
      (option) => option.value === normalized
    );
    if (asOptionValue?.optionId) {
      return asOptionValue.optionId;
    }

    return normalized;
  };

  const normalizedStringValue = (extractedValue.stringValue ?? "").trim();
  if (normalizedStringValue) {
    try {
      const parsed = JSON.parse(normalizedStringValue);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => normalizeEntry(entry))
          .filter((entry): entry is string => !!entry);
      }
    } catch {
      // If the AI response is not JSON, treat it as comma-separated values.
    }

    const csvValues = normalizedStringValue
      .split(",")
      .map((entry) => normalizeEntry(entry))
      .filter((entry): entry is string => !!entry);

    if (csvValues.length > 0) {
      return csvValues;
    }
  }

  const singleOption = resolveOptionValue(
    field,
    extractedValue.optionId,
    extractedValue.stringValue
  );

  if (extractedValue.optionId && extractedValue.optionId.trim().length > 0) {
    return [extractedValue.optionId.trim()];
  }

  if (!singleOption) {
    return [];
  }

  const asOption = (field.options ?? []).find(
    (option) => option.value === singleOption
  );

  return asOption?.optionId ? [asOption.optionId] : [];
}

export function mapExtractedValueToFormValue(
  field: ExtractionFieldDto,
  extractedValue: ExtractedValueDto
): FormFieldValue {
  if (extractedValue.isNotReported) {
    return null;
  }

  if (
    field.fieldType === FieldTypeEnum.Integer ||
    field.fieldType === FieldTypeEnum.Decimal
  ) {
    if (
      typeof extractedValue.numericValue === "number" &&
      Number.isFinite(extractedValue.numericValue)
    ) {
      return extractedValue.numericValue;
    }

    const parsed = Number((extractedValue.stringValue ?? "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (field.fieldType === FieldTypeEnum.Boolean) {
    if (typeof extractedValue.booleanValue === "boolean") {
      return extractedValue.booleanValue;
    }

    const normalized = (extractedValue.stringValue ?? "").trim().toLowerCase();
    if (["true", "yes", "1"].includes(normalized)) {
      return true;
    }

    if (["false", "no", "0"].includes(normalized)) {
      return false;
    }

    return null;
  }

  if (field.fieldType === FieldTypeEnum.SingleSelect) {
    const optionId = (extractedValue.optionId ?? "").trim();
    if (optionId) {
      return optionId;
    }

    const fallback = (extractedValue.stringValue ?? "").trim();
    if (!fallback) {
      return null;
    }

    const matchedById = (field.options ?? []).find(
      (option) => option.optionId === fallback
    );
    if (matchedById?.optionId) {
      return matchedById.optionId;
    }

    const matchedByValue = (field.options ?? []).find(
      (option) => option.value === fallback
    );

    return matchedByValue?.optionId ?? null;
  }

  if (field.fieldType === FieldTypeEnum.MultiSelect) {
    return parseAutoExtractedMultiSelect(field, extractedValue);
  }

  if (typeof extractedValue.stringValue === "string") {
    return extractedValue.stringValue;
  }

  if (
    typeof extractedValue.numericValue === "number" &&
    Number.isFinite(extractedValue.numericValue)
  ) {
    return String(extractedValue.numericValue);
  }

  if (typeof extractedValue.booleanValue === "boolean") {
    return extractedValue.booleanValue ? "true" : "false";
  }

  return null;
}
