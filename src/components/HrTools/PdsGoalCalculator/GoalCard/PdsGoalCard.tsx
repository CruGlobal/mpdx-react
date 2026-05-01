import NextLink from 'next/link';
import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  Skeleton,
  Typography,
  styled,
} from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';
import { useHcmUserQuery } from '../Shared/HCM.generated';
import {
  buildPdsGoalConstants,
  calculatePdsGoalTotal,
} from '../calculations/calculatePdsGoalTotal';

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

export interface PdsGoalCardProps {
  goal: PdsGoalCalculationFieldsFragment;
  onDelete: (id: string) => Promise<void>;
}

export const PdsGoalCard: React.FC<PdsGoalCardProps> = ({ goal, onDelete }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';
  const [deleting, setDeleting] = useState(false);

  const {
    goalMiscConstants,
    goalGeographicConstantMap,
    loading: constantsLoading,
  } = useGoalCalculatorConstants();
  const { data: hcmData, loading: hcmLoading } = useHcmUserQuery();
  const hcmUser = hcmData?.hcm[0];

  const goalTotal = useMemo(() => {
    const constants = buildPdsGoalConstants(
      goalMiscConstants,
      goalGeographicConstantMap,
      goal.geographicLocation,
      hcmUser?.fourOThreeB,
    );
    return constants ? calculatePdsGoalTotal(goal, constants) : 0;
  }, [goal, goalMiscConstants, goalGeographicConstantMap, hcmUser]);

  const handleDeleteClick = () => {
    setDeleting(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete(goal.id);
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
            <StyledInfoRow pb={1}>
              <Typography variant="body1" fontWeight="bold" pl={2}>
                {t('Goal Amount')}
              </Typography>
              <Typography data-testid="goal-amount-value" variant="body1">
                {constantsLoading || hcmLoading ? (
                  <Skeleton width={80} />
                ) : (
                  currencyFormat(goalTotal, 'USD', locale)
                )}
              </Typography>
            </StyledInfoRow>

            <Divider />

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
            <Typography variant="body2" fontWeight="bold" color="error">
              {t('Delete')}
            </Typography>
          </Button>
          <Button
            LinkComponent={NextLink}
            href={`/accountLists/${accountListId}/hrTools/pdsGoalCalculator/${goal.id}`}
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
