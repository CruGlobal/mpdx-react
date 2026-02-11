import { useEffect, useMemo } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Container,
  Link,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { StyledHeaderBox } from '../MPGAIncomeExpensesReport/styledComponents';
import { AccountInfoBox } from '../Shared/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../Shared/AccountInfoBox/AccountInfoBoxSkeleton';
import { useStaffAccountQuery } from '../StaffAccount.generated';
import {
  LoadingBox,
  LoadingIndicator,
  SimplePrintOnly,
  SimpleScreenOnly,
  StyledPrintButton,
} from '../styledComponents';
import {
  useMinistryPartnerRemindersQuery,
  useUpdateMinistryPartnerRemindersMutation,
} from './MinistryPartnerRemindersQuery.generated';
import { PrintTable } from './Table/PrintTable';
import { RemindersTable, RowValues } from './Table/RemindersTable';
import { ReminderData } from './mockData';

interface MPRemindersReportProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MPRemindersReport: React.FC<MPRemindersReportProps> = ({
  title,
  isNavListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();

  const [updateMutation] = useUpdateMinistryPartnerRemindersMutation({
    refetchQueries: ['MinistryPartnerReminders'],
  });

  const {
    data: userData,
    loading: userLoading,
    refetch: refetchUser,
  } = useGetUserQuery();

  useEffect(() => {
    if (accountListId) {
      refetchUser();
    }
  }, [accountListId, refetchUser]);

  const { data: staffAccountData, loading: staffLoading } =
    useStaffAccountQuery({});

  const designationNumber = userData?.user?.primaryDesignation ?? '';

  const { data, loading, error } = useMinistryPartnerRemindersQuery({
    variables: {
      accountListId: accountListId ?? '',
      designationNumber,
    },
    skip: !designationNumber,
  });

  const reminders = data?.ministryPartnerReminders ?? [];

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async (values: RowValues) => {
    const updates = Object.entries(values.status)
      .filter(([id, statusCd]) => initialValues.status[id] !== statusCd)
      .map(([id, statusCd]) => {
        return {
          rowId: id,
          statusCd,
        };
      });

    if (updates.length === 0) {
      enqueueSnackbar(t('No changes have been made'), { variant: 'info' });
      return;
    }

    await updateMutation({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          designationNumber,
          updates,
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Changes saved'), { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar(t('Error saving changes'), { variant: 'error' });
      },
    });
  };

  const transformedData: ReminderData[] = useMemo(
    () =>
      reminders
        .map((contact) => {
          return {
            ...contact,
            id: contact.id,
            partner: contact.donorName ?? '',
            partnerId: contact.donorAccountNumber ?? '',
            lastGift: contact.lastGiftDate
              ? DateTime.fromISO(contact.lastGiftDate)
              : null,
            lastReminder: contact.lastReminderDate
              ? DateTime.fromISO(contact.lastReminderDate)
              : null,
            status: contact.frequency
              ? contact.frequency
              : MinistryPartnerReminderFrequencyEnum.NotReminded,
          };
        })
        .toSorted((a, b) => a.partner.localeCompare(b.partner)),
    [reminders],
  );

  const initialValues = useMemo(
    () => ({
      status: Object.fromEntries(
        transformedData.map((row) => [
          row.id,
          row.status ?? MinistryPartnerReminderFrequencyEnum.NotReminded,
        ]),
      ),
    }),
    [transformedData],
  );

  return (
    <Formik<RowValues>
      initialValues={initialValues}
      onSubmit={handleSave}
      enableReinitialize
    >
      {({ submitForm }) => (
        <Box>
          <SimpleScreenOnly>
            <MultiPageHeader
              isNavListOpen={isNavListOpen}
              onNavListToggle={onNavListToggle}
              headerType={HeaderTypeEnum.Report}
              title={title}
            />
          </SimpleScreenOnly>
          <Box mt={2}>
            <Container>
              <StyledHeaderBox>
                <Typography variant="h4">
                  {t('Online Reminder System')}
                </Typography>
                <SimpleScreenOnly>
                  <StyledPrintButton
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PrintIcon titleAccess={t('Print')} />
                      </SvgIcon>
                    }
                    onClick={handlePrint}
                  >
                    {t('Print')}
                  </StyledPrintButton>
                </SimpleScreenOnly>
              </StyledHeaderBox>
              {staffLoading ? (
                <AccountInfoBoxSkeleton />
              ) : (
                <AccountInfoBox
                  name={staffAccountData?.staffAccount?.name}
                  accountId={staffAccountData?.staffAccount?.id}
                />
              )}
            </Container>
          </Box>
          <Box>
            <Container>
              <SimpleScreenOnly>
                <Box mt={3} mb={4}>
                  <Trans i18nKey={'reminders.description'}>
                    <Typography sx={{ lineHeight: 1.5 }}>
                      You can now change the reminder status of any of your
                      ministry partners online! Your current list and related
                      information is displayed below. To change the reminder
                      status of any of your ministry partners, use the drop-down
                      boxes in the &quot;Reminder Status&quot; column.
                    </Typography>

                    <Typography sx={{ marginTop: 3, lineHeight: 1.5 }}>
                      When you&apos;re done, click the &quot;Save&quot; button
                      at the bottom of the page. Wondering how the{' '}
                      <i>Reminder System</i> works and how it differs from the
                      Receipting System? Check out{' '}
                      <Link
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                        }}
                        underline="hover"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ministry Partner Reminder help
                      </Link>
                      .
                    </Typography>
                  </Trans>
                </Box>
                <Box mb={2}>
                  <Box mb={2}>
                    <SimpleScreenOnly>
                      <Button variant="contained" onClick={submitForm}>
                        {t('Save')}
                      </Button>
                    </SimpleScreenOnly>
                  </Box>
                  <Typography>
                    <strong>{t('Number of Ministry Partners: ')}</strong>
                    {reminders.length}
                  </Typography>
                </Box>
              </SimpleScreenOnly>
              <Box sx={{ mb: 4 }}>
                <SimpleScreenOnly>
                  {(loading || userLoading) && !data ? (
                    <LoadingBox>
                      <LoadingIndicator
                        data-testid="loading-spinner"
                        color="primary"
                        size={50}
                      />
                    </LoadingBox>
                  ) : (
                    <RemindersTable data={transformedData} error={error} />
                  )}
                </SimpleScreenOnly>
                <SimplePrintOnly>
                  <PrintTable data={transformedData} error={error} />
                </SimplePrintOnly>
              </Box>
            </Container>
          </Box>
        </Box>
      )}
    </Formik>
  );
};
