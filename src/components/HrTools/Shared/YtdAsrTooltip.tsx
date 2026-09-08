import React from 'react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InfoTooltipIcon } from './InfoTooltipIcon';
import { useFormatters } from './useFormatters';

interface YtdAsrTooltipProps {
  unpaidAmount: number;
}

export const YtdAsrTooltip: React.FC<YtdAsrTooltipProps> = ({
  unpaidAmount,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  if (unpaidAmount <= 0) {
    return null;
  }

  return (
    <Tooltip
      title={t('{{ amount }} of this is awaiting approval or payment', {
        amount: formatCurrency(unpaidAmount),
      })}
    >
      <InfoTooltipIcon data-testid="YtdAsrTooltip" />
    </Tooltip>
  );
};
