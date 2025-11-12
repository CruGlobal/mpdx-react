import { Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { PanelLayout } from '../PanelLayout/PanelLayout';
import { useMinisterHousingAllowance } from '../Shared/MinisterHousingAllowanceContext';
import { mocks } from '../Shared/mockData';
import {
  NewRequestStepsEnum,
  PanelTypeEnum,
  RentOwnEnum,
} from '../Shared/sharedTypes';
import { Receipt } from './Steps/StepFour/Receipt';
import { AboutForm } from './Steps/StepOne/AboutForm';
import { Calculation } from './Steps/StepThree/Calculation';
import { RentOwn } from './Steps/StepTwo/RentOwn';
import { StepsList } from './StepsList/StepsList';

export interface FormValues {
  rentOrOwn: RentOwnEnum | undefined;
}

const validationSchema = yup.object({
  rentOrOwn: yup
    .string()
    .required(i18n.t('Please select one of the options above to continue.')),
});

export const NewRequestPage: React.FC = () => {
  const { t } = useTranslation();

  const { steps, handleNextStep, currentStep } = useMinisterHousingAllowance();

  return (
    <PanelLayout
      panelType={PanelTypeEnum.New}
      sidebarTitle={t('New Request')}
      sidebarAriaLabel={t('MHA New Request')}
      sidebarContent={<StepsList steps={steps} />}
      mainContent={
        <Formik<FormValues>
          initialValues={{ rentOrOwn: undefined }}
          validationSchema={validationSchema}
          onSubmit={() => handleNextStep()}
        >
          <Container sx={{ ml: 5 }}>
            <Stack direction="column" width={mainContentWidth}>
              {currentStep === NewRequestStepsEnum.AboutForm ? (
                <AboutForm
                  boardApprovalDate={
                    mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
                  }
                  availableDate={
                    mocks[4].mhaDetails.staffMHA?.availableDate ?? ''
                  }
                />
              ) : currentStep === NewRequestStepsEnum.RentOrOwn ? (
                <RentOwn />
              ) : currentStep === NewRequestStepsEnum.Calculate ? (
                <Calculation
                  boardApprovalDate={
                    mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
                  }
                  availableDate={
                    mocks[4].mhaDetails.staffMHA?.availableDate ?? ''
                  }
                />
              ) : currentStep === NewRequestStepsEnum.Receipt ? (
                <Receipt
                  availableDate={
                    mocks[4].mhaDetails.staffMHA?.availableDate ?? ''
                  }
                  deadlineDate={
                    mocks[4].mhaDetails.staffMHA?.deadlineDate ?? ''
                  }
                />
              ) : null}
            </Stack>
          </Container>
        </Formik>
      }
    />
  );
};
