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

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 350,
  borderRadius: theme.shape.borderRadius,
}));

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
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
            <StyledInfoRow pt={1}>
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
              color="error"
            >
              {t('Delete')}
            </Typography>
          </Button>
          <Button
            LinkComponent={NextLink}
            href={`/accountLists/${accountListId}/reports/pdsGoalCalculator/${goal.id}`}
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
