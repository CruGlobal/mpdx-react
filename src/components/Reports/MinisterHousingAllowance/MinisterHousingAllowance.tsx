import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { EligibleDisplay } from './MainPages/EligibleDisplay';
import { IneligibleDisplay } from './MainPages/IneligibleDisplay';
import {
  useCreateHousingAllowanceRequestMutation,
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
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId();

  const { data, error } = useMinistryHousingAllowanceRequestsQuery();

  const [createMHA] = useCreateHousingAllowanceRequestMutation();

  const MHAData = data?.ministryHousingAllowanceRequests.nodes ?? [];

  const onCreateMHARequest = async () => {
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
        const requestId = newRequest?.ministryHousingAllowanceRequest.id;
        const requestLink = `/accountLists/${accountListId}/reports/housingAllowance/${requestId}`;

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

  const NoMHARequest = !MHAData.length;

  const currentMHA = MHAData[0] || {};
  // It default to true when no availableDate as the request is likely still being processed
  const currentMHAIsPending =
    currentMHA.status === MhaStatusEnum.BoardApproved &&
    currentMHA.requestAttributes?.availableDate
      ? new Date(currentMHA.requestAttributes.availableDate) > new Date()
      : true;

  const previousMHARequest =
    currentMHAIsPending && MHAData[1] ? MHAData[1] : null;

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Empty}
      sidebarTitle={t('Your MHA')}
      mainContent={
        <Container sx={{ ml: 5 }}>
          {error && <Notification type="error" message={error.message} />}
          {!error && !MHAData && <MinisterHousingAllowanceReportSkeleton />}
          {!error && MHAData && (
            <>
              <Stack direction="column" width={mainContentWidth}>
                {NoMHARequest ? (
                  <IneligibleDisplay />
                ) : (
                  <EligibleDisplay isPending={currentMHAIsPending} />
                )}
                <NameDisplay />

                {currentMHA &&
                  (currentMHAIsPending ? (
                    <CurrentRequest MHARequest={currentMHA} />
                  ) : (
                    <CurrentBoardApproved MHARequest={currentMHA} />
                  ))}
              </Stack>
              {(!currentMHAIsPending || NoMHARequest) && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={onCreateMHARequest}
                >
                  {t('Request New MHA')}
                </Button>
              )}
            </>
          )}

          {previousMHARequest && (
            <Stack direction="column" width={mainContentWidth} mt={4}>
              <CurrentBoardApproved MHARequest={previousMHARequest} />
            </Stack>
          )}
        </Container>
      }
    />
  );
};
