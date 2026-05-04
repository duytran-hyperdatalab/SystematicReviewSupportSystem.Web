import { type CandidatePaperDto, CandidateStatus } from "../types/paper";

export interface MockCandidate extends CandidatePaperDto {
  // Any UI-only fields for mocks
}

export interface OriginPaperSummary {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  totalReferences: number;
  suggestedCount: number;
  duplicateCount: number;
  year: string;
  journal?: string;
}

export const MOCK_ORIGIN_PAPERS: OriginPaperSummary[] = [
  {
    id: "orig1",
    title: "A Systematic Literature Review on Agentic AI Systems",
    authors: "Smith, J., & Doe, A.",
    year: "2024",
    journal: "Journal of Artificial Intelligence Research",
    abstract:
      "This paper provides a comprehensive overview of the current state of Agentic AI systems, focusing on their architecture, decision-making processes, and applications in complex environments. We perform a systematic literature review covering 150+ papers from the last decade.",
    totalReferences: 5,
    suggestedCount: 3,
    duplicateCount: 1,
  },
  {
    id: "orig2",
    title: "Deep Learning for Automated Documentation: A Review",
    authors: "White, B., & Black, C.",
    year: "2023",
    journal: "IEEE Transactions on Software Engineering",
    abstract:
      "The automation of software documentation using deep learning techniques has seen significant growth. This review analyzes various models including RNNs, Transformers, and LLMs for generating high-quality documentation from source code.",
    totalReferences: 3,
    suggestedCount: 1,
    duplicateCount: 0,
  },
  {
    id: "orig3",
    title: "Empirical Studies in Software Engineering: Best Practices",
    authors: "Kitchenham, B.",
    year: "2022",
    journal: "Empirical Software Engineering Journal",
    abstract:
      "This foundational paper outlines best practices for conducting empirical studies in software engineering. It discusses methodology, threats to validity, and common pitfalls in experimental design and systematic reviews.",
    totalReferences: 3,
    suggestedCount: 2,
    duplicateCount: 1,
  },
];

export const MOCK_SNOWBALL_CANDIDATES: MockCandidate[] = [
  {
    candidateId: "c1",
    originPaperId: "orig1",
    originPaperTitle: "A Systematic Literature Review on Agentic AI Systems",
    title: "Understanding Large Language Model Agents in Software Engineering",
    authors: "Brown, M., Wilson, K.",
    publicationYear: "2023",
    doi: "10.1145/1234567.1234567",
    rawReference:
      "Brown, M., Wilson, K. (2023). Understanding Large Language Model Agents in Software Engineering. ICSE 2023.",
    status: CandidateStatus.Detected,
    statusText: "Created",
    confidenceScore: 0.95,
    extractionQualityScore: 0.92,
    matchConfidenceScore: 0.85,
    isSelectedInProjectRepository: false,
    validationNote: "High quality extraction, potential match found in Scopus.",
  },
  {
    candidateId: "c2",
    originPaperId: "orig1",
    originPaperTitle: "A Systematic Literature Review on Agentic AI Systems",
    title: "Autonomous Agents for Bug Localization: A Preliminary Study",
    authors: "Lee, S., Park, J.",
    publicationYear: "2022",
    doi: "10.1109/ASE.2022.00045",
    rawReference:
      "Lee, S., Park, J. (2022). Autonomous Agents for Bug Localization: A Preliminary Study. ASE 2022.",
    status: CandidateStatus.Matched,
    statusText: "Matched",
    confidenceScore: 0.88,
    extractionQualityScore: 0.85,
    matchConfidenceScore: 0.72,
    isSelectedInProjectRepository: true,
    validationNote: "Already present in current screening phase.",
  },
  {
    candidateId: "c3",
    originPaperId: "orig1",
    originPaperTitle: "A Systematic Literature Review on Agentic AI Systems",
    title: "Generative AI in the Software Development Lifecycle",
    authors: "Garcia, R.",
    publicationYear: "2023",
    doi: "10.1145/3333333.3333333",
    rawReference:
      "Garcia, R. (2023). Generative AI in the Software Development Lifecycle. Communications of the ACM.",
    status: CandidateStatus.Rejected,
    statusText: "Detected",
    confidenceScore: 0.45,
    extractionQualityScore: 0.35,
    matchConfidenceScore: 0,
    isSelectedInProjectRepository: false,
    validationNote: "Low extraction quality: missing abstract and keywords.",
  },
  {
    candidateId: "c4",
    originPaperId: "orig1",
    originPaperTitle: "A Systematic Literature Review on Agentic AI Systems",
    title: "Large Language Models for Code Generation: A Survey",
    authors: "Chen, H., et al.",
    publicationYear: "2021",
    doi: "",
    rawReference:
      "Chen, H., et al. (2021). Large Language Models for Code Generation: A Survey. arXiv preprint.",
    status: CandidateStatus.Suggested,
    statusText: "Created",
    confidenceScore: 0.92,
    extractionQualityScore: 0.65,
    matchConfidenceScore: 0.45,
    isSelectedInProjectRepository: false,
    validationNote: "Fuzzy match found with existing study #42.",
  },
  {
    candidateId: "c5",
    originPaperId: "orig1",
    originPaperTitle: "A Systematic Literature Review on Agentic AI Systems",
    title: "Multi-Agent Systems for Distributed Problem Solving",
    authors: "Johnson, P., Miller, T.",
    publicationYear: "2020",
    doi: "10.1007/s10458-020-09456-7",
    rawReference:
      "Johnson, P., Miller, T. (2020). Multi-Agent Systems for Distributed Problem Solving. Autonomous Agents and Multi-Agent Systems.",
    status: CandidateStatus.Detected,
    statusText: "Created",
    confidenceScore: 0.72,
    extractionQualityScore: 0.75,
    matchConfidenceScore: 0.15,
    isSelectedInProjectRepository: false,
    validationNote: "New Entry: No match found in current database.",
  },
];
