import React, { useEffect, useRef, useState } from 'react';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { AssistantMessage } from './types';
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

interface ReplyAnnouncerProps {
  messages: AssistantMessage[];
}

// Speaks each finished sentence once instead of letting the log reread the whole reply on every chunk
export const ReplyAnnouncer: React.FC<ReplyAnnouncerProps> = ({ messages }) => {
  const { t } = useTranslation();
  const reply = messages.findLast((message) => message.role === 'assistant');
  const errorText = useErrorText(reply?.errorReason);
  const [announcement, setAnnouncement] = useState('');
  // Starts past whatever is already on screen so reopening the drawer stays quiet
  const progress = useRef({
    id: reply?.id,
    spoken: reply?.content.length ?? 0,
    done: reply?.status !== 'streaming',
  });

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
