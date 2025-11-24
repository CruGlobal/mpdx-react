import NextLink from 'next/link';
import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { IneligibleDisplay } from './MainPages/IneligibleDisplay';
import {
  useMinistryHousingAllowanceRequestsQuery,
} from './MinisterHousingAllowance.generated';
import { MinisterHousingAllowanceReportSkeleton } from './MinisterHousingAllowanceSkeleton';
import { PanelLayout } from './PanelLayout/PanelLayout';
import { PanelTypeEnum } from './Shared/sharedTypes';
import { CurrentBoardApproved } from './SharedComponents/CurrentBoardApproved';
import { CurrentRequest } from './SharedComponents/CurrentRequest';
import { NameDisplay } from './SharedComponents/NameDisplay';

export const mainContentWidth = theme.spacing(85);

export const MinisterHousingAllowanceReport = () => {
  const { t } = useTranslation();

  const accountListId = useAccountListId();

  const { data, error } = useMinistryHousingAllowanceRequestsQuery();
  const requests = data?.ministryHousingAllowanceRequests.nodes ?? [];


  const hasNoRequests = !requests.length;

  const currentRequest = requests[0] || {};
  // It default to true when no availableDate as the request is likely still being processed
  const isCurrentRequestPending =
    currentRequest.status === MhaStatusEnum.BoardApproved &&
    currentRequest.requestAttributes?.availableDate
      ? new Date(currentRequest.requestAttributes.availableDate) > new Date()
      : true;

  const previousApprovedRequest = requests
    .slice(1)
    ?.find(
      (request) =>
        request.status === MhaStatusEnum.BoardApproved &&
        isCurrentRequestPending,
    );
  return (
    <PanelLayout
      panelType={PanelTypeEnum.Empty}
      sidebarTitle={t('Your MHA')}
      mainContent={
        <Container sx={{ ml: 5 }}>
          {error && <Notification type="error" message={error.message} />}
          {!error && !requests && <MinisterHousingAllowanceReportSkeleton />}
          {!error && requests && (
            <>
              <Stack direction="column" width={mainContentWidth}>
                {hasNoRequests ? (
                  <IneligibleDisplay />
                ) : (
                  <EligibleDisplay isPending={isCurrentRequestPending} />
                )}
                <NameDisplay />

                {currentRequest &&
                  (isCurrentRequestPending ? (
                    <CurrentRequest mha={currentRequest} />
                  ) : (
                    <CurrentBoardApproved mha={currentRequest} />
                  ))}
              </Stack>
              {(!isCurrentRequestPending || hasNoRequests) && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  {t('Request New MHA')}
                </Button>
              )}
            </>
          )}

          {previousApprovedRequest && (
            <Stack direction="column" width={mainContentWidth} mt={4}>
              <CurrentBoardApproved mha={previousApprovedRequest} />
            </Stack>
          )}
        </Container>
      }
    />
  );
};
