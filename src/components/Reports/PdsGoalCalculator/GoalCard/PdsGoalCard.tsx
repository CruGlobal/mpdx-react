// src/components/Reports/PdsGoalCalculator/GoalCard/PdsGoalCard.tsx
import NextLink from 'next/link';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  Typography,
  styled,
} from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';

const StyledCard = styled(Card)({
  minWidth: 350,
  borderRadius: theme.shape.borderRadius,
});

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
});

const StyledContentBox = styled(Box)({
  marginTop: theme.spacing(2),
});

const StyledContentInnerBox = styled(Box)({
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
});

const StyledInfoRow = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: 72,
});

const StyledActionBox = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
});

// TODO: Replace with generated GraphQL type when backend is ready
export interface PdsGoal {
  id: string;
  name: string | null;
  updatedAt: string;
}

export interface PdsGoalCardProps {
  goal: PdsGoal;
}

export const PdsGoalCard: React.FC<PdsGoalCardProps> = ({ goal }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleting(true);
  };

  const handleConfirmDelete = async () => {
    // TODO: Call deletePdsGoal mutation when backend is ready
    setDeleting(false);
  };

  const handleCancelDelete = () => {
    setDeleting(false);
  };

  return (
    <>
      <Confirmation
        title={t('Delete Goal')}
        isOpen={deleting}
        mutation={handleConfirmDelete}
        handleClose={handleCancelDelete}
        confirmLabel={t('Delete Goal')}
        cancelLabel={t('Cancel')}
        message={
          <Trans t={t}>
            Are you sure you want to delete{' '}
            <strong>{goal.name ?? t('Unnamed Goal')}</strong>? Deleting this
            goal will remove it permanently.
          </Trans>
        }
        confirmButtonProps={{
          variant: 'contained',
          color: 'error',
          children: t('Delete Goal'),
        }}
      />

      <StyledCard>
        <StyledHeaderBox>
          <Typography data-testid="goal-name" variant="h6">
            {goal.name ?? t('Unnamed Goal')}
          </Typography>
        </StyledHeaderBox>

        <Divider />

        <StyledContentBox>
          <StyledContentInnerBox>
            <StyledInfoRow pt={theme.spacing(1)}>
              <Typography variant="body1" fontWeight="bold" pl={2}>
                {t('Last Updated')}
              </Typography>
              <Typography data-testid="date-value" variant="body1">
                {dateFormat(DateTime.fromISO(goal.updatedAt), locale, {
                  fullMonth: true,
                })}
              </Typography>
            </StyledInfoRow>
          </StyledContentInnerBox>
        </StyledContentBox>

        <Divider sx={{ mt: 2, mb: 1 }} />

        <StyledActionBox>
          <Button onClick={handleDeleteClick}>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={theme.palette.error.main}
            >
              {t('Delete')}
            </Typography>
          </Button>
          <Button
            LinkComponent={NextLink}
            href={`/accountLists/${accountListId}/reports/pds-goal-calculator/${goal.id}`}
            variant="contained"
            color="primary"
          >
            <Typography
              variant="body2"
              fontWeight="bold"
              color={theme.palette.primary.contrastText}
            >
              {t('View')}
            </Typography>
          </Button>
        </StyledActionBox>
      </StyledCard>
    </>
  );
};
