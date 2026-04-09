import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading/Loading';
import { Notification } from 'src/components/Notification/Notification';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { NameDisplay } from '../Shared/CalculationReports/NameDisplay/NameDisplay';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { EligibilityStatusTable } from '../Shared/EligibilityStatusTable/EligibilityStatusTable';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { NoRequestsDisplay } from './MainPages/NoRequestsDisplay';
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
  const router = useRouter();

  const {
    data,
    error: requestsError,
    loading,
  } = useMinistryHousingAllowanceRequestsQuery();
  const requests = data?.ministryHousingAllowanceRequests.nodes ?? [];

  const {
    isMarried,
    preferredName,
    spousePreferredName,
    userEligibleForMHA,
    spouseEligibleForMHA,
    userHcmData,
    spouseHcmData,
  } = useMinisterHousingAllowance();

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
  const [creatingRequest, setCreatingRequest] = useState(false);

  const onCreateMHARequest = async () => {
    setCreatingRequest(true);
    await createMHA({
      variables: {
        requestAttributes: {
          phoneNumber: userHcmData?.staffInfo.primaryPhoneNumber,
          emailAddress: userHcmData?.staffInfo.emailAddress,
        },
      },
      onCompleted: ({ createMinistryHousingAllowanceRequest: newRequest }) => {
        enqueueSnackbar(t('Successfully created MHA Request.'), {
          variant: 'success',
        });
        const mhaRequestId = newRequest?.ministryHousingAllowanceRequest.id;
        const requestLink = getRequestUrl(accountListId, mhaRequestId, 'new');
        router.push(requestLink);
      },
      onError: (err) => {
        setCreatingRequest(false);
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

  const currentRequest = requests[0] ?? undefined;
  // It default to true when no availableDate as the request is likely still being processed
  const isCurrentRequestPending =
    currentRequest?.status === MhaStatusEnum.BoardApproved &&
    currentRequest?.requestAttributes?.availableDate
      ? DateTime.fromISO(currentRequest?.requestAttributes?.availableDate) >
        DateTime.now()
      : true;

  // Once the current request is HR approved, the user may submit another request
  const hasBlockingRequest = currentRequest
    ? [
        MhaStatusEnum.InProgress,
        MhaStatusEnum.ActionRequired,
        MhaStatusEnum.Pending,
      ].includes(currentRequest.status)
    : false;

  const previousApprovedRequest = requests
    .slice(1)
    ?.find(
      (request) =>
        request.status === MhaStatusEnum.BoardApproved &&
        isCurrentRequestPending,
    );

  const hasNoRequests = !requests.length;

  const eitherPersonEligible = userEligibleForMHA || spouseEligibleForMHA;

  const showNewRequestButton = eitherPersonEligible && !hasBlockingRequest;
  const showCurrentRequest = eitherPersonEligible && currentRequest;
  const showPreviousRequests = eitherPersonEligible && previousApprovedRequest;

  if (creatingRequest) {
    return <Loading loading />;
  }

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Empty}
      percentComplete={0}
      backHref={''}
      sidebarTitle={t('Your MHA')}
      hasCurrentRequestPending={isCurrentRequestPending}
      mainContent={
        <Container sx={{ ml: 5 }}>
          {requestsError ? (
            <Notification type="error" message={requestsError.message} />
          ) : loading ? (
            <MinisterHousingAllowanceReportSkeleton />
          ) : (
            <>
              <Stack direction="column" width={mainContentWidth}>
                <Box mb={2}>
                  <Typography variant="h5">{t('Your MHA')}</Typography>
                </Box>

                <NameDisplay names={names} personNumbers={personNumbers} />

                {hasNoRequests ? (
                  <>
                    <NoRequestsDisplay />
                    <Box mt={2}>
                      <EligibilityStatusTable
                        userPreferredName={preferredName}
                        userEligible={userEligibleForMHA}
                        userCountry={
                          userHcmData?.staffInfo?.country ?? undefined
                        }
                        spousePreferredName={
                          isMarried ? spousePreferredName : undefined
                        }
                        spouseEligible={
                          isMarried ? spouseEligibleForMHA : undefined
                        }
                        spouseCountry={
                          isMarried
                            ? (spouseHcmData?.staffInfo?.country ?? undefined)
                            : undefined
                        }
                      />
                    </Box>
                  </>
                ) : (
                  eitherPersonEligible && (
                    <EligibleDisplay isPending={isCurrentRequestPending} />
                  )
                )}

                {showCurrentRequest &&
                  (isCurrentRequestPending ? (
                    <CurrentRequest request={currentRequest} />
                  ) : (
                    <CurrentBoardApproved request={currentRequest} />
                  ))}
              </Stack>
              {showNewRequestButton && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={onCreateMHARequest}
                >
                  {t('Request New MHA')}
                </Button>
              )}
              {showPreviousRequests && (
                <Stack direction="column" width={mainContentWidth} mt={4}>
                  <CurrentBoardApproved request={previousApprovedRequest} />
                </Stack>
              )}
            </>
          )}
        </Container>
      }
    />
  );
};
