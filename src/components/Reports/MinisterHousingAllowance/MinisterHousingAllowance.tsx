import NextLink from 'next/link';
import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { NameDisplay } from '../Shared/CalculationReports/NameDisplay/NameDisplay';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { IneligibleDisplay } from './MainPages/IneligibleDisplay';
import { MinisterHousingAllowanceProvider } from './Shared/Context/MinisterHousingAllowanceContext';
import { Mock } from './Shared/mockData';
import { CurrentBoardApproved } from './SharedComponents/CurrentBoardApproved';
import { CurrentRequest } from './SharedComponents/CurrentRequest';

export const mainContentWidth = theme.spacing(85);

interface MinisterHousingAllowanceReportProps {
  testPerson: Mock;
}

export const MinisterHousingAllowanceReport: React.FC<
  MinisterHousingAllowanceReportProps
> = ({ testPerson }) => {
  const { t } = useTranslation();

  const accountListId = useAccountListId();
  const requestLink = `/accountLists/${accountListId}/reports/housingAllowance/new`;

  const isMarried = testPerson.spouseInfo !== null;
  const title = t('Your MHA');

  // temporary logic for no pending or approved MHA
  const noMHA = testPerson.mhaDetails.staffMHA === null;

  // temporary logic for no pending MHA
  const noPending =
    testPerson.mhaDetails.staffMHA !== null &&
    testPerson.mhaDetails.staffMHA.deadlineDate === null;

  // temporary logic for no approved MHA
  const noApproved =
    testPerson.mhaDetails.staffMHA !== null &&
    testPerson.mhaDetails.staffMHA.deadlineDate !== null;

  // TODO: Logic to show both current and new request if pending and approved MHA

  return (
    <MinisterHousingAllowanceProvider>
      <PanelLayout
        panelType={PanelTypeEnum.Empty}
        sidebarTitle={title}
        percentComplete={0}
        backHref={''}
        mainContent={
          <Container sx={{ ml: 5 }}>
            <Stack direction="column" width={mainContentWidth}>
              {noMHA ? (
                <IneligibleDisplay
                  title={title}
                  isMarried={isMarried}
                  staff={testPerson.staffInfo}
                  spouse={isMarried ? testPerson.spouseInfo : null}
                />
              ) : noPending ? (
                <EligibleDisplay title={title} isPending={false} />
              ) : noApproved ? (
                <EligibleDisplay title={title} isPending={true} />
              ) : null}
              <NameDisplay
                staffName={testPerson.staffInfo.name}
                staffId={testPerson.staffInfo.id}
                spouseName={
                  isMarried
                    ? testPerson.spouseInfo?.name.split(', ')[1]
                    : undefined
                }
                spouseId={isMarried ? testPerson.spouseInfo?.id : undefined}
              />
              {noApproved && (
                <CurrentRequest
                  approvedOverallAmount={
                    testPerson.mhaDetails.staffMHA?.approvedOverallAmount ??
                    null
                  }
                  requestedDate={
                    testPerson.mhaDetails.staffMHA?.lastApprovedDate ?? null
                  }
                  deadlineDate={
                    testPerson.mhaDetails.staffMHA?.deadlineDate ?? null
                  }
                  boardApprovedDate={
                    testPerson.mhaDetails.staffMHA?.boardApprovalDate ?? null
                  }
                  availableDate={
                    testPerson.mhaDetails.staffMHA?.availableDate ?? null
                  }
                />
              )}
              {noPending && (
                <CurrentBoardApproved
                  approvedDate={
                    testPerson.mhaDetails.staffMHA?.approvedDate ?? null
                  }
                  approvedOverallAmount={
                    testPerson.mhaDetails.staffMHA?.approvedOverallAmount ??
                    null
                  }
                  staffName={testPerson.staffInfo.name}
                  staffSpecific={
                    testPerson.mhaDetails.staffMHA?.approvedSpecificAmount ??
                    null
                  }
                  spouseName={
                    isMarried && testPerson.spouseInfo
                      ? testPerson.spouseInfo.name
                      : undefined
                  }
                  spouseSpecific={
                    isMarried
                      ? (testPerson.mhaDetails.spouseMHA
                          ?.approvedSpecificAmount ?? null)
                      : null
                  }
                />
              )}
            </Stack>
            {(noPending || noMHA) && (
              <Button
                component={NextLink}
                href={requestLink}
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                {t('Request New MHA')}
              </Button>
            )}
          </Container>
        }
      />
    </MinisterHousingAllowanceProvider>
  );
};
