# AI Setup API Documentation

The `AiSetupController` provides endpoints for leveraging AI to assist in the initial setup of a Systematic Literature Review (SLR) project, including topic analysis, PICO-C generation, and research question suggestion.

**Base Route:** `api/projects/{projectId}/ai-setup`

---

## 1. Analyze Topic
Analyzes a raw research topic to identify the scientific domain and synthesize a research objective.

- **URL:** `/analyze-topic`
- **Method:** `POST`
- **Description:** Uses AI to extract structured metadata from a research idea.

### Request Body
```json
{
  "topic": "Application of Deep Learning in Diabetic Retinopathy Detection",
  "language": "English"
}
```

### Success Response
- **Code:** 200 OK
- **Body:**
```json
{
  "success": true,
  "message": "Topic analyzed successfully.",
  "data": {
    "objectives": "To evaluate the effectiveness of various deep learning architectures in the automated detection and classification of diabetic retinopathy from retinal images.",
    "domain": "Health Informatics / Artificial Intelligence"
  }
}
```

---

## 2. Generate PICO-C
Generates PICO-C (Population, Intervention, Comparator, Outcome, Context) elements based on the project context.

- **URL:** `/generate-picoc`
- **Method:** `POST`
- **Description:** Generates structured SLR elements to define the research scope.

### Request Body
```json
{
  "topic": "Application of Deep Learning in Diabetic Retinopathy Detection",
  "objectives": "To evaluate the effectiveness of various deep learning architectures...",
  "domain": "Health Informatics / Artificial Intelligence",
  "language": "English"
}
```

### Success Response
- **Code:** 200 OK
- **Body:**
```json
{
  "success": true,
  "message": "PICO-C generated successfully.",
  "data": {
    "population": "Patients with suspected or diagnosed diabetic retinopathy.",
    "intervention": "Deep learning-based automated detection systems.",
    "comparator": "Manual screening by ophthalmologists or traditional image processing methods.",
    "outcome": "Diagnostic accuracy (sensitivity, specificity), AUC-ROC, and processing time.",
    "context": "Clinical settings using fundus photography."
  }
}
```

---

## 3. Generate Research Questions (RQs)
Suggests a set of high-quality research questions based on the defined PICO-C scope.

- **URL:** `/generate-rqs`
- **Method:** `POST`
- **Description:** Suggests 3-5 researchable questions for the SLR.

### Request Body
```json
{
  "topic": "...",
  "objectives": "...",
  "domain": "...",
  "picoc": {
    "population": "...",
    "intervention": "...",
    "comparator": "...",
    "outcome": "...",
    "context": "..."
  },
  "language": "English"
}
```

### Success Response
- **Code:** 200 OK
- **Body:**
```json
{
  "success": true,
  "message": "Research questions suggested successfully.",
  "data": {
    "suggestedQuestions": [
      "What are the state-of-the-art deep learning architectures currently used for diabetic retinopathy detection?",
      "How do deep learning models compare to traditional clinical screening in terms of diagnostic accuracy?",
      "What are the primary technical challenges in deploying deep learning models for retinal image analysis in real-world clinical environments?"
    ]
  }
}
```

---

## 4. Get Setup Details
Retrieves the current setup details for a project, including Topic, Objectives, PICO-C, and Research Questions.

- **URL:** `/setup-details`
- **Method:** `GET`
- **Description:** Fetches the saved setup information from the database.

### Success Response
- **Code:** 200 OK
- **Body:**
```json
{
  "success": true,
  "message": "Project setup details retrieved successfully.",
  "data": {
    "researchTopic": "...",
    "researchObjective": "...",
    "domain": "...",
    "picoc": {
      "population": "...",
      "intervention": "...",
      "comparator": "...",
      "outcome": "...",
      "context": "..."
    },
    "researchQuestions": [
      {
        "id": "guid",
        "questionText": "..."
      }
    ]
  }
}
```

---

## 5. Update Setup Details
Updates and persists the project setup details in the database.

- **URL:** `/setup-details`
- **Method:** `PUT`
- **Description:** Saves the final selection of Topic, PICO-C, and Research Questions.

### Request Body
```json
{
  "researchTopic": "...",
  "researchObjective": "...",
  "domain": "...",
  "picoc": {
    "population": "...",
    "intervention": "...",
    "comparator": "...",
    "outcome": "...",
    "context": "..."
  },
  "finalResearchQuestions": [
    {
      "id": "optional-guid",
      "questionText": "What is the accuracy of Model X?"
    }
  ]
}
```

### Success Response
- **Code:** 200 OK
- **Body:**
```json
{
  "success": true,
  "message": "Project setup updated successfully.",
  "data": null
}
```
