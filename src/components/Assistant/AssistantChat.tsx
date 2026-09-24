import NextLink from 'next/link';
import React, {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import {
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { buildHelpjuiceContactUrl } from 'src/components/Helpjuice/contactUrl';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';
import { AssistantHeader, GuideStatus } from './AssistantHeader';
import { useAssistantContext } from './AssistantProvider';
import { MessageList } from './MessageList';
import { getAssistantUrl, useAssistantStream } from './useAssistantStream';
import { useAssistantToken } from './useAssistantToken';
import { useCurrentPageUrl } from './useCurrentPageUrl';

const MessageArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

const Footer = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2, 2),
}));

const Composer = styled('form')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
}));

const HelpDeskLink: React.FC = () => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const href = useCurrentPageUrl();

  if (!process.env.HELPJUICE_ORIGIN) {
    return null;
  }

  const contactUrl = buildHelpjuiceContactUrl({
    contactUrl: `${process.env.HELPJUICE_ORIGIN}/contact-us`,
    name: session?.user.name,
    email: session?.user.email,
    href,
  });

  return (
    <Button
      component="a"
      href={contactUrl}
      target="_blank"
      rel="noopener noreferrer"
      size="small"
      startIcon={<SupportAgentIcon />}
      sx={{ alignSelf: 'flex-start' }}
    >
      {t('Contact the help desk')}
    </Button>
  );
};

interface NotTurnedOnProps {
  accountListId: string;
}

const NotTurnedOn: React.FC<NotTurnedOnProps> = ({ accountListId }) => {
  const { t } = useTranslation();

  return (
    <Typography variant="body2" color="text.secondary">
      {t('The Guide is not turned on.')}{' '}
      <Link
        component={NextLink}
        href={`/accountLists/${accountListId}/settings/preferences`}
      >
        {t('Turn it on in the {{appName}} Guide tab of Preferences.', {
          appName: getAppName(),
        })}
      </Link>
    </Typography>
  );
};

interface MintFailedProps {
  onRetry?: () => void;
}

const MintFailed: React.FC<MintFailedProps> = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="body2" color="error">
        {t('Sorry, something went wrong. Please try again.')}
      </Typography>
      {onRetry && (
        <Button size="small" onClick={onRetry}>
          {t('Try again')}
        </Button>
      )}
    </Box>
  );
};

interface AssistantChatProps {
  titleId: string;
  onClose: () => void;
}

// Mounts only while the drawer is open, so session, route, and Apollo hooks stay out of the provider
export const AssistantChat: React.FC<AssistantChatProps> = ({
  titleId,
  onClose,
}) => {
  const { t } = useTranslation();
  const { messages, accountListId: transcriptAccountListId } =
    useAssistantContext();
  const accountListId = useOptionalAccountListId();
  // Until the transcript rebinds, it still holds another account list's conversation
  const visibleMessages =
    accountListId && transcriptAccountListId !== accountListId ? [] : messages;
  const configured = Boolean(getAssistantUrl());
  const {
    state: tokenState,
    token,
    refreshToken,
    retry,
  } = useAssistantToken(configured ? accountListId : null);
  const {
    sendMessage,
    stop,
    streaming,
    helpOnly,
    rateLimited,
    assistantDisabled,
  } = useAssistantStream({ accountListId, token, refreshToken });
  const [draft, setDraft] = useState('');
  const canSend =
    Boolean(draft.trim()) && tokenState.status === 'ready' && !rateLimited;
  // A reply in flight keeps its Stop button whatever happens to the token meanwhile
  const deadEnd =
    !streaming &&
    (tokenState.status === 'refusing' || tokenState.status === 'failed');
  const killSwitchNotice = configured && !deadEnd && assistantDisabled;
  const status: GuideStatus = killSwitchNotice
    ? 'off'
    : tokenState.status === 'ready'
      ? 'ready'
      : tokenState.status === 'minting'
        ? 'connecting'
        : tokenState.status === 'failed'
          ? 'failed'
          : 'off';
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasStreaming = useRef(streaming);
  const [buttonAnnouncement, setButtonAnnouncement] = useState('');

  useEffect(() => {
    if (wasStreaming.current && !streaming) {
      inputRef.current?.focus();
      setButtonAnnouncement(t('The Stop button is now a Send button.'));
    } else if (!wasStreaming.current && streaming) {
      setButtonAnnouncement(t('The Send button is now a Stop button.'));
    }
    wasStreaming.current = streaming;
  }, [streaming, t]);

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (streaming || !canSend) {
      return;
    }
    const content = draft.trim();
    setDraft('');
    sendMessage(content);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <AssistantHeader titleId={titleId} status={status} onClose={onClose} />
      <MessageArea>
        <MessageList messages={visibleMessages} streaming={streaming} />
      </MessageArea>
      <Divider />
      <Footer>
        {killSwitchNotice && (
          <Typography variant="body2" color="text.secondary" role="status">
            {t('The Guide is off right now. Please try again later.')}
          </Typography>
        )}
        {!configured ? (
          <Typography variant="body2" color="text.secondary">
            {t('The Guide is not configured.')}
          </Typography>
        ) : deadEnd &&
          tokenState.status === 'refusing' &&
          tokenState.reason === 'notTurnedOn' &&
          accountListId ? (
          <NotTurnedOn accountListId={accountListId} />
        ) : deadEnd ? (
          <MintFailed
            onRetry={
              tokenState.status === 'failed' && tokenState.retryable
                ? retry
                : undefined
            }
          />
        ) : (
          <Composer onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              autoFocus
              maxRows={4}
              size="small"
              value={draft}
              inputRef={inputRef}
              disabled={!accountListId}
              placeholder={t('Ask the Guide')}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              slotProps={{
                htmlInput: { 'aria-label': t('Ask the Guide') },
              }}
            />
            {/* One button that swaps between Send and Stop so keyboard focus survives the swap */}
            <Button
              variant="contained"
              type={streaming ? 'button' : 'submit'}
              onClick={streaming ? stop : undefined}
              disabled={!streaming && !canSend}
              startIcon={streaming ? <StopIcon /> : <SendIcon />}
            >
              {streaming ? t('Stop') : t('Send')}
            </Button>
          </Composer>
        )}
        {configured && !accountListId && (
          <Typography variant="caption" color="text.secondary">
            {t('Open an account list to chat with the Guide.')}
          </Typography>
        )}
        {configured && helpOnly && (
          <Typography variant="caption" color="text.secondary">
            {t(
              'Partner data is not available while viewing a coaching account.',
            )}
          </Typography>
        )}
        <HelpDeskLink />
        <div
          aria-live="polite"
          aria-atomic="true"
          style={visuallyHidden}
          data-testid="ComposerAnnouncer"
        >
          {buttonAnnouncement}
        </div>
      </Footer>
    </>
  );
};
