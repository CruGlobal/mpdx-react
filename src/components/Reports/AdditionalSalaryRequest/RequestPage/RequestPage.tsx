import Link from 'next/link';
import React, { useMemo } from 'react';
import { Box, List, ListItemText, Stack } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { DirectionButtons } from 'src/components/Reports/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { StyledListItem } from '../../SavingsFundTransfer/styledComponents/StyledListItem';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../../Shared/CalculationReports/StepsList/StepsList';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { CurrentStep } from '../CurrentStep';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { calculateCompletionPercentage } from '../Shared/calculateCompletionPercentage';
import { Summary } from '../Summary/Summary';

export const mainContentWidth = theme.spacing(85);

const MainContent: React.FC = () => {
  const { t } = useTranslation();

  const {
    handlePreviousStep,
    handleNextStep,
    currentIndex,
    steps,
    handleDeleteRequest,
    requestId,
    pageType,
    exceedsCap,
  } = useAdditionalSalaryRequest();

  const { submitForm, validateForm, submitCount, isValid } =
    useFormikContext<CompleteFormValues>();

  const isEdit = pageType === PageEnum.Edit;

  const isFirstFormPage = currentIndex === 0;
  const isLastFormPage = currentIndex === steps.length - 2;
  const reviewPage = currentIndex === steps.length - 1;

  const capTitle = t(
    'Your request requires additional approval. Please fill in the information below to continue.',
  );
  const capContent = t(
    'Your request causes your Total Requested Salary to exceed your Maximum Allowable Salary.',
  );
  const capSubContent = (
    <>
      <Trans i18nKey="contactPayrollToIncreaseCap" parent="span">
        Please complete the Approval Process section below and we will review
        your request through our{' '}
        <Link
          href="/"
          style={{ display: 'inline', color: theme.palette.primary.main }}
        >
          Progressive Approvals
        </Link>{' '}
        process. Please note:
      </Trans>
      <Box>
        <List sx={{ listStyleType: 'disc', pl: 4 }} disablePadding>
          <StyledListItem sx={{ py: 0 }}>
            <ListItemText
              primary={t(
                'For the [Amount] you are requesting, this will take [time frame] as it needs to be signed off by [approvers].',
              )}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItem>
          <StyledListItem sx={{ py: 0 }}>
            <ListItemText
              primary={t(
                'No additional salary can be requested while this request is pending.',
              )}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItem>
        </List>
      </Box>
    </>
  );

  return (
    <Box px={theme.spacing(3)}>
      {pageType !== PageEnum.View ? (
        <>
          <CurrentStep />
          {!reviewPage && (
            <Stack direction="column" width={mainContentWidth}>
              <DirectionButtons
                formTitle={t('Additional Salary Request')}
                overrideTitle={exceedsCap ? capTitle : undefined}
                overrideContent={exceedsCap ? capContent : undefined}
                overrideSubContent={
                  exceedsCap
                    ? capSubContent
                    : isEdit
                      ? t('Your updated request will be sent to payroll.')
                      : t('Your request will be sent to payroll.')
                }
                handleNextStep={handleNextStep}
                handlePreviousStep={handlePreviousStep}
                showBackButton={!isFirstFormPage}
                handleDiscard={() =>
                  requestId && handleDeleteRequest(requestId, false)
                }
                isSubmission={isLastFormPage}
                submitForm={submitForm}
                validateForm={validateForm}
                submitCount={submitCount}
                isValid={isValid}
                actionRequired={isEdit}
                isEdit={isEdit}
                exceedsCap={exceedsCap}
              />
            </Stack>
          )}
        </>
      ) : (
        <Summary />
      )}
    </Box>
  );
};

export const RequestPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { pageType, isDrawerOpen, toggleDrawer, steps, currentIndex } =
    useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();

  const percentComplete = useMemo(
    () => calculateCompletionPercentage(values),
    [values],
  );

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      showPercentage={pageType !== PageEnum.View}
      percentComplete={percentComplete}
      steps={steps}
      currentIndex={currentIndex}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      sidebarContent={
        pageType !== PageEnum.View ? <StepsList steps={steps} /> : null
      }
      sidebarTitle={
        pageType !== PageEnum.View
          ? t('Additional Salary Request')
          : t('Pending Request')
      }
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}/reports/additionalSalaryRequest`}
    />
  );
};
