import { Container, Stack } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import i18n from 'src/lib/i18n';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { Receipt } from '../../Shared/CalculationReports/ReceiptStep/Receipt';
import {
  PageEnum,
  PanelTypeEnum,
} from '../../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../../Shared/CalculationReports/StepsList/StepsList';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';
import { mocks } from '../Shared/mockData';
import { StepsEnum } from '../Shared/sharedTypes';
import { AboutForm } from '../Steps/StepOne/AboutForm';
import { Calculation } from '../Steps/StepThree/Calculation';
import { RentOwn } from '../Steps/StepTwo/RentOwn';

export interface FormValues {
  rentOrOwn: MhaRentOrOwnEnum | undefined;
}

const validationSchema = yup.object({
  rentOrOwn: yup
    .string()
    .required(i18n.t('Please select one of the options above to continue.')),
});

export const RequestPage: React.FC = () => {
  const { t } = useTranslation();

  const {
    requestId,
    steps,
    handleNextStep,
    currentStep,
    pageType,
    isDrawerOpen,
    toggleDrawer,
    percentComplete,
    currentIndex,
    setIsComplete,
    requestData,
  } = useMinisterHousingAllowance();

  const request = requestData?.requestAttributes;
  const value = request?.rentOrOwn ?? undefined;

  const accountListId = useAccountListId();
  const link = `/accountLists/${accountListId}/reports/housingAllowance/${requestId}`;

  const isView = pageType === PageEnum.View;
  const isEdit = pageType === PageEnum.Edit;

  const handlePrint = () => {
    window.print();
  };

  const boardDate = mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? '';
  const availableDate = mocks[4].mhaDetails.staffMHA?.availableDate ?? '';
  const deadlineDate = mocks[4].mhaDetails.staffMHA?.deadlineDate ?? '';

  return isView ? (
    <PanelLayout
      panelType={PanelTypeEnum.Empty}
      sidebarTitle={t('Your MHA')}
      percentComplete={0}
      backHref=""
      mainContent={
        <Container sx={{ ml: 5 }}>
          <Stack direction="column" width={mainContentWidth}>
            <Calculation
              boardApprovalDate={
                mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
              }
              availableDate={mocks[4].mhaDetails.staffMHA?.availableDate ?? ''}
              rentOrOwn={value}
              handlePrint={handlePrint}
            />
          </Stack>
        </Container>
      }
    />
  ) : (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      percentComplete={percentComplete}
      currentIndex={currentIndex}
      steps={steps}
      backHref={`/accountLists/${accountListId}/reports/housingAllowance`}
      isSidebarOpen={isDrawerOpen}
      sidebarTitle={isEdit ? t('Edit Request') : t('New Request')}
      sidebarAriaLabel={isEdit ? t('MHA Edit Request') : t('MHA New Request')}
      sidebarContent={<StepsList steps={steps} />}
      mainContent={
        <Formik<FormValues>
          enableReinitialize
          initialValues={{ rentOrOwn: request?.rentOrOwn ?? undefined }}
          validationSchema={validationSchema}
          onSubmit={() => handleNextStep()}
        >
          {({ values }) => (
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
                    rentOrOwn={values.rentOrOwn}
                    deadlineDate={deadlineDate}
                  />
                ) : currentStep === StepsEnum.Receipt ? (
                  <Receipt
                    formTitle={t('MHA Request')}
                    buttonText={t('View Your MHA')}
                    editLink={`${link}?mode=edit`}
                    isEdit={isEdit}
                    viewLink={`${link}?mode=view`}
                    availableDate={availableDate}
                    deadlineDate={deadlineDate}
                    setIsComplete={setIsComplete}
                  />
                ) : null}
              </Stack>
            </Container>
          )}
        </Formik>
      }
    />
  );
};
