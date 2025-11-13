import React from 'react';
import { Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { PanelLayout } from '../PanelLayout/PanelLayout';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';
import { editOwnMock, mocks } from '../Shared/mockData';
import {
  EditRequestStepsEnum,
  PanelTypeEnum,
  RentOwnEnum,
} from '../Shared/sharedTypes';
import { Receipt } from '../Steps/StepFour/Receipt';
import { Calculation } from '../Steps/StepThree/Calculation';
import { RentOwn } from '../Steps/StepTwo/RentOwn';
import { StepsList } from '../Steps/StepsList/StepsList';

export interface FormValues {
  rentOrOwn: RentOwnEnum | undefined;
}

const validationSchema = yup.object({
  rentOrOwn: yup
    .string()
    .required(i18n.t('Please select one of the options above to continue.')),
});

export const EditRequestPage: React.FC = () => {
  const { t } = useTranslation();

  const { steps, handleEditNextStep, currentEditStep } =
    useMinisterHousingAllowance();

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Edit}
      sidebarTitle={t('Edit Request')}
      sidebarAriaLabel={t('MHA Edit Request')}
      sidebarContent={<StepsList steps={steps} />}
      mainContent={
        <Formik<FormValues>
          initialValues={{ rentOrOwn: editOwnMock.rentOrOwn }}
          validationSchema={validationSchema}
          onSubmit={() => handleEditNextStep()}
        >
          <Container sx={{ ml: 5 }}>
            <Stack direction="column" width={mainContentWidth}>
              {currentEditStep === EditRequestStepsEnum.RentOrOwn ? (
                <RentOwn />
              ) : currentEditStep === EditRequestStepsEnum.Edit ? (
                <Calculation
                  boardApprovalDate={
                    mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
                  }
                  availableDate={
                    mocks[4].mhaDetails.staffMHA?.availableDate ?? ''
                  }
                />
              ) : currentEditStep === EditRequestStepsEnum.Receipt ? (
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
