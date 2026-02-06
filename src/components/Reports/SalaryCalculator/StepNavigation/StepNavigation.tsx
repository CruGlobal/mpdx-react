import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, ButtonProps, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from 'src/components/Reports/Shared/CalculationReports/SubmitModal/SubmitModal';
import { useAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useDeleteSalaryCalculation } from '../Shared/useDeleteSalaryCalculation';
import { useSubmitSalaryCalculationMutation } from './SubmitSalaryCalculation.generated';
import { useSubmitDialogContent } from './useSubmitDialogContent';

export const DiscardButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation();
  const { push } = useRouter();
  const accountListId = useAccountListId();
  const { calculation } = useSalaryCalculator();
  const { deleteSalaryCalculation } = useDeleteSalaryCalculation();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const handleDiscard = async () => {
    if (calculation) {
      await deleteSalaryCalculation(calculation.id);
      push(`/accountLists/${accountListId}/reports/salaryCalculator`);
    }
  };

  if (!calculation) {
    return null;
  }

  return (
    <>
      <Button
        {...props}
        variant="text"
        onClick={() => setRemoveDialogOpen(true)}
        color="error"
      >
        <Typography fontWeight="bold">{t('Discard')}</Typography>
      </Button>
      {removeDialogOpen && (
        <SubmitModal
          formTitle={t('Salary Calculation')}
          handleClose={() => setRemoveDialogOpen(false)}
          handleConfirm={handleDiscard}
          isDiscard
        />
      )}
    </>
  );
};

export const BackButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation();
  const { handlePreviousStep, currentIndex } = useSalaryCalculator();

  return (
    <Button
      {...props}
      variant="contained"
      startIcon={<ChevronLeftIcon />}
      onClick={handlePreviousStep}
      disabled={props.disabled || currentIndex === 0}
      color="inherit"
    >
      <Typography fontWeight="bold">{t('Back')}</Typography>
    </Button>
  );
};

export const ContinueButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation();
  const { steps, handleNextStep, currentIndex } = useSalaryCalculator();

  return (
    <Button
      {...props}
      variant="contained"
      endIcon={<ChevronRightIcon />}
      onClick={handleNextStep}
      disabled={props.disabled || currentIndex === steps.length - 1}
    >
      <Typography fontWeight="bold">{t('Continue')}</Typography>
    </Button>
  );
};

export const SubmitButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation();
  const { handleNextStep, calculation } = useSalaryCalculator();
  const [submit] = useSubmitSalaryCalculationMutation();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const { title, content, subContent } = useSubmitDialogContent();

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
    <>
      <Button
        {...props}
        variant="contained"
        endIcon={<ChevronRightIcon />}
        onClick={() => setSubmitDialogOpen(true)}
      >
        <Typography fontWeight="bold">{t('Submit')}</Typography>
      </Button>

      {submitDialogOpen && (
        <SubmitModal
          formTitle={t('Salary Calculation Form')}
          handleClose={() => setSubmitDialogOpen(false)}
          handleConfirm={handleSubmit}
          overrideTitle={title}
          overrideContent={content}
          overrideSubContent={subContent}
        />
      )}
    </>
  );
};

export const StepNavigation: React.FC = () => {
  const theme = useTheme();
  const { currentIndex, steps, editing } = useSalaryCalculator();
  const { allValid } = useAutosaveForm();

  if (!editing) {
    return null;
  }

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      {currentIndex < steps.length - 1 && <DiscardButton />}

      <Stack direction="row" spacing={theme.spacing(1)}>
        <BackButton />
        {currentIndex === 3 ? (
          <SubmitButton disabled={!allValid} />
        ) : (
          <ContinueButton disabled={!allValid} />
        )}
      </Stack>
    </Box>
  );
};
