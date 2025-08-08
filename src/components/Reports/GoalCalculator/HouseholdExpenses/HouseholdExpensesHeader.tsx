import React, { useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { CurrencyAdornment } from '../Shared/Adornments';

enum TotalState {
  Categories = 'Categories',
  DirectInput = 'DirectInput',
  Editing = 'Editing',
}

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
  const { t } = useTranslation();
  const locale = useLocale();

  const [showPercentage, setShowPercentage] = useState(true);
  const [totalState, setTotalState] = useState(TotalState.Categories);
  const [directInput, setDirectInput] = useState(0);

  const budgetTotal =
    totalState === TotalState.Categories ? categoriesTotal : directInput;
  const leftToAllocate = directInput === 0 ? 0 : directInput - categoriesTotal;

  const [directInputFieldValue, setDirectInputFieldValue] = useState(0);

  const handleDirectInputClear = () => {
    setDirectInput(0);
    setTotalState(TotalState.Categories);
  };

  const handleEditDirectInput = () => {
    setDirectInputFieldValue(categoriesTotal);
    setTotalState(TotalState.Editing);
  };

  const handleDirectInputSave = () => {
    setDirectInput(directInputFieldValue);
    setTotalState(TotalState.DirectInput);
  };

  const handleDirectInputCancel = () => {
    setTotalState(TotalState.Categories);
  };

  return (
    <Stack direction="row" gap={4}>
      <StyledCard>
        <CardContent>
          <Typography variant="h6">{t('Budgeted')}</Typography>
          {totalState === TotalState.Editing ? (
            <TextField
              sx={{ marginBlock: 2 }}
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
                step: 0.01,
              }}
              InputProps={{
                startAdornment: <CurrencyAdornment />,
              }}
            />
          ) : (
            <AmountTypography>
              {currencyFormat(
                totalState === TotalState.Categories
                  ? budgetTotal
                  : directInput,
                'USD',
                locale,
              )}
            </AmountTypography>
          )}
        </CardContent>
        <CardActions>
          {totalState === TotalState.Categories ? (
            <Button onClick={handleEditDirectInput}>{t('Direct input')}</Button>
          ) : totalState === TotalState.DirectInput ? (
            <Button onClick={handleDirectInputClear}>
              {t('Manual input')}
            </Button>
          ) : (
            <>
              <Button onClick={handleDirectInputSave}>{t('Save')}</Button>
              <Button onClick={handleDirectInputCancel}>{t('Cancel')}</Button>
            </>
          )}
        </CardActions>
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
