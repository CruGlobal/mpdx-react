import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormatters } from './useFormatters';

const StyledInfoIcon = styled(InfoIcon)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  verticalAlign: 'middle',
  cursor: 'pointer',
  color: theme.palette.mpdxGrayDark.main,
  fontSize: '1rem',
}));

interface YtdAsrTooltipProps {
  ytdAsrAmount: number;
}

export const YtdAsrTooltip: React.FC<YtdAsrTooltipProps> = ({
  ytdAsrAmount,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  if (ytdAsrAmount <= 0) {
    return null;
  }

  return (
    <Tooltip
      title={t(
        'Includes {{ amount }} of pending and approved requests this year',
        { amount: formatCurrency(ytdAsrAmount) },
      )}
    >
      <StyledInfoIcon data-testid="YtdAsrTooltip" />
    </Tooltip>
  );
};
