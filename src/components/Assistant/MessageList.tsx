import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { AssistantErrorBoundary } from './AssistantErrorBoundary';
import { AssistantMarkdown } from './AssistantMarkdown';
import { ReplyAnnouncer } from './ReplyAnnouncer';
import { ThinkingDots } from './ThinkingDots';
import { MessageCard } from './cards/MessageCard';
import { isThinking } from './isThinking';
import { NavigationVisibilityProvider } from './navigation/NavigationVisibilityContext';
import { toSafeHttpUrl } from './safeUrl';
import { AssistantMessage, MessageRole } from './types';
import { useErrorText } from './useErrorText';

const List = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

const Item = styled('div', {
  shouldForwardProp: (prop) => prop !== 'sender',
})<{ sender: MessageRole }>(({ theme, sender }) => ({
  display: 'flex',
  justifyContent:
    sender === 'user'
      ? 'flex-end'
      : sender === 'system'
        ? 'center'
        : 'flex-start',
  marginBottom: theme.spacing(1.5),
}));

const Bubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'sender',
})<{ sender: MessageRole }>(({ theme, sender }) => ({
  maxWidth: '90%',
  minWidth: 0,
  overflowWrap: 'anywhere',
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
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { t } = useTranslation();
  const { role, content, cards, citations, status, working } = message;
  const errorText = useErrorText(message.errorReason);
  const safeCitations = citations.flatMap((citation) => {
    const url = toSafeHttpUrl(citation.url);
    return url ? [{ title: citation.title, url }] : [];
  });

  if (role === 'system') {
    return (
      <Item sender={role}>
        <Typography variant="caption" color="text.secondary" align="center">
          {content}
        </Typography>
      </Item>
    );
  }

  return (
    <Item sender={role}>
      <Bubble sender={role}>
        <span style={visuallyHidden}>
          {role === 'user' ? t('You') : t('Guide')}
        </span>
        {role === 'user' ? (
          <Typography variant="body2" whiteSpace="pre-wrap">
            {content}
          </Typography>
        ) : (
          <AssistantMarkdown>{content}</AssistantMarkdown>
        )}
        {isThinking(message) && <ThinkingDots />}
        {working && (
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <CircularProgress size={14} aria-hidden />
            <Typography variant="caption" color="text.secondary">
              {t('Working')}
            </Typography>
          </Stack>
        )}
        {cards.length > 0 && (
          <Stack spacing={1} mt={1} alignItems="flex-start">
            {cards.map((card, index) => (
              <MessageCard key={index} card={card} />
            ))}
          </Stack>
        )}
        {status === 'stopped' && !content && (
          <Typography variant="body2" color="text.secondary">
            {t('Stopped.')}
          </Typography>
        )}
        {status === 'error' && (
          <Typography variant="body2" color="error" mt={content ? 1 : 0}>
            {errorText}
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
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  streaming,
}) => {
  const { t } = useTranslation();
  const endRef = useRef<HTMLDivElement>(null);
  const hasNavigationCard = messages.some((message) =>
    message.cards.some((card) => card?.kind === 'navigation'),
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <>
      <Box
        role="log"
        aria-live="off"
        aria-busy={streaming}
        aria-label={t('Conversation')}
      >
        <List>
          <NavigationVisibilityProvider enabled={hasNavigationCard}>
            {messages.map((message) => (
              <li key={message.id}>
                <AssistantErrorBoundary>
                  <MessageItem message={message} />
                </AssistantErrorBoundary>
              </li>
            ))}
          </NavigationVisibilityProvider>
        </List>
        <div ref={endRef} />
      </Box>
      <ReplyAnnouncer messages={messages} />
    </>
  );
};
