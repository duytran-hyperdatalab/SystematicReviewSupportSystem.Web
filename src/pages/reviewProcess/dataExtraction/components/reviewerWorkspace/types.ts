import type { ExtractionFieldDto } from "../../../../../types/dataExtraction";

export type FormFieldValue = string | number | boolean | string[] | null;

export interface FormFieldState {
  value: FormFieldValue;
  evidenceCoordinates?: string | null;
}

export type FieldNotReportedState = Record<string, boolean>;

export type MatrixFieldNotReportedState = Record<
  string,
  Record<number, FieldNotReportedState>
>;

export interface FlattenedTemplateField {
  field: ExtractionFieldDto;
  fieldKey: string;
  depth: number;
}
