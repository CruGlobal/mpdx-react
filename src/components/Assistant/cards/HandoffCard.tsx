import React, { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HandoffCardData } from '../types';
import { useHandoffContactUrl } from './useHandoffContactUrl';

interface HandoffCardProps {
  card: HandoffCardData;
}

export const HandoffCard: React.FC<HandoffCardProps> = ({ card }) => {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );

  const contactUrl = useHandoffContactUrl(card);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.summary);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="subtitle2" component="h3" gutterBottom>
          {t('Summary for the help desk')}
        </Typography>
        <Typography variant="body2" whiteSpace="pre-wrap">
          {card.summary}
        </Typography>
      </CardContent>
      <CardActions>
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
        <Tooltip
          title={copyStatus === 'copied' ? t('Copied') : t('Copy summary')}
        >
          <IconButton
            size="small"
            aria-label={t('Copy summary')}
            onClick={handleCopy}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {copyStatus !== 'idle' && (
          <Typography variant="caption" color="text.secondary" role="status">
            {copyStatus === 'copied' ? t('Copied') : t('Copy failed')}
          </Typography>
        )}
      </CardActions>
    </Card>
  );
};
