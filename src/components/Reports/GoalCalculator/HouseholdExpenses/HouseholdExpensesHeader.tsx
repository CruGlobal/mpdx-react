import React, { useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { CurrencyAdornment } from '../Shared/Adornments';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { useUpdateHouseholdDirectInputMutation } from './HouseholdDirectInput.generated';

const StyledCard = styled(Card)({
  flex: 1,

  // Ensure that the actions section take up the same amount of vertical space
  display: 'flex',
  flexDirection: 'column',
  '.MuiCardContent-root': {
    flex: 1,
  },

  '.MuiCardActions-root': {
    justifyContent: 'flex-start',
  },
});

const AmountTypography = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: theme.palette.mpdxBlue.main,
}));

interface HouseholdExpensesHeaderProps {
  /** The total of the household expenses categories */
  categoriesTotal: number;
}

export const HouseholdExpensesHeader: React.FC<
  HouseholdExpensesHeaderProps
> = ({ categoriesTotal }) => {
  const accountListId = useAccountListId() ?? '';
  const {
    goalCalculationResult: { data, loading },
    onMutationStart,
    onMutationComplete,
  } = useGoalCalculator();
  const { t } = useTranslation();
  const locale = useLocale();

  const directInput = data?.goalCalculation.householdFamily.directInput;
  const [updateDirectInput] = useUpdateHouseholdDirectInputMutation();

  const [showPercentage, setShowPercentage] = useState(true);
  const [editing, setEditing] = useState(false);

  const budgetTotal = directInput ?? categoriesTotal;
  const leftToAllocate =
    typeof directInput === 'number' ? directInput - categoriesTotal : 0;

  const [directInputFieldValue, setDirectInputFieldValue] = useState(0);
  const directInputInvalid = directInputFieldValue < 0;

  const setDirectInput = async (directInput: number | null) => {
    const householdFamilyId = data?.goalCalculation.householdFamily.id;
    if (householdFamilyId) {
      onMutationStart();
      return updateDirectInput({
        variables: {
          accountListId,
          id: householdFamilyId,
          directInput,
        },
        optimisticResponse: {
          updateBudgetFamily: {
            budgetFamily: {
              __typename: 'BudgetFamily',
              id: householdFamilyId,
              directInput,
              updatedAt: DateTime.now().toISO(),
            },
          },
        },
        onCompleted: () => onMutationComplete(),
        onError: () => onMutationComplete(),
      });
    }
  };

  const handleDirectInputClear = () => {
    setDirectInput(null);
    setEditing(false);
  };

  const handleEditDirectInput = () => {
    setDirectInputFieldValue(categoriesTotal);
    setEditing(true);
  };

  const handleDirectInputSave = () => {
    setDirectInput(directInputFieldValue);
    setEditing(false);
  };

  const handleDirectInputCancel = () => {
    setEditing(false);
  };

  return (
    <Stack direction="row" gap={4}>
      <StyledCard>
        <CardContent>
          <Typography variant="h6">{t('Budgeted')}</Typography>
          {typeof directInput !== 'number' && loading ? (
            <Skeleton width={120} height={60} />
          ) : editing ? (
            <TextField
              sx={(theme) => ({ marginBlock: theme.spacing(1) })}
              fullWidth
              type="number"
              value={directInputFieldValue}
              onChange={(event) =>
                setDirectInputFieldValue(parseFloat(event.target.value) || 0)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleDirectInputSave();
                }
              }}
              label={t('Direct input')}
              error={directInputInvalid}
              helperText={directInputInvalid && t('Amount must be positive')}
              variant="outlined"
              inputProps={{
                min: 0,
              }}
              InputProps={{
                startAdornment: <CurrencyAdornment />,
              }}
            />
          ) : (
            <AmountTypography>
              {currencyFormat(budgetTotal, 'USD', locale)}
            </AmountTypography>
          )}
        </CardContent>
        {!loading && (
          <CardActions>
            {editing ? (
              <>
                <Button
                  onClick={handleDirectInputSave}
                  disabled={directInputInvalid}
                >
                  {t('Save')}
                </Button>
                <Button onClick={handleDirectInputCancel}>{t('Cancel')}</Button>
              </>
            ) : typeof directInput !== 'number' ? (
              <Button onClick={handleEditDirectInput}>
                {t('Direct input')}
              </Button>
            ) : (
              <Button onClick={handleDirectInputClear}>
                {t('Manual input')}
              </Button>
            )}
          </CardActions>
        )}
      </StyledCard>
      <StyledCard>
        <CardContent>
          <Typography variant="h6">{t('Left to Allocate')}</Typography>
          <AmountTypography>
            {showPercentage
              ? percentageFormat(leftToAllocate / budgetTotal, locale)
              : currencyFormat(leftToAllocate, 'USD', locale)}
          </AmountTypography>
        </CardContent>
        <CardActions>
          <Button onClick={() => setShowPercentage(!showPercentage)}>
            {showPercentage ? t('Switch to amount') : t('Switch to percentage')}
          </Button>
        </CardActions>
      </StyledCard>
    </Stack>
  );
};
