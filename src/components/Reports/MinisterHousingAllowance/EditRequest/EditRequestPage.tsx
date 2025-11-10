import React from 'react';
import { Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { Receipt } from '../NewRequest/Steps/StepFour/Receipt';
import { Calculation } from '../NewRequest/Steps/StepThree/Calculation';
import { RentOwn } from '../NewRequest/Steps/StepTwo/RentOwn';
import { StepsList } from '../NewRequest/StepsList/StepsList';
import { PanelLayout } from '../PanelLayout/PanelLayout';
import { useMinisterHousingAllowance } from '../Shared/MinisterHousingAllowanceContext';
import { editOwnMock, mocks } from '../Shared/mockData';
import {
  EditRequestStepsEnum,
  PanelTypeEnum,
  RentOwnEnum,
} from '../Shared/sharedTypes';

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
                <Receipt />
              ) : null}
            </Stack>
          </Container>
        </Formik>
      }
    />
  );
};
