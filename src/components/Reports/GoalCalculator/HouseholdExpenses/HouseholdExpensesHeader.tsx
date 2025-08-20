import { useRouter } from 'next/router';
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
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { getQueryParam } from 'src/utils/queryParam';
import { CurrencyAdornment } from '../Shared/Adornments';
import {
  useHouseholdDirectInputQuery,
  useUpdateHouseholdDirectInputMutation,
} from './HouseholdDirectInput.generated';

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
  const { query } = useRouter();
  const goalCalculationId = getQueryParam(query, 'goalCalculationId') ?? '';
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading } = useHouseholdDirectInputQuery({
    variables: {
      accountListId,
      id: goalCalculationId,
    },
  });
  const directInput = data?.goalCalculation.householdFamily.directInput;
  const householdFamilyId = data?.goalCalculation.householdFamily.id;
  const [updateDirectInput] = useUpdateHouseholdDirectInputMutation();

  const [showPercentage, setShowPercentage] = useState(true);
  const [editing, setEditing] = useState(false);

  const budgetTotal = directInput ?? categoriesTotal;
  const leftToAllocate =
    typeof directInput === 'number' ? directInput - categoriesTotal : 0;

  const [directInputFieldValue, setDirectInputFieldValue] = useState(0);

  const setDirectInput = async (directInput: number | null) => {
    if (householdFamilyId) {
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
            },
          },
        },
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
                <Button onClick={handleDirectInputSave}>{t('Save')}</Button>
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
