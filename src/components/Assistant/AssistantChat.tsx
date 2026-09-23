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
import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { buildHelpjuiceContactUrl } from 'src/components/Helpjuice/contactUrl';
import { useLocation } from 'src/components/Helpjuice/useLocation';
import { useAssistantContext } from './AssistantProvider';
import { MessageList } from './MessageList';
import { useAssistantStream } from './useAssistantStream';

const MessageArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

const Footer = styled(Box)(({ theme }) => ({
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
  const href = useLocation();

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

// Mounts only while the drawer is open, so session and route hooks stay out of the provider
export const AssistantChat: React.FC = () => {
  const { t } = useTranslation();
  const { messages, onNavigate } = useAssistantContext();
  const { sendMessage, stop, streaming, configured, accountListId } =
    useAssistantStream();
  const [draft, setDraft] = useState('');
  const canSend = Boolean(draft.trim()) && Boolean(accountListId);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasStreaming = useRef(streaming);

  useEffect(() => {
    if (wasStreaming.current && !streaming) {
      inputRef.current?.focus();
    }
    wasStreaming.current = streaming;
  }, [streaming]);

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
      <MessageArea>
        <MessageList
          messages={messages}
          streaming={streaming}
          onNavigate={onNavigate}
        />
      </MessageArea>
      <Divider />
      <Footer>
        {configured ? (
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
              placeholder={t('Ask the assistant')}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              slotProps={{
                htmlInput: { 'aria-label': t('Ask the assistant') },
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
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('The assistant is not configured.')}
          </Typography>
        )}
        {configured && !accountListId && (
          <Typography variant="caption" color="text.secondary">
            {t('Open an account list to chat with the assistant.')}
          </Typography>
        )}
        <HelpDeskLink />
      </Footer>
    </>
  );
};
