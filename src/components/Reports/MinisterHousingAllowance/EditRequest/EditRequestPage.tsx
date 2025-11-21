import React from 'react';
import { Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useAccountListId } from 'src/hooks/useAccountListId';
import i18n from 'src/lib/i18n';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { Receipt } from '../../Shared/CalculationReports/ReceiptStep/Receipt';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';
import { editOwnMock, mocks } from '../Shared/mockData';
import { PageEnum, RentOwnEnum, StepsEnum } from '../Shared/sharedTypes';
import { AboutForm } from '../Steps/StepOne/AboutForm';
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

  const accountListId = useAccountListId();
  const editLink = `/accountLists/${accountListId}/reports/housingAllowance/edit`;

  const {
    steps,
    handleNextStep,
    currentStep,
    pageType,
    isDrawerOpen,
    toggleDrawer,
    percentComplete,
    currentIndex,
  } = useMinisterHousingAllowance();

  const isEdit = pageType === PageEnum.Edit;

  const boardDate = mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? '';
  const availableDate = mocks[4].mhaDetails.staffMHA?.availableDate ?? '';

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      percentComplete={percentComplete}
      currentIndex={currentIndex}
      steps={steps}
      backHref={`/accountLists/${accountListId}/reports/housingAllowance`}
      isSidebarOpen={isDrawerOpen}
      sidebarTitle={t('Edit Request')}
      sidebarAriaLabel={t('MHA Edit Request')}
      sidebarContent={<StepsList steps={steps} />}
      mainContent={
        <Formik<FormValues>
          initialValues={{ rentOrOwn: editOwnMock.rentOrOwn }}
          validationSchema={validationSchema}
          onSubmit={() => handleNextStep()}
        >
          <Container sx={{ ml: 5 }}>
            <Stack direction="column" width={mainContentWidth}>
              {currentStep === StepsEnum.AboutForm ? (
                <AboutForm
                  boardApprovalDate={boardDate}
                  availableDate={availableDate}
                />
              ) : currentStep === StepsEnum.RentOrOwn ? (
                <RentOwn />
              ) : currentStep === StepsEnum.CalcForm ? (
                <Calculation
                  boardApprovalDate={boardDate}
                  availableDate={availableDate}
                />
              ) : currentStep === StepsEnum.Receipt ? (
                <Receipt
                  formTitle={t('MHA Request')}
                  buttonText={t('View Your MHA')}
                  isEdit={isEdit}
                  editLink={editLink}
                  viewLink=""
                  availableDate={availableDate}
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
