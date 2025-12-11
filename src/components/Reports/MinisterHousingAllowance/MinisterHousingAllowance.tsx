import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { NameDisplay } from '../Shared/CalculationReports/NameDisplay/NameDisplay';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { IneligibleDisplay } from './MainPages/IneligibleDisplay';
import {
  useCreateHousingAllowanceRequestMutation,
  useMinistryHousingAllowanceRequestsQuery,
} from './MinisterHousingAllowance.generated';
import { MinisterHousingAllowanceReportSkeleton } from './MinisterHousingAllowanceSkeleton';
import { useMinisterHousingAllowance } from './Shared/Context/MinisterHousingAllowanceContext';
import { getRequestUrl } from './Shared/Helper/getRequestUrl';
import { CurrentBoardApproved } from './SharedComponents/CurrentBoardApproved';
import { CurrentRequest } from './SharedComponents/CurrentRequest';

export const mainContentWidth = theme.spacing(85);

export const MinisterHousingAllowanceReport = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId();

  const { data, error: requestsError } =
    useMinistryHousingAllowanceRequestsQuery();
  const requests = data?.ministryHousingAllowanceRequests.nodes ?? [];

  const {
    isMarried,
    preferredName,
    spousePreferredName,
    userHcmData,
    spouseHcmData,
    userEligibleForMHA,
    spouseEligibleForMHA,
  } = useMinisterHousingAllowance();

  const canAccessMHA = userEligibleForMHA || spouseEligibleForMHA;

  const personNumber = userHcmData?.staffInfo?.personNumber ?? '';
  const spousePersonNumber = spouseHcmData?.staffInfo?.personNumber ?? '';
  const lastName = userHcmData?.staffInfo?.lastName ?? '';
  const spouseLastName = spouseHcmData?.staffInfo?.lastName ?? '';

  const names = isMarried
    ? `${preferredName} ${lastName} and ${spousePreferredName} ${spouseLastName}`
    : `${preferredName} ${lastName}`;
  const personNumbers = isMarried
    ? `${personNumber} and ${spousePersonNumber}`
    : personNumber;

  const [createMHA] = useCreateHousingAllowanceRequestMutation();

  const onCreateMHARequest = async () => {
    if (!canAccessMHA) {
      return;
    }

    await createMHA({
      variables: {
        requestAttributes: {},
      },
      refetchQueries: ['MinistryHousingAllowanceRequests'],
      onCompleted: ({ createMinistryHousingAllowanceRequest: newRequest }) => {
        enqueueSnackbar(
          t("Successfully created MHA Request. You'll be redirected shortly."),
          {
            variant: 'success',
          },
        );
        const mhaRequestId = newRequest?.ministryHousingAllowanceRequest.id;
        const requestLink = getRequestUrl(accountListId, mhaRequestId, 'new');

        // Wait 1 second before redirecting
        setTimeout(() => {
          window.location.href = requestLink;
        }, 1000);
      },
      onError: (err) => {
        enqueueSnackbar(
          t('Error while creating MHA Request - {{error}}', {
            error: err.message,
          }),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  const hasNoRequests = !requests.length;

  const currentRequest = requests[0] || {};
  // It default to true when no availableDate as the request is likely still being processed
  const isCurrentRequestPending =
    currentRequest.status === MhaStatusEnum.BoardApproved &&
    currentRequest.requestAttributes?.availableDate
      ? DateTime.fromISO(currentRequest.requestAttributes.availableDate) >
        DateTime.now()
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
      percentComplete={0}
      backHref={''}
      sidebarTitle={t('Your MHA')}
      mainContent={
        <Container sx={{ ml: 5 }}>
          {requestsError ? (
            <Notification type="error" message={requestsError.message} />
          ) : !requests ? (
            <MinisterHousingAllowanceReportSkeleton />
          ) : (
            <>
              <Stack direction="column" width={mainContentWidth}>
                {hasNoRequests || !canAccessMHA ? (
                  <IneligibleDisplay />
                ) : (
                  <EligibleDisplay isPending={isCurrentRequestPending} />
                )}
                <NameDisplay names={names} personNumbers={personNumbers} />

                {currentRequest &&
                  (isCurrentRequestPending ? (
                    <CurrentRequest request={currentRequest} />
                  ) : (
                    <CurrentBoardApproved request={currentRequest} />
                  ))}
              </Stack>
              {(!isCurrentRequestPending || hasNoRequests) && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={onCreateMHARequest}
                  disabled={!canAccessMHA}
                >
                  {t('Request New MHA')}
                </Button>
              )}
            </>
          )}

          {canAccessMHA && previousApprovedRequest && (
            <Stack direction="column" width={mainContentWidth} mt={4}>
              <CurrentBoardApproved request={previousApprovedRequest} />
            </Stack>
          )}
        </Container>
      }
    />
  );
};
