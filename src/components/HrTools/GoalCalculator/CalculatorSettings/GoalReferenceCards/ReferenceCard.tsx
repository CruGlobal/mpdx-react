import React, { useId } from 'react';
import { Skeleton, Typography } from '@mui/material';
import { currencyFormat } from 'src/lib/intlFormat';
import {
  StyledCard,
  StyledHeaderValue,
} from '../../../Shared/SummaryHeaderCard';

export const formatGoalAmount = (amount: number, locale: string): string =>
  currencyFormat(amount, 'USD', locale, { fractionDigits: 0 });

interface ReferenceCardProps {
  title: string;
  caption: string;
  /** The formatted value, or undefined while it loads (a failed load shows missingValue) */
  value: string | undefined;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  title,
  caption,
  value,
}) => {
  const titleId = useId();

  return (
    <StyledCard role="region" aria-labelledby={titleId}>
      <Typography id={titleId} variant="h5" whiteSpace="normal">
        {title}
      </Typography>
      <StyledHeaderValue variant="h2" component="p">
        {value ?? <Skeleton width={160} />}
      </StyledHeaderValue>
      <Typography variant="body2" color="text.secondary" whiteSpace="normal">
        {caption}
      </Typography>
    </StyledCard>
  );
};
