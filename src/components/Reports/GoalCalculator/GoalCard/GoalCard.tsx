import NextLink from 'next/link';
import React, { useMemo, useState } from 'react';
import { Star, StarBorderOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import {
  ListGoalCalculationFragment,
  useDeleteGoalCalculationMutation,
  useUpdateGoalCalculationMutation,
} from '../GoalsList/GoalCalculations.generated';
import { calculateGoalTotals } from '../Shared/calculateTotals';

const StyledCard = styled(Card)({
  minWidth: 350,
  borderRadius: theme.shape.borderRadius,
});

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
});

const StyledTitleBox = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
});

const StyledStarButton = styled(IconButton)({
  position: 'absolute',
  right: 0,
  padding: theme.spacing(2),
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

export interface GoalCardProps {
  goal: ListGoalCalculationFragment;

  /** Remove this prop and always render the star once we do something with the primary flag*/
  renderStar?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  renderStar = false,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId() ?? '';
  const [updateGoalCalculation] = useUpdateGoalCalculationMutation();
  const [deleteGoalCalculation] = useDeleteGoalCalculationMutation();
  const [deleting, setDeleting] = useState(false);

  const overallTotal = useMemo(
    () => calculateGoalTotals(goal).overallTotal,
    [goal],
  );

  const handleStarClick = async () => {
    await updateGoalCalculation({
      variables: {
        accountListId,
        attributes: {
          id: goal.id,
          primary: !goal.primary,
        },
      },
      optimisticResponse: {
        updateGoalCalculation: {
          goalCalculation: {
            ...goal,
            primary: !goal.primary,
          },
        },
      },
      refetchQueries: ['GoalCalculations'],
    });
  };

  const handleDeleteClick = () => {
    setDeleting(true);
  };

  const handleConfirmDelete = async () => {
    await deleteGoalCalculation({
      variables: {
        accountListId,
        id: goal.id,
      },
      update: (cache) => {
        cache.evict({ id: `GoalCalculation:${goal.id}` });
        cache.gc();
      },
    });
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
          <StyledTitleBox>
            <Typography data-testid="goal-name" variant="h6">
              {goal.name ?? t('Unnamed Goal')}
            </Typography>
          </StyledTitleBox>
          {renderStar && (
            <StyledStarButton
              aria-label="star-button"
              onClick={handleStarClick}
            >
              {goal.primary ? (
                <Star color="primary" sx={{ verticalAlign: 'middle' }} />
              ) : (
                <StarBorderOutlined
                  color="primary"
                  sx={{ verticalAlign: 'middle' }}
                />
              )}
            </StyledStarButton>
          )}
        </StyledHeaderBox>

        <Divider />

        <StyledContentBox>
          <StyledContentInnerBox>
            <StyledInfoRow pb={theme.spacing(1)}>
              <Typography variant="body1" fontWeight="bold" pl={2}>
                {t('Goal Amount')}
              </Typography>
              <Typography data-testid="goal-amount-value" variant="body1">
                {currencyFormat(overallTotal, 'USD', locale)}
              </Typography>
            </StyledInfoRow>

            <Divider />

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
            href={`/accountLists/${accountListId}/reports/goalCalculator/${goal.id}`}
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
