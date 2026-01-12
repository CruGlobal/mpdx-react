import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSubmitSalaryCalculationMutation } from './SubmitSalaryCalculation.generated';

export const BackButton: React.FC = () => {
  const { t } = useTranslation();
  const { handlePreviousStep, currentIndex } = useSalaryCalculator();

  return (
    <Button
      variant="contained"
      startIcon={<ChevronLeftIcon />}
      onClick={handlePreviousStep}
      disabled={currentIndex === 0}
      color="inherit"
    >
      <Typography fontWeight="bold">{t('Back')}</Typography>
    </Button>
  );
};

export const ContinueButton: React.FC = () => {
  const { t } = useTranslation();
  const { steps, handleNextStep, currentIndex } = useSalaryCalculator();

  return (
    <Button
      variant="contained"
      endIcon={<ChevronRightIcon />}
      onClick={handleNextStep}
      disabled={currentIndex === steps.length - 1}
    >
      <Typography fontWeight="bold">{t('Continue')}</Typography>
    </Button>
  );
};

export const SubmitButton: React.FC = () => {
  const { t } = useTranslation();
  const { handleNextStep, calculation } = useSalaryCalculator();
  const [submit] = useSubmitSalaryCalculationMutation();

  const handleSubmit = async () => {
    if (calculation) {
      await submit({
        variables: {
          input: {
            id: calculation.id,
          },
        },
      });
      handleNextStep();
    }
  };

  if (!calculation) {
    return null;
  }

  return (
    <Button
      variant="contained"
      endIcon={<ChevronRightIcon />}
      onClick={handleSubmit}
    >
      <Typography fontWeight="bold">{t('Submit')}</Typography>
    </Button>
  );
};

export const StepNavigation: React.FC = () => {
  const theme = useTheme();
  const { currentIndex } = useSalaryCalculator();

  return (
    <Box display="flex" justifyContent="flex-end">
      <Stack direction="row" spacing={theme.spacing(1)}>
        <BackButton />
        {currentIndex === 3 ? <SubmitButton /> : <ContinueButton />}
      </Stack>
    </Box>
  );
};
