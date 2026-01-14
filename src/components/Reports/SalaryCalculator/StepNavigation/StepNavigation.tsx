import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from 'src/components/Reports/Shared/CalculationReports/SubmitModal/SubmitModal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { SalaryCalculatorSectionEnum } from '../SalaryCalculatorContext/Helper/sharedTypes';
import { useDeleteSalaryCalculationMutation } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSubmitSalaryCalculationMutation } from './SubmitSalaryCalculation.generated';

export const CancelButton: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();
  const { calculation } = useSalaryCalculator();
  const [deleteSalaryCalculation] = useDeleteSalaryCalculationMutation();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const handleCancel = async () => {
    if (calculation) {
      await deleteSalaryCalculation({
        variables: {
          input: {
            id: calculation.id,
          },
        },
      });
      setRemoveDialogOpen(false);
      router.push(`/accountLists/${accountListId}/reports/salaryCalculator`);
    }
  };

  if (!calculation) {
    return null;
  }

  return (
    <>
      <Button
        variant="text"
        onClick={() => setRemoveDialogOpen(true)}
        color="error"
        disabled={!calculation?.id}
      >
        <Typography fontWeight="bold">{t('Cancel')}</Typography>
      </Button>
      {removeDialogOpen && (
        <SubmitModal
          formTitle={t('Salary Calculator')}
          handleClose={() => setRemoveDialogOpen(false)}
          handleConfirm={handleCancel}
          isCancel={true}
        />
      )}
    </>
  );
};

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
  const { currentStep } = useSalaryCalculator();

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      {currentStep !== SalaryCalculatorSectionEnum.Receipt && <CancelButton />}
      <Stack direction="row" spacing={theme.spacing(1)}>
        <BackButton />
        {currentStep === SalaryCalculatorSectionEnum.Summary ? (
          <SubmitButton />
        ) : (
          <ContinueButton />
        )}
      </Stack>
    </Box>
  );
};
