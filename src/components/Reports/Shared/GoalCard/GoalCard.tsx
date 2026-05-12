import NextLink from 'next/link';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  Skeleton,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';

const StyledCard = styled(Card)(({ theme }) => ({
  width: 350,
  borderRadius: theme.shape.borderRadius,
}));

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
  paddingInline: theme.spacing(2),
}));

const StyledContentBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const StyledContentInnerBox = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
}));

const StyledInfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: theme.spacing(9),
}));

const StyledActionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
}));

export interface GoalCardProps {
  name: string | null | undefined;
  goalAmount: number;
  currency: string;
  loading?: boolean;
  updatedAt: string;
  viewHref: string;
  onDelete: () => Promise<void>;
  badge?: React.ReactNode;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  name,
  goalAmount,
  currency,
  loading = false,
  updatedAt,
  viewHref,
  onDelete,
  badge,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [deleting, setDeleting] = useState(false);

  const displayName = name ?? t('Unnamed Goal');

  const handleConfirmDelete = async () => onDelete();

  return (
    <>
      <Confirmation
        title={t('Delete Goal')}
        isOpen={deleting}
        mutation={handleConfirmDelete}
        handleClose={() => setDeleting(false)}
        confirmLabel={t('Delete Goal')}
        cancelLabel={t('Cancel')}
        message={
          <Trans
            t={t}
            defaults="Are you sure you want to delete <strong>{{goalName}}</strong>? Deleting this goal will remove it permanently."
            values={{ goalName: displayName }}
          />
        }
        confirmButtonProps={{
          variant: 'contained',
          color: 'error',
          children: t('Delete Goal'),
        }}
      />

      <StyledCard>
        <StyledHeaderBox sx={badge ? { gap: 1 } : undefined}>
          <Tooltip title={displayName}>
            <Typography
              data-testid="goal-name"
              variant="h6"
              noWrap
              sx={{
                textAlign: 'center',
                ...(badge ? { minWidth: 0 } : { width: '100%' }),
              }}
            >
              {displayName}
            </Typography>
          </Tooltip>
          {badge}
        </StyledHeaderBox>

        <Divider />

        <StyledContentBox>
          <StyledContentInnerBox>
            <StyledInfoRow pb={1}>
              <Typography variant="body1" fontWeight="bold" pl={2}>
                {t('Goal Amount')}
              </Typography>
              <Typography data-testid="goal-amount-value" variant="body1">
                {loading ? (
                  <Skeleton width={80} />
                ) : (
                  currencyFormat(goalAmount, currency, locale)
                )}
              </Typography>
            </StyledInfoRow>

            <Divider />

            <StyledInfoRow pt={1}>
              <Typography variant="body1" fontWeight="bold" pl={2}>
                {t('Last Updated')}
              </Typography>
              <Typography data-testid="date-value" variant="body1">
                {dateFormat(DateTime.fromISO(updatedAt), locale, {
                  fullMonth: true,
                })}
              </Typography>
            </StyledInfoRow>
          </StyledContentInnerBox>
        </StyledContentBox>

        <Divider sx={{ mt: 2, mb: 1 }} />

        <StyledActionBox>
          <Button onClick={() => setDeleting(true)}>
            <Typography variant="body2" fontWeight="bold" color="error">
              {t('Delete')}
            </Typography>
          </Button>
          <Button
            LinkComponent={NextLink}
            href={viewHref}
            variant="contained"
            color="primary"
          >
            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary.contrastText"
            >
              {t('View')}
            </Typography>
          </Button>
        </StyledActionBox>
      </StyledCard>
    </>
  );
};
