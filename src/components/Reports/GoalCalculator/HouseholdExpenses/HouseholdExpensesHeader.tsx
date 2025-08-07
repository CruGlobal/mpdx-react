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
  const [totalState, setTotalState] = useState<
    'categories' | 'directInput' | 'editing'
  >('categories');
  const [directInput, setDirectInput] = useState(0);

  const budgetTotal =
    totalState === 'categories' ? categoriesTotal : directInput;
  const leftToAllocate = directInput === 0 ? 0 : directInput - categoriesTotal;

  const [directInputFieldValue, setDirectInputFieldValue] = useState(0);

  // Clear directInput value and go back to showing the categories total
  const handleDirectInputClear = () => {
    setDirectInput(0);
    setTotalState('categories');
  };

  // Start editing the direct input
  const handleEditDirectInput = () => {
    setDirectInputFieldValue(categoriesTotal);
    setTotalState('editing');
  };

  // Save the direct input field as the new direct input
  const handleDirectInputSave = () => {
    setDirectInput(directInputFieldValue);
    setTotalState('directInput');
  };

  // Cancel setting a new direct input
  const handleDirectInputCancel = () => {
    setTotalState('categories');
  };

  return (
    <Stack direction="row" gap={4}>
      <StyledCard>
        <CardContent>
          <Typography variant="h6">{t('Budgeted')}</Typography>
          {totalState === 'editing' ? (
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
                totalState === 'categories' ? budgetTotal : directInput,
                'USD',
                locale,
              )}
            </AmountTypography>
          )}
        </CardContent>
        <CardActions>
          {totalState === 'categories' ? (
            <Button onClick={handleEditDirectInput}>{t('Direct input')}</Button>
          ) : totalState === 'directInput' ? (
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
            {/* If there is a direct input */}
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
