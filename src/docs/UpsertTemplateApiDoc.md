# Upsert Extraction Template API Documentation

> **Base URL**: `/api`
> **Last Updated**: 2026-03-14
> **Backend**: ASP.NET Core (.NET 8)

---

## Table of Contents

1. [Overview](#overview)
2. [Common Types](#common-types)
3. [Endpoint](#endpoint)
4. [Error Handling](#error-handling)
5. [Frontend Integration Guide](#frontend-integration-guide)
6. [Ready-to-Use TypeScript Types](#ready-to-use-typescript-types)
7. [Example API Calls](#example-api-calls)

---

## Overview

The Upsert Extraction Template API allows frontend applications to **create** or **update** a Data Extraction Template used in the Systematic Literature Review process. A template defines a structured form (with fields, options, and hierarchical sub-fields) that reviewers use to extract data from included studies.

### Key Concepts

| Concept | Description |
|---|---|
| **Extraction Template** | A reusable form structure attached to a Review Protocol, defining what data to extract from studies |
| **Extraction Field** | A single data point to collect (e.g., "Sample Size", "Study Design"). Supports recursive nesting via sub-fields |
| **Field Option** | A predefined choice for SingleSelect/MultiSelect fields |
| **Upsert** | Create if `templateId` is `null`/empty; Update if a valid `templateId` is provided |

### FieldType Enum Values

| Value | Name | Description |
|---|---|---|
| 0 | `Text` | Free-text input |
| 1 | `Integer` | Whole number |
| 2 | `Decimal` | Decimal number |
| 3 | `Boolean` | Yes/No (true/false) |
| 4 | `SingleSelect` | Pick exactly one option from a list |
| 5 | `MultiSelect` | Pick one or more options from a list |

---

## Common Types

### Standard API Response Wrapper

Every response from this API is wrapped in an `ApiResponse<T>` envelope:

```typescript
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[] | null;
  data?: T | null;
}

interface ApiError {
  code: string;
  message: string;
}
```

---

## Endpoint

---

### Upsert Extraction Template

Creates a new Extraction Template or updates an existing one. This is a **single endpoint** that handles both **create** and **update** operations based on whether `templateId` is provided.

#### 1. Basic Info

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/data-extraction/templates/upsert` |
| **Purpose** | Create or update an Extraction Template with its full field tree |

#### 2. Request Details

**Headers**

| Header | Value | Required |
|---|---|---|
| `Content-Type` | `application/json` | ✅ Yes |

**Path Parameters**: None

**Query Parameters**: None

**Request Body Schema (TypeScript)**

```typescript
interface ExtractionTemplateRequest {
  /** null/undefined = CREATE new template; valid UUID = UPDATE existing template */
  templateId?: string | null;
  /** UUID of the Review Protocol this template belongs to */
  protocolId: string;          // Required
  /** Template name */
  name: string;                // Required, max 500 chars
  /** Optional description */
  description?: string | null; // Optional, max 2000 chars
  /** Recursive tree of extraction fields */
  fields: ExtractionFieldRequest[];  // Required, at least 1 field
}

interface ExtractionFieldRequest {
  /** null for new fields; passed back unchanged on update */
  fieldId?: string | null;
  /** Filled by backend — FE can omit or send null */
  templateId?: string | null;
  /** null = root field; UUID = sub-field of another field */
  parentFieldId?: string | null;
  /** Field name */
  name: string;                // Required, max 500 chars
  /** Helper text/instruction for reviewers */
  instruction?: string | null; // Optional, max 2000 chars
  /** 0=Text, 1=Integer, 2=Decimal, 3=Boolean, 4=SingleSelect, 5=MultiSelect */
  fieldType: number;           // Required
  /** Whether this field must be filled in during extraction */
  isRequired: boolean;
  /** Display order (0-based) */
  orderIndex: number;
  /** Options for SingleSelect/MultiSelect — required if fieldType is 4 or 5 */
  options: FieldOptionRequest[];
  /** Nested sub-fields (recursive) */
  subFields: ExtractionFieldRequest[];
}

interface FieldOptionRequest {
  /** null for new options; UUID for existing options */
  optionId?: string | null;
  /** Filled by backend — FE can omit or send null */
  fieldId?: string | null;
  /** The option text/value */
  value: string;               // Required, max 500 chars
  /** Display order. Defaults to 0 if not provided */
  displayOrder?: number;       // Optional, default 0
}
```

**Required vs Optional Fields**

| Field | Required | Default | Notes |
|---|---|---|---|
| `templateId` | ❌ Optional | `null` | `null` → create, UUID → update |
| `protocolId` | ✅ Required | — | Must be a valid Review Protocol UUID |
| `name` | ✅ Required | — | Max 500 chars |
| `description` | ❌ Optional | `null` | Max 2000 chars |
| `fields` | ✅ Required | — | At least 1 field required |
| `fields[].name` | ✅ Required | — | Max 500 chars |
| `fields[].fieldType` | ✅ Required | — | Must be 0–5 |
| `fields[].isRequired` | ✅ Required | `false` | — |
| `fields[].orderIndex` | ✅ Required | `0` | — |
| `fields[].options` | Conditional | `[]` | Required (≥ 2 items) if fieldType is 4 or 5 |
| `fields[].options[].value` | ✅ Required | — | Cannot be empty/whitespace |

**Validation Rules**

| Rule | Code | Error Message |
|---|---|---|
| Template name cannot be empty | `TEMPLATE_NAME_REQUIRED` | `"Template name is required"` |
| Must have at least 1 field | `NO_FIELDS` | `"Template must have at least one field"` |
| No duplicate field names at the same level | `DUPLICATE_FIELD_NAME` | `"Field name '{name}' is duplicated at indices {indices}"` |
| SingleSelect/MultiSelect must have ≥ 2 options | `INVALID_OPTION_COUNT` | `"Field '{name}' with type SingleSelect must have at least 2 options, found {count}"` |
| Option value cannot be empty | `EMPTY_OPTION_VALUE` | `"Field '{name}' has option with empty value"` |
| FieldType must be 0–5 | `INVALID_FIELD_TYPE` | `"Field '{name}' has invalid type {value}"` |

#### 3. Response Details

**Success Response — `200 OK`**

```typescript
interface ApiResponse<ExtractionTemplateResponse> {
  isSuccess: true;
  message: "Lưu extraction template thành công";
  data: ExtractionTemplateResponse;
}
```

**`ExtractionTemplateResponse` Schema**

```typescript
interface ExtractionTemplateResponse {
  templateId: string;           // UUID of the created/updated template
  protocolId: string;           // UUID of the parent protocol
  name: string;
  description?: string | null;
  /** Full tree of fields (recursive), ordered by orderIndex */
  fields: ExtractionFieldResponse[];
}

interface ExtractionFieldResponse {
  fieldId: string;              // UUID
  templateId: string;           // UUID
  parentFieldId?: string | null;
  name: string;
  instruction?: string | null;
  fieldType: number;            // 0–5
  isRequired: boolean;
  orderIndex: number;
  options: FieldOptionResponse[];
  subFields: ExtractionFieldResponse[];  // Nested children, recursive
}

interface FieldOptionResponse {
  optionId: string;             // UUID
  fieldId: string;              // UUID
  value: string;
  displayOrder: number;
}
```

**Error Responses**

| Status | Condition | Exception Type |
|---|---|---|
| `400` | Validation fails (see validation rules above) | `InvalidOperationException` |
| `404` | `templateId` provided but template not found | `KeyNotFoundException` |
| `500` | Unexpected server error | — |

**Important Response Notes**
- On success, the API returns the **full template tree** reloaded from the database, including all auto-generated `fieldId`, `templateId`, and `optionId` values.
- After an **update**, all old fields and options are **deleted and recreated** — so all `fieldId` and `optionId` values will be **new UUIDs** (even for fields that were not modified).

#### 4. Business Logic Summary

1. **Validates** the entire template DTO first (name, fields, options, field types). If validation fails, throws `InvalidOperationException` with all error messages concatenated.
2. **Determines CREATE or UPDATE** based on `templateId`:
   - **CREATE** (`templateId` is `null` or empty GUID):
     - Creates a new `ExtractionTemplate` entity.
     - Generates new UUIDs for all fields and options.
     - Recursively flattens the field tree into entities and persists them.
   - **UPDATE** (`templateId` is a valid GUID):
     - Loads the existing template. If not found → throws `KeyNotFoundException`.
     - Updates `name` and `description`.
     - **Deletes ALL existing fields and their options** for this template.
     - Re-creates all fields and options from the request body with new UUIDs.
3. **Saves everything** in a single database transaction (atomically via `SaveChangesAsync`).
4. **Reloads** the full template tree from the database and returns it.

> ⚠️ **Important**: The UPDATE operation uses a **delete-and-recreate** strategy for fields. This means:
> - All `fieldId` values change on every update.
> - If other entities reference `fieldId` (e.g., `ExtractionAnswer`, `ExtractedDataValue`), those references will break after an update.
> - FE should **not** cache or persist `fieldId` values across updates.

#### 5. Frontend Integration Notes

**When FE should call this API**
- When the user clicks "Save Template" or "Create Template" on the template builder/editor page.
- Send the **entire template tree** every time — there is no partial update.

**Common Pitfalls**
1. **Always send the full field tree** — The backend deletes all existing fields on update and recreates from scratch. You cannot send only changed fields.
2. **`templateId: null` = CREATE, `templateId: UUID` = UPDATE** — Be careful not to accidentally send `templateId: ""` (empty string) which would fail validation.
3. **`fieldId` values change on update** — Don't rely on field IDs being stable across updates.
4. **Options are required for select fields** — If `fieldType` is `4` (SingleSelect) or `5` (MultiSelect), you must send at least 2 options. The backend will reject the request otherwise.
5. **Sub-fields are recursive** — You can nest sub-fields inside sub-fields to any depth.
6. **Duplicate field name check is flat** — Only root-level field names are checked for duplicates; sub-field names can repeat.

**Loading / Error Handling Suggestions**

| Scenario | Suggestion |
|---|---|
| Saving template | Show a loading spinner on the "Save" button; disable the button to prevent double-submit |
| Validation error (400) | Parse the error message and highlight the problematic fields in the form |
| Template not found (404) | Show "Template not found" and redirect to the template list |
| Server error (500) | Show a generic error toast |

**Race Conditions to Watch**
- **Double-click on Save**: Disable the save button immediately after click to prevent creating duplicate templates.
- **Concurrent edits**: If two users edit the same template simultaneously, the last save wins (delete-and-recreate strategy). Consider adding an optimistic lock in the future.

#### 6. Ready-to-Use FE Types

```typescript
// ==========================================
// Enums
// ==========================================

export enum FieldType {
  Text = 0,
  Integer = 1,
  Decimal = 2,
  Boolean = 3,
  SingleSelect = 4,
  MultiSelect = 5,
}

// ==========================================
// API Response Wrapper
// ==========================================

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = undefined> {
  isSuccess: boolean;
  message: string;
  errors?: ApiError[] | null;
  data?: T | null;
}

// ==========================================
// Request Types
// ==========================================

export interface UpsertExtractionTemplateRequest {
  /** null = create, UUID = update */
  templateId?: string | null;
  /** UUID of the parent Review Protocol */
  protocolId: string;
  /** Template name (required, max 500 chars) */
  name: string;
  /** Optional description (max 2000 chars) */
  description?: string | null;
  /** Full field tree — at least 1 field required */
  fields: ExtractionFieldRequest[];
}

export interface ExtractionFieldRequest {
  fieldId?: string | null;
  templateId?: string | null;
  parentFieldId?: string | null;
  name: string;
  instruction?: string | null;
  /** 0=Text, 1=Integer, 2=Decimal, 3=Boolean, 4=SingleSelect, 5=MultiSelect */
  fieldType: FieldType;
  isRequired: boolean;
  orderIndex: number;
  options: FieldOptionRequest[];
  subFields: ExtractionFieldRequest[];
}

export interface FieldOptionRequest {
  optionId?: string | null;
  fieldId?: string | null;
  value: string;
  displayOrder?: number;
}

// ==========================================
// Response Types
// ==========================================

export interface ExtractionTemplateResponse {
  templateId: string;
  protocolId: string;
  name: string;
  description?: string | null;
  fields: ExtractionFieldResponse[];
}

export interface ExtractionFieldResponse {
  fieldId: string;
  templateId: string;
  parentFieldId?: string | null;
  name: string;
  instruction?: string | null;
  fieldType: FieldType;
  isRequired: boolean;
  orderIndex: number;
  options: FieldOptionResponse[];
  subFields: ExtractionFieldResponse[];
}

export interface FieldOptionResponse {
  optionId: string;
  fieldId: string;
  value: string;
  displayOrder: number;
}
```

---

## Example API Calls

### Using `fetch`

```typescript
const BASE_URL = "https://your-api-domain.com/api";

// CREATE a new Extraction Template
async function createExtractionTemplate(
  request: UpsertExtractionTemplateRequest
): Promise<ApiResponse<ExtractionTemplateResponse>> {
  const response = await fetch(
    `${BASE_URL}/data-extraction/templates/upsert`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  return response.json();
}
```

### Using `axios`

```typescript
import axios from "axios";

const api = axios.create({ baseURL: "https://your-api-domain.com/api" });

export const upsertExtractionTemplate = (
  data: UpsertExtractionTemplateRequest
) =>
  api.post<ApiResponse<ExtractionTemplateResponse>>(
    "/data-extraction/templates/upsert",
    data
  );
```

### Full Request Body Example

```json
{
  "templateId": null,
  "protocolId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "name": "Software Engineering Data Extraction Form",
  "description": "Standard extraction template for SE systematic reviews",
  "fields": [
    {
      "fieldId": null,
      "name": "Study Design",
      "instruction": "Select the primary study design used",
      "fieldType": 4,
      "isRequired": true,
      "orderIndex": 0,
      "options": [
        { "value": "Controlled Experiment", "displayOrder": 1 },
        { "value": "Case Study", "displayOrder": 2 },
        { "value": "Survey", "displayOrder": 3 },
        { "value": "Action Research", "displayOrder": 4 }
      ],
      "subFields": []
    },
    {
      "fieldId": null,
      "name": "Sample Size",
      "instruction": "Enter the number of participants or data points",
      "fieldType": 1,
      "isRequired": true,
      "orderIndex": 1,
      "options": [],
      "subFields": []
    },
    {
      "fieldId": null,
      "name": "Quality Assessment",
      "instruction": "Overall quality assessment of the study",
      "fieldType": 0,
      "isRequired": false,
      "orderIndex": 2,
      "options": [],
      "subFields": [
        {
          "fieldId": null,
          "name": "Internal Validity",
          "instruction": "Rate the internal validity (1-5)",
          "fieldType": 1,
          "isRequired": true,
          "orderIndex": 0,
          "options": [],
          "subFields": []
        },
        {
          "fieldId": null,
          "name": "External Validity",
          "instruction": "Rate the external validity (1-5)",
          "fieldType": 1,
          "isRequired": true,
          "orderIndex": 1,
          "options": [],
          "subFields": []
        }
      ]
    },
    {
      "fieldId": null,
      "name": "Key Findings",
      "instruction": "Summarize the key findings of the study",
      "fieldType": 0,
      "isRequired": true,
      "orderIndex": 3,
      "options": [],
      "subFields": []
    }
  ]
}
```

### Success Response Example

```json
{
  "isSuccess": true,
  "message": "Lưu extraction template thành công",
  "errors": null,
  "data": {
    "templateId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "protocolId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "name": "Software Engineering Data Extraction Form",
    "description": "Standard extraction template for SE systematic reviews",
    "fields": [
      {
        "fieldId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "templateId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "parentFieldId": null,
        "name": "Study Design",
        "instruction": "Select the primary study design used",
        "fieldType": 4,
        "isRequired": true,
        "orderIndex": 0,
        "options": [
          {
            "optionId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
            "fieldId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            "value": "Controlled Experiment",
            "displayOrder": 1
          },
          {
            "optionId": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
            "fieldId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            "value": "Case Study",
            "displayOrder": 2
          },
          {
            "optionId": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
            "fieldId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            "value": "Survey",
            "displayOrder": 3
          },
          {
            "optionId": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
            "fieldId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            "value": "Action Research",
            "displayOrder": 4
          }
        ],
        "subFields": []
      },
      {
        "fieldId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "templateId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "parentFieldId": null,
        "name": "Sample Size",
        "instruction": "Enter the number of participants or data points",
        "fieldType": 1,
        "isRequired": true,
        "orderIndex": 1,
        "options": [],
        "subFields": []
      },
      {
        "fieldId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "templateId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "parentFieldId": null,
        "name": "Quality Assessment",
        "instruction": "Overall quality assessment of the study",
        "fieldType": 0,
        "isRequired": false,
        "orderIndex": 2,
        "options": [],
        "subFields": [
          {
            "fieldId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
            "templateId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            "parentFieldId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
            "name": "Internal Validity",
            "instruction": "Rate the internal validity (1-5)",
            "fieldType": 1,
            "isRequired": true,
            "orderIndex": 0,
            "options": [],
            "subFields": []
          },
          {
            "fieldId": "d4e5f6a7-b8c9-0123-def0-1234567890ab",
            "templateId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            "parentFieldId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
            "name": "External Validity",
            "instruction": "Rate the external validity (1-5)",
            "fieldType": 1,
            "isRequired": true,
            "orderIndex": 1,
            "options": [],
            "subFields": []
          }
        ]
      },
      {
        "fieldId": "e5f6a7b8-c9d0-1234-ef01-234567890abc",
        "templateId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "parentFieldId": null,
        "name": "Key Findings",
        "instruction": "Summarize the key findings of the study",
        "fieldType": 0,
        "isRequired": true,
        "orderIndex": 3,
        "options": [],
        "subFields": []
      }
    ]
  }
}
```

### Validation Error Response Example

```json
{
  "isSuccess": false,
  "message": "Template validation failed: Field 'Methodology' with type SingleSelect must have at least 2 options, found 1, Field name 'Sample Size' is duplicated at indices 1, 3",
  "errors": null,
  "data": null
}
```

---

## Quick Reference Card

| Action | Method | Route | Success Status | Returns |
|---|---|---|---|---|
| Create / Update Template | `POST` | `/api/data-extraction/templates/upsert` | `200 OK` | `ExtractionTemplateResponse` |
