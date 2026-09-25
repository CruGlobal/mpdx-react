import React, { useEffect, useRef, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { HandoffCardData } from '../types';
import { useHandoffContactUrl } from './useHandoffContactUrl';

const COPIED_DURATION = 3000;

interface HandoffCardProps {
  card: HandoffCardData;
}

export const HandoffCard: React.FC<HandoffCardProps> = ({ card }) => {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const summaryRef = useRef<HTMLElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  const contactUrl = useHandoffContactUrl(card);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const selectSummary = () => {
    if (summaryRef.current) {
      window.getSelection()?.selectAllChildren(summaryRef.current);
    }
  };

  const handleCopy = async () => {
    clearTimeout(resetTimer.current);
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(card.summary);
      setCopyStatus('copied');
      resetTimer.current = setTimeout(
        () => setCopyStatus('idle'),
        COPIED_DURATION,
      );
    } catch {
      selectSummary();
      setCopyStatus('failed');
    }
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="subtitle2" component="h3" gutterBottom>
          {t('Summary for the help desk')}
        </Typography>
        <Typography ref={summaryRef} variant="body2" whiteSpace="pre-wrap">
          {card.summary}
        </Typography>
      </CardContent>
      <CardActions sx={{ flexWrap: 'wrap' }}>
        {contactUrl && (
          <Button
            component="a"
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<SupportAgentIcon />}
          >
            {t('Contact the help desk')}
          </Button>
        )}
        <Button
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
        >
          {copyStatus === 'copied' ? t('Copied') : t('Copy summary')}
        </Button>
      </CardActions>
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        px={2}
        pb={1.5}
      >
        {t('Paste the summary into the description box on the help desk form.')}
      </Typography>
      <div role="status" style={visuallyHidden}>
        {copyStatus === 'copied' && t('Copied')}
        {copyStatus === 'failed' &&
          t('Could not copy. The summary is selected so you can copy it.')}
      </div>
    </Card>
  );
};
