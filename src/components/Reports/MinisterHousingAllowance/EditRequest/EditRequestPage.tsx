import React, { useState } from 'react';
import { Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { useNewStepList } from '../../../../hooks/useNewStepList';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { Receipt } from '../NewRequest/Steps/StepFour/Receipt';
import { Calculation } from '../NewRequest/Steps/StepThree/Calculation';
import { RentOwn } from '../NewRequest/Steps/StepTwo/RentOwn';
import { StepsList } from '../NewRequest/StepsList/StepsList';
import { PanelLayout } from '../PanelLayout/PanelLayout';
import { editOwnMock, mocks } from '../Shared/mockData';
import {
  EditRequestStepsEnum,
  PageEnum,
  PanelTypeEnum,
  RentOwnEnum,
} from '../Shared/sharedTypes';

interface EditRequestPageProps {
  type: PageEnum;
  onOpen?: () => void;
}

export interface FormValues {
  rentOrOwn: RentOwnEnum | undefined;
}

const validationSchema = yup.object({
  rentOrOwn: yup
    .string()
    .required(i18n.t('Please select one of the options above to continue.')),
});

export const EditRequestPage: React.FC<EditRequestPageProps> = ({
  onOpen,
  type,
}) => {
  const { t } = useTranslation();
  const steps = useNewStepList(type);

  const [currentStep, setCurrentStep] = useState(
    EditRequestStepsEnum.RentOrOwn,
  );
  const [percentComplete, setPercentComplete] = useState(33);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === EditRequestStepsEnum.RentOrOwn
          ? EditRequestStepsEnum.Edit
          : prevStep === EditRequestStepsEnum.Edit
            ? EditRequestStepsEnum.Receipt
            : prevStep;

      handlePercentComplete(next);
      handleNextIndexChange(currentIndex + 1);
      return next;
    });
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === EditRequestStepsEnum.Edit
          ? EditRequestStepsEnum.RentOrOwn
          : prevStep === EditRequestStepsEnum.Receipt
            ? EditRequestStepsEnum.Edit
            : prevStep;

      handlePercentComplete(next);
      handlePreviousIndexChange(currentIndex - 1);
      return next;
    });
  };

  const handlePercentComplete = (step: EditRequestStepsEnum) => {
    switch (step) {
      case EditRequestStepsEnum.RentOrOwn:
        setPercentComplete(33);
        break;
      case EditRequestStepsEnum.Edit:
        setPercentComplete(66);
        break;
      case EditRequestStepsEnum.Receipt:
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

    if (newIndex === steps.length - 1) {
      steps[newIndex].complete = true;
    }
  };

  const handlePreviousIndexChange = (newIndex: number) => {
    steps[currentIndex].current = false;
    steps[newIndex].complete = false;
    setCurrentIndex(newIndex);
    steps[newIndex].current = true;
  };

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Edit}
      sidebarTitle={t('Edit Request')}
      sidebarAriaLabel={t('MHA Edit Request')}
      percentComplete={percentComplete}
      sidebarContent={<StepsList steps={steps} />}
      handleBack={handlePreviousStep}
      currentStep={currentStep}
      mainContent={
        <Formik<FormValues>
          initialValues={{ rentOrOwn: editOwnMock.rentOrOwn }}
          validationSchema={validationSchema}
          onSubmit={() => handleNextStep()}
        >
          <Container sx={{ ml: 5 }}>
            <Stack direction="column" width={mainContentWidth}>
              {currentStep === EditRequestStepsEnum.RentOrOwn ? (
                <RentOwn type={type} />
              ) : currentStep === EditRequestStepsEnum.Edit ? (
                <Calculation
                  type={type}
                  boardApprovalDate={
                    mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
                  }
                  availableDate={
                    mocks[4].mhaDetails.staffMHA?.availableDate ?? ''
                  }
                  handleNext={handleNextStep}
                  handleBack={handlePreviousStep}
                  onOpen={onOpen}
                />
              ) : currentStep === EditRequestStepsEnum.Receipt ? (
                <Receipt type={type} />
              ) : null}
            </Stack>
          </Container>
        </Formik>
      }
    />
  );
};
