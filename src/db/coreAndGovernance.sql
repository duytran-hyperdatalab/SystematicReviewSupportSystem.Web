CREATE TABLE "systematic_review_project" (
  "project_id" uuid PRIMARY KEY,
  "title" varchar,
  "domain" varchar,
  "description" text,
  "status" varchar,
  "start_date" date,
  "end_date" date,
  "created_at" timestamp
);

CREATE TABLE "review_need" (
  "need_id" uuid PRIMARY KEY,
  "project_id" uuid NOT NULL,
  "description" text,
  "justification" text,
  "identified_by" varchar,
  "created_at" timestamp
);

CREATE TABLE "commissioning_document" (
  "document_id" uuid PRIMARY KEY,
  "project_id" uuid NOT NULL,
  "sponsor" varchar,
  "scope" text,
  "budget" decimal,
  "document_url" varchar,
  "created_at" timestamp
);

CREATE TABLE "review_objective" (
  "objective_id" uuid PRIMARY KEY,
  "project_id" uuid NOT NULL,
  "objective_statement" text,
  "created_at" timestamp
);

CREATE TABLE "question_type" (
  "question_type_id" uuid PRIMARY KEY,
  "name" varchar,
  "description" text
);

CREATE TABLE "research_question" (
  "research_question_id" uuid PRIMARY KEY,
  "project_id" uuid NOT NULL,
  "question_type_id" uuid NOT NULL,
  "question_text" text,
  "rationale" text,
  "created_at" timestamp
);

CREATE TABLE "picoc_element" (
  "picoc_id" uuid PRIMARY KEY,
  "research_question_id" uuid NOT NULL,
  "element_type" varchar,
  "description" text
);

CREATE TABLE "population" (
  "population_id" uuid PRIMARY KEY,
  "picoc_id" uuid NOT NULL,
  "description" text
);

CREATE TABLE "intervention" (
  "intervention_id" uuid PRIMARY KEY,
  "picoc_id" uuid NOT NULL,
  "description" text
);

CREATE TABLE "comparison" (
  "comparison_id" uuid PRIMARY KEY,
  "picoc_id" uuid NOT NULL,
  "description" text
);

CREATE TABLE "outcome" (
  "outcome_id" uuid PRIMARY KEY,
  "picoc_id" uuid NOT NULL,
  "metric" varchar,
  "description" text
);

CREATE TABLE "context" (
  "context_id" uuid PRIMARY KEY,
  "picoc_id" uuid NOT NULL,
  "environment" varchar,
  "description" text
);

ALTER TABLE "review_need" ADD FOREIGN KEY ("project_id") REFERENCES "systematic_review_project" ("project_id");

ALTER TABLE "commissioning_document" ADD FOREIGN KEY ("project_id") REFERENCES "systematic_review_project" ("project_id");

ALTER TABLE "review_objective" ADD FOREIGN KEY ("project_id") REFERENCES "systematic_review_project" ("project_id");

ALTER TABLE "research_question" ADD FOREIGN KEY ("project_id") REFERENCES "systematic_review_project" ("project_id");

ALTER TABLE "research_question" ADD FOREIGN KEY ("question_type_id") REFERENCES "question_type" ("question_type_id");

ALTER TABLE "picoc_element" ADD FOREIGN KEY ("research_question_id") REFERENCES "research_question" ("research_question_id");

ALTER TABLE "population" ADD FOREIGN KEY ("picoc_id") REFERENCES "picoc_element" ("picoc_id");

ALTER TABLE "intervention" ADD FOREIGN KEY ("picoc_id") REFERENCES "picoc_element" ("picoc_id");

ALTER TABLE "comparison" ADD FOREIGN KEY ("picoc_id") REFERENCES "picoc_element" ("picoc_id");

ALTER TABLE "outcome" ADD FOREIGN KEY ("picoc_id") REFERENCES "picoc_element" ("picoc_id");

ALTER TABLE "context" ADD FOREIGN KEY ("picoc_id") REFERENCES "picoc_element" ("picoc_id");
