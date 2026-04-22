import React, { useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
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
import { calculateFamilyTotal } from '../Shared/calculateTotals';
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

export const HouseholdExpensesHeader: React.FC = () => {
  const accountListId = useAccountListId() ?? '';
  const {
    goalCalculationResult: { data, loading },
    goalTotals: { monthlyBudget },
    trackMutation,
  } = useGoalCalculator();

  const { t } = useTranslation();
  const locale = useLocale();

  const directInput = data?.goalCalculation.householdFamily.directInput;
  const [updateDirectInput] = useUpdateHouseholdDirectInputMutation();

  const [showPercentage, setShowPercentage] = useState(true);
  const [editing, setEditing] = useState(false);

  const categoriesTotal = useMemo(
    () =>
      data
        ? calculateFamilyTotal({
            ...data.goalCalculation.householdFamily,
            directInput: null,
          })
        : 0,
    [data],
  );
  const leftToAllocate = monthlyBudget - categoriesTotal;

  const [directInputFieldValue, setDirectInputFieldValue] = useState(0);
  const directInputInvalid = directInputFieldValue < 0;

  const setDirectInput = async (directInput: number | null) => {
    const householdFamilyId = data?.goalCalculation.householdFamily.id;
    if (householdFamilyId) {
      return trackMutation(
        updateDirectInput({
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
        }),
      );
    }
  };

  const handleUsePaycheck = () => {
    setDirectInput(null);
    setEditing(false);
  };

  const handleUseCategoriesTotal = () => {
    setDirectInput(categoriesTotal);
    setEditing(false);
  };

  const handleEditDirectInput = () => {
    setDirectInputFieldValue(monthlyBudget);
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
          <Typography variant="h6">{t('Monthly Budget')}</Typography>
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
              label={t('Total monthly budget')}
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
            <Stack direction="row" alignItems="center" gap={1}>
              <AmountTypography>
                {currencyFormat(monthlyBudget, 'USD', locale)}
              </AmountTypography>
              {typeof directInput === 'number' && (
                <IconButton
                  onClick={handleEditDirectInput}
                  aria-label={t('Edit monthly budget')}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Stack>
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
                {t('Override paycheck amount')}
              </Button>
            ) : (
              <Button onClick={handleUsePaycheck}>
                {t('Use paycheck amount')}
              </Button>
            )}
            {!editing && (
              <Button onClick={handleUseCategoriesTotal}>
                {t('Use categories total')}
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
              ? percentageFormat(leftToAllocate / monthlyBudget, locale)
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
