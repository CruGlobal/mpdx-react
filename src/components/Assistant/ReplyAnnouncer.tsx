import React, { useEffect, useRef, useState } from 'react';
import { visuallyHidden } from '@mui/utils';
import { TFunction, useTranslation } from 'react-i18next';
import { AssistantCard, AssistantMessage } from './types';
import { useErrorText } from './useErrorText';

const sentenceEnd = /[.!?:](?=\s)|\n/g;

const lastSentenceEnd = (text: string, from: number): number => {
  let end = from;
  for (const match of text.slice(from).matchAll(sentenceEnd)) {
    end = from + match.index + match[0].length;
  }
  return end;
};

const toSpokenText = (markdown: string): string =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const cardTitle = (card: AssistantCard, t: TFunction): string | null => {
  switch (card.kind) {
    case 'navigation':
      return card.label;
    case 'handoff':
      return t('Summary for the help desk');
    default:
      return null;
  }
};

const latestReply = (
  messages: AssistantMessage[],
): AssistantMessage | undefined => {
  for (let index = messages.length - 1; index >= 0; index--) {
    if (messages[index].role === 'assistant') {
      return messages[index];
    }
  }
  return undefined;
};

interface ReplyAnnouncerProps {
  messages: AssistantMessage[];
}

// Speaks each finished sentence once instead of letting the log reread the whole reply on every chunk
export const ReplyAnnouncer: React.FC<ReplyAnnouncerProps> = ({ messages }) => {
  const { t } = useTranslation();
  const reply = latestReply(messages);
  const errorText = useErrorText(reply?.errorReason);
  const [announcement, setAnnouncement] = useState('');
  // Starts past whatever is already on screen so reopening the drawer stays quiet
  const progress = useRef(
    reply?.status === 'streaming'
      ? { id: reply.id, spoken: lastSentenceEnd(reply.content, 0), done: false }
      : { id: reply?.id, spoken: reply?.content.length ?? 0, done: true },
  );

  useEffect(() => {
    if (!reply) {
      setAnnouncement('');
      return;
    }
    if (progress.current.id !== reply.id) {
      progress.current = { id: reply.id, spoken: 0, done: false };
    }
    const current = progress.current;
    if (current.done) {
      return;
    }

    const finished = reply.status !== 'streaming';
    const end = finished
      ? reply.content.length
      : lastSentenceEnd(reply.content, current.spoken);
    const parts = [toSpokenText(reply.content.slice(current.spoken, end))];
    if (finished && !reply.content && reply.cards.length > 0) {
      parts.push(
        t('The assistant added a card.'),
        ...reply.cards.flatMap((card) => cardTitle(card, t) ?? []),
      );
    }
    if (reply.status === 'error') {
      parts.push(errorText);
    } else if (reply.status === 'stopped' && !reply.content) {
      parts.push(t('Stopped.'));
    }
    current.spoken = end;
    current.done = finished;

    const text = parts.filter(Boolean).join(' ');
    if (text) {
      setAnnouncement(text);
    }
  }, [reply, errorText, t]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={visuallyHidden}
      data-testid="ReplyAnnouncer"
    >
      {announcement}
    </div>
  );
};
