import { useMemo, useState } from 'react';
import { Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { PanelLayout } from '../PanelLayout/PanelLayout';
import { mocks } from '../Shared/mockData';
import { NewRequestStepsEnum, PanelTypeEnum } from '../Shared/sharedTypes';
import { getStepList } from './Helper/getStepList';
import { AboutForm } from './Steps/StepOne/AboutForm';
import { Calculation } from './Steps/StepThree/Calculation';
import { RentOwn } from './Steps/StepTwo/RentOwn';
import { StepsList } from './StepsList/StepsList';

export const NewRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const steps = useMemo(() => getStepList(t), [t]);

  const [currentStep, setCurrentStep] = useState(NewRequestStepsEnum.AboutForm);
  const [percentComplete, setPercentComplete] = useState(25);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === NewRequestStepsEnum.AboutForm
          ? NewRequestStepsEnum.RentOrOwn
          : prevStep === NewRequestStepsEnum.RentOrOwn
            ? NewRequestStepsEnum.Calculate
            : prevStep === NewRequestStepsEnum.Calculate
              ? NewRequestStepsEnum.Receipt
              : prevStep;

      handlePercentComplete(next);
      handleNextIndexChange(currentIndex + 1);
      return next;
    });
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === NewRequestStepsEnum.RentOrOwn
          ? NewRequestStepsEnum.AboutForm
          : prevStep === NewRequestStepsEnum.Calculate
            ? NewRequestStepsEnum.RentOrOwn
            : prevStep === NewRequestStepsEnum.Receipt
              ? NewRequestStepsEnum.Calculate
              : prevStep;

      handlePercentComplete(next);
      handlePreviousIndexChange(currentIndex - 1);
      return next;
    });
  };

  const handlePercentComplete = (step: NewRequestStepsEnum) => {
    switch (step) {
      case NewRequestStepsEnum.AboutForm:
        setPercentComplete(25);
        break;
      case NewRequestStepsEnum.RentOrOwn:
        setPercentComplete(50);
        break;
      case NewRequestStepsEnum.Calculate:
        setPercentComplete(75);
        break;
      case NewRequestStepsEnum.Receipt:
        setPercentComplete(100);
        break;
      default:
        setPercentComplete(0);
    }
  };

  const handleNextIndexChange = (newIndex: number) => {
    steps[currentIndex].current = false;
    steps[currentIndex].complete = true;
    setCurrentIndex(newIndex);
    steps[newIndex].current = true;
  };

  const handlePreviousIndexChange = (newIndex: number) => {
    steps[currentIndex].current = false;
    steps[newIndex].complete = false;
    setCurrentIndex(newIndex);
    steps[newIndex].current = true;
  };

  return (
    <PanelLayout
      panelType={PanelTypeEnum.New}
      sidebarTitle={t('New Request')}
      sidebarAriaLabel={t('MHA New Request')}
      percentComplete={percentComplete}
      sidebarContent={<StepsList steps={steps} />}
      handleBack={handlePreviousStep}
      currentStep={currentStep}
      mainContent={
        <Container>
          <Stack direction="column" width={mainContentWidth}>
            {currentStep === NewRequestStepsEnum.AboutForm ? (
              <AboutForm
                boardApprovalDate={
                  mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
                }
                availableDate={
                  mocks[4].mhaDetails.staffMHA?.availableDate ?? ''
                }
                handleNext={handleNextStep}
              />
            ) : currentStep === NewRequestStepsEnum.RentOrOwn ? (
              <RentOwn handleNext={handleNextStep} />
            ) : currentStep === NewRequestStepsEnum.Calculate ? (
              <Calculation handleNext={handleNextStep} />
            ) : null}
          </Stack>
        </Container>
      }
    />
  );
};
