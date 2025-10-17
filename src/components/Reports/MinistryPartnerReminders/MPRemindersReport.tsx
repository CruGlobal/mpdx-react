import { useMemo } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Container,
  Link,
  SvgIcon,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { StyledHeaderBox } from '../MPGAIncomeExpensesReport/styledComponents';
import { useStaffAccountQuery } from '../StaffAccount.generated';
import { AccountInfoBox } from '../StaffExpenseReport/AccountInfoBox/AccountInfoBox';
import { AccountInfoBoxSkeleton } from '../StaffExpenseReport/AccountInfoBox/AccountInfoBoxSkeleton';
import {
  LoadingBox,
  LoadingIndicator,
  SimplePrintOnly,
  SimpleScreenOnly,
  StyledPrintButton,
} from '../styledComponents';
import { getReminderStatus } from './Helper/getReminderStatus';
import { useMockQueryQuery } from './MockQuery.generated';
import { PrintTable } from './Table/PrintTable';
import { RemindersTable } from './Table/RemindersTable';
import { ReminderData, ReminderStatusEnum } from './mockData';

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

  const { data: staffAccountData, loading: staffLoading } =
    useStaffAccountQuery({});
  const {
    data: mockQueryData,
    loading: mockLoading,
    fetchMore,
  } = useMockQueryQuery({
    variables: { accountListId: accountListId ?? '' },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    // TODO: Implement save functionality

    enqueueSnackbar(t('Changes saved'), { variant: 'success' });
  };

  const sortedData = useMemo(
    () =>
      mockQueryData?.contacts?.nodes.toSorted((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [mockQueryData],
  );

  const transformedData: ReminderData[] = useMemo(
    () =>
      (sortedData ?? []).map((contact) => {
        return {
          ...contact,
          id: contact.id,
          partner: contact.name,
          partnerId: contact.churchName ?? '',
          lastGift: contact.pledgeStartDate
            ? DateTime.fromISO(contact.pledgeStartDate)
            : null,
          lastReminder: contact.lastDonation?.donationDate
            ? DateTime.fromISO(contact.lastDonation.donationDate)
            : null,
          status: contact.pledgeFrequency
            ? getReminderStatus(contact.pledgeFrequency)
            : ReminderStatusEnum.NotReminded,
        };
      }),
    [mockQueryData],
  );

  return (
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
            <Typography variant="h4">{t('Online Reminder System')}</Typography>
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
                <p style={{ lineHeight: 1.5 }}>
                  You can now change the reminder status of any of your ministry
                  partners online! Your current list and related information is
                  displayed below. To change the reminder status of any of your
                  ministry partners, use the drop-down boxes in the &quot;Change
                  Reminder Status&quot; column.
                </p>

                <p style={{ marginTop: 10, lineHeight: 1.5 }}>
                  When you&apos;re done, click the &quot;Save&quot; button at
                  the bottom of the page. Wondering how the{' '}
                  <i>Reminder System</i> works and how it differs from the
                  Receipting System? Check out{' '}
                  <Link
                    style={{
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
                </p>
              </Trans>
            </Box>
            <Box mb={2}>
              <Box mb={2}>
                <SimpleScreenOnly>
                  <Button variant="contained" onClick={handleSave}>
                    {t('Save')}
                  </Button>
                </SimpleScreenOnly>
              </Box>
              <Typography>
                <strong>{t('Number of Ministry Partners: ')}</strong>
                {mockQueryData?.contacts?.totalCount}
              </Typography>
            </Box>
          </SimpleScreenOnly>
          <Box sx={{ mb: 4 }}>
            <SimpleScreenOnly>
              {mockLoading && !mockQueryData ? (
                <LoadingBox>
                  <LoadingIndicator
                    data-testid="loading-spinner"
                    color="primary"
                    size={50}
                  />
                </LoadingBox>
              ) : (
                <RemindersTable
                  data={transformedData}
                  hasNextPage={
                    mockQueryData?.contacts?.pageInfo?.hasNextPage ?? false
                  }
                  endCursor={mockQueryData?.contacts?.pageInfo?.endCursor ?? ''}
                  fetchMore={fetchMore}
                />
              )}
            </SimpleScreenOnly>
            <SimplePrintOnly>
              <PrintTable data={transformedData} />
            </SimplePrintOnly>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
