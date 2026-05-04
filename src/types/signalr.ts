import { type ExtractionSuggestionResponse } from "./studySelection";

export interface SignalRMessage {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  type: 'all' | 'user' | 'group';
}

export const ConnectionState = {
  Disconnected: 'Disconnected',
  Connecting: 'Connecting',
  Connected: 'Connected',
  Reconnecting: 'Reconnecting'
} as const;

export type ConnectionState = typeof ConnectionState[keyof typeof ConnectionState];

export interface MetadataExtractedPayload {
  paperId: string;
  suggestion: ExtractionSuggestionResponse;
}

export interface SignalREvents {
  ReceiveMessage: (message: SignalRMessage) => void;
  ReceiveUserMessage: (message: SignalRMessage) => void;
  ReceiveGroupMessage: (message: SignalRMessage) => void;
  OnMetadataExtracted: (payload: MetadataExtractedPayload) => void;
}
