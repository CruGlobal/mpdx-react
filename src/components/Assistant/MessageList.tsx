import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { AssistantMarkdown } from './AssistantMarkdown';
import { MessageCard } from './cards/MessageCard';
import { toSafeHttpUrl } from './safeUrl';
import { AssistantMessage, MessageRole, NavigationIntent } from './types';

const List = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

const Item = styled('li', {
  shouldForwardProp: (prop) => prop !== 'sender',
})<{ sender: MessageRole }>(({ theme, sender }) => ({
  display: 'flex',
  justifyContent: sender === 'user' ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1.5),
}));

const Bubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'sender',
})<{ sender: MessageRole }>(({ theme, sender }) => ({
  maxWidth: '90%',
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.spacing(2),
  ...(sender === 'user'
    ? {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }
    : {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
      }),
}));

interface MessageItemProps {
  message: AssistantMessage;
  onNavigate: (intent: NavigationIntent) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onNavigate }) => {
  const { t } = useTranslation();
  const { role, content, cards, citations, status, working } = message;
  const waiting = status === 'streaming' && !content && !working;
  const safeCitations = citations.flatMap((citation) => {
    const url = toSafeHttpUrl(citation.url);
    return url ? [{ title: citation.title, url }] : [];
  });

  return (
    <Item sender={role}>
      <Bubble sender={role}>
        <span style={visuallyHidden}>
          {role === 'user' ? t('You') : t('Assistant')}
        </span>
        {role === 'user' ? (
          <Typography variant="body2" whiteSpace="pre-wrap">
            {content}
          </Typography>
        ) : (
          <AssistantMarkdown>{content}</AssistantMarkdown>
        )}
        {waiting && (
          <CircularProgress size={16} aria-label={t('Assistant is thinking')} />
        )}
        {working && (
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              {t('Working')}
            </Typography>
          </Stack>
        )}
        {cards.length > 0 && (
          <Stack spacing={1} mt={1} alignItems="flex-start">
            {cards.map((card, index) => (
              <MessageCard key={index} card={card} onNavigate={onNavigate} />
            ))}
          </Stack>
        )}
        {status === 'error' && (
          <Typography variant="body2" color="error" mt={content ? 1 : 0}>
            {t('Sorry, something went wrong. Please try again.')}
          </Typography>
        )}
        {safeCitations.length > 0 && (
          <Stack
            component="ul"
            spacing={0.5}
            mt={1}
            pl={0}
            sx={{ listStyle: 'none' }}
          >
            {safeCitations.map((citation, index) => (
              <li key={index}>
                <Link
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="caption"
                >
                  {citation.title}
                </Link>
              </li>
            ))}
          </Stack>
        )}
      </Bubble>
    </Item>
  );
};

interface MessageListProps {
  messages: AssistantMessage[];
  streaming: boolean;
  onNavigate: (intent: NavigationIntent) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  streaming,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <List
      role="log"
      aria-live="polite"
      aria-busy={streaming}
      aria-label={t('Conversation')}
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onNavigate={onNavigate}
        />
      ))}
      <div ref={endRef} />
    </List>
  );
};
