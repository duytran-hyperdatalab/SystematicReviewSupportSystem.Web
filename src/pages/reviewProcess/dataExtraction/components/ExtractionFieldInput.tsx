import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Textarea from "../../../../components/ui/Textarea";
import { FieldTypeEnum, type ExtractionFieldDto } from "../../../../types/dataExtraction";
import type { ExtractionValue } from "../types";

interface ExtractionFieldInputProps {
  field: ExtractionFieldDto;
  value: ExtractionValue;
  onChange: (value: ExtractionValue) => void;
}

export default function ExtractionFieldInput({
  field,
  value,
  onChange,
}: ExtractionFieldInputProps) {
  const options = [...(field.options ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  if (
    field.fieldType === FieldTypeEnum.Integer ||
    field.fieldType === FieldTypeEnum.Decimal
  ) {
    const inputValue =
      typeof value === "number"
        ? String(value)
        : typeof value === "string"
          ? value
          : "";

    return (
      <Input
        type="number"
        step={field.fieldType === FieldTypeEnum.Decimal ? "any" : 1}
        value={inputValue}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
      />
    );
  }

  if (field.fieldType === FieldTypeEnum.Boolean) {
    const selected =
      typeof value === "boolean" ? (value ? "true" : "false") : "";

    return (
      <Select
        value={selected}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          onChange(raw === "true");
        }}
        options={[
          { value: "", label: "Select..." },
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ]}
      />
    );
  }

  if (field.fieldType === FieldTypeEnum.SingleSelect) {
    const selected = typeof value === "string" ? value : "";

    return (
      <Select
        value={selected}
        onChange={(event) => onChange(event.target.value || null)}
        options={[
          { value: "", label: "Select..." },
          ...options.map((option) => ({
            value: option.optionId ?? "",
            label: option.value,
          })),
        ]}
      />
    );
  }

  if (field.fieldType === FieldTypeEnum.MultiSelect) {
    const selectedValues = Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

    return (
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {options.map((option) => {
          const optionId = option.optionId ?? "";
          const checked = optionId.length > 0 && selectedValues.includes(optionId);

          return (
            <label
              key={option.optionId ?? option.value}
              className="flex items-center gap-3 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  if (!optionId) {
                    return;
                  }

                  if (event.target.checked) {
                    onChange([...selectedValues, optionId]);
                    return;
                  }

                  onChange(
                    selectedValues.filter((item) => item !== optionId)
                  );
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
                disabled={!optionId}
              />
              <span>{option.value}</span>
            </label>
          );
        })}
      </div>
    );
  }

  const textValue =
    typeof value === "string"
      ? value
      : value === null || value === undefined
        ? ""
        : String(value);

  return (
    <Textarea
      value={textValue}
      onChange={(event) => onChange(event.target.value)}
      rows={field.fieldType === FieldTypeEnum.Text ? 4 : 3}
      placeholder={`Enter ${field.name.toLowerCase()}`}
    />
  );
}
