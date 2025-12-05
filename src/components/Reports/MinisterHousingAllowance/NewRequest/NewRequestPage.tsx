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

export const NewRequestPage: React.FC = () => {
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
  } = useMinisterHousingAllowance();

  const accountListId = useAccountListId();
  const editLink = `/accountLists/${accountListId}/reports/housingAllowance/${requestId}/edit`;
  const viewLink = `/accountLists/${accountListId}/reports/housingAllowance/${requestId}/view`;

  const isEdit = pageType === PageEnum.Edit;

  const boardDate = mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? '';
  const availableDate = mocks[4].mhaDetails.staffMHA?.availableDate ?? '';
  const deadlineDate = mocks[4].mhaDetails.staffMHA?.deadlineDate ?? '';

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      percentComplete={percentComplete}
      currentIndex={currentIndex}
      steps={steps}
      backHref={`/accountLists/${accountListId}/reports/housingAllowance`}
      isSidebarOpen={isDrawerOpen}
      sidebarTitle={t('New Request')}
      sidebarAriaLabel={t('MHA New Request')}
      sidebarContent={<StepsList steps={steps} />}
      mainContent={
        <Formik<FormValues>
          initialValues={{ rentOrOwn: undefined }}
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
                    editLink={editLink}
                    isEdit={isEdit}
                    viewLink={viewLink}
                    availableDate={availableDate}
                    deadlineDate={
                      mocks[4].mhaDetails.staffMHA?.deadlineDate ?? ''
                    }
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
