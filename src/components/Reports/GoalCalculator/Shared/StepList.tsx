import NextLink from 'next/link';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChurchIcon from '@mui/icons-material/Church';
import HomeIcon from '@mui/icons-material/Home';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Link, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from './GoalCalculatorContext';

interface StepIconProps {
  step: GoalCalculatorStepEnum;
  title: string;
  icon: React.ReactNode;
}

export const StepIcon: React.FC<StepIconProps> = ({ step, title, icon }) => {
  const { currentStep, handleStepChange, setDrawerOpen, toggleDrawer } =
    useGoalCalculator();

  const isCurrentStep = currentStep.step === step;
  const handleStepIconClick = (step: GoalCalculatorStepEnum) => {
    if (isCurrentStep) {
      toggleDrawer();
    } else {
      handleStepChange(step);
      setDrawerOpen(true);
    }
  };

  return (
    <IconButton
      aria-label={title}
      sx={(theme) => ({
        color: isCurrentStep
          ? theme.palette.mpdxBlue.main
          : theme.palette.cruGrayDark.main,
      })}
      onClick={() => handleStepIconClick(step)}
    >
      {icon}
    </IconButton>
  );
};

interface StepListProps {
  width: string;
}

export const StepList: React.FC<StepListProps> = ({ width }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';

  return (
    <Stack direction="column" width={width}>
      <StepIcon
        step={GoalCalculatorStepEnum.CalculatorSettings}
        title={t('Calculator Settings')}
        icon={<SettingsIcon />}
      />
      <StepIcon
        step={GoalCalculatorStepEnum.HouseholdExpenses}
        title={t('Household Expenses')}
        icon={<HomeIcon />}
      />
      <StepIcon
        step={GoalCalculatorStepEnum.MinistryExpenses}
        title={t('Ministry Expenses')}
        icon={<ChurchIcon />}
      />
      <StepIcon
        step={GoalCalculatorStepEnum.SummaryReport}
        title={t('Summary Report')}
        icon={<RequestQuoteIcon />}
      />
      <Link
        component={NextLink}
        href={`/accountLists/${accountListId}/reports/goalCalculator`}
        underline="none"
        aria-label={t('Go back')}
      >
        <IconButton
          sx={(theme) => ({
            color: theme.palette.cruGrayDark.main,
          })}
        >
          <ArrowBackIcon />
        </IconButton>
      </Link>
    </Stack>
  );
};
