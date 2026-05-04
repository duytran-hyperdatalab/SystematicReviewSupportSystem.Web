import type { DataItemType } from "../types/dataExtraction";
import { FieldTypeEnum } from "../types/dataExtraction";

export const DATA_ITEM_TYPES: { value: DataItemType; label: string; description: string }[] = [
  {
    value: "Text",
    label: "Text",
    description: "Free-form text input",
  },
  {
    value: "Number",
    label: "Number",
    description: "Numeric value (integer or decimal)",
  },
  {
    value: "SingleSelect",
    label: "Single Select",
    description: "Choose one option from a list (Radio buttons)",
  },
  {
    value: "MultiSelect",
    label: "Multi Select",
    description: "Choose multiple options (Checkboxes)",
  },
  {
    value: "Boolean",
    label: "Yes/No",
    description: "Boolean field (Yes/No toggle)",
  },
  {
    value: "Date",
    label: "Date",
    description: "Date picker",
  },
  {
    value: "Group",
    label: "Group",
    description: "Group of nested fields",
  },
];

export const TYPES_WITH_OPTIONS: DataItemType[] = ["SingleSelect", "MultiSelect"];

// Type mapping between Frontend and Backend
export const FRONTEND_TO_BACKEND_TYPE: Record<DataItemType, FieldTypeEnum> = {
  Text: FieldTypeEnum.Text,
  Number: FieldTypeEnum.Decimal, // Default to Decimal, can be Integer based on validation
  SingleSelect: FieldTypeEnum.SingleSelect,
  MultiSelect: FieldTypeEnum.MultiSelect,
  Boolean: FieldTypeEnum.Boolean,
  Date: FieldTypeEnum.Text, // Backend doesn't have Date type, store as Text
  Group: FieldTypeEnum.Text, // Group is UI-only concept
};

export const BACKEND_TO_FRONTEND_TYPE: Record<FieldTypeEnum, DataItemType> = {
  [FieldTypeEnum.Text]: "Text",
  [FieldTypeEnum.Integer]: "Number",
  [FieldTypeEnum.Decimal]: "Number",
  [FieldTypeEnum.Boolean]: "Boolean",
  [FieldTypeEnum.SingleSelect]: "SingleSelect",
  [FieldTypeEnum.MultiSelect]: "MultiSelect",
};