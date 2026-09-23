export interface NavigationIntent {
  type: string;
  params: Record<string, unknown>;
}

export interface NavigationCardData {
  kind: 'navigation';
  intent: NavigationIntent;
  label: string;
}

export interface HandoffCardData {
  kind: 'handoff';
  summary: string;
  contact_form: {
    name: string;
    email: string;
    url: string;
  };
}

export interface FiguresCardData {
  kind: 'figures';
  items: Array<{ label: string; value: string | number; unit?: string }>;
}

export interface ContactCardData {
  kind: 'contact';
  contact_id: string;
}

export interface ProposedActionCardData {
  kind: 'proposed_action';
  action: {
    type: string;
    params: Record<string, unknown>;
  };
}

export type AssistantCard =
  | NavigationCardData
  | HandoffCardData
  | FiguresCardData
  | ContactCardData
  | ProposedActionCardData;

export interface AssistantCitation {
  title: string;
  url: string;
}

interface BaseEvent {
  message_id: string;
}

export type AssistantEvent =
  | (BaseEvent & { type: 'generation_start' })
  | (BaseEvent & { type: 'chunk'; delta: string })
  | (BaseEvent & { type: 'card'; card: AssistantCard })
  | (BaseEvent & { type: 'tool_start'; tool: string })
  | (BaseEvent & { type: 'tool_end'; tool: string })
  | (BaseEvent & {
      type: 'generation_complete';
      citations?: AssistantCitation[];
    })
  | (BaseEvent & { type: 'generation_error'; error?: string });

export type MessageRole = 'user' | 'assistant';

export type MessageStatus = 'streaming' | 'complete' | 'stopped' | 'error';

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  content: string;
  cards: AssistantCard[];
  citations: AssistantCitation[];
  status: MessageStatus;
  working: boolean;
}
