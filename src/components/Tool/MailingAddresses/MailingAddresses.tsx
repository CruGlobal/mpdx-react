import { useRouter } from 'next/router';
import React from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import { getQueryParam } from 'src/lib/queryParam';
import { ChangeHistoryAddresses } from './ChangeHistoryAddresses/ChangeHistoryAddresses';
import { ConfirmAddresses } from './ConfirmAddresses/ConfirmAddresses';
import { MailingAddressesTabKey } from './MailingAddressesTabKey';

const CountBadge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.progressBarYellow.main,
  color: theme.palette.mpdxGrayDark.main,
  borderRadius: '10px',
  marginLeft: theme.spacing(1),
  padding: '3px 7px',
  fontSize: '12px',
  fontWeight: 700,
  lineHeight: 1,
}));

interface Props {
  accountListId: string;
}

const MailingAddresses: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const selectedTab =
    getQueryParam(router.query, 'mailingTab') === MailingAddressesTabKey.History
      ? MailingAddressesTabKey.History
      : MailingAddressesTabKey.Confirm;

  const { data: toolNotificationsData } = useGetToolNotificationsQuery({
    variables: { accountListId },
  });
  const toConfirmCount =
    toolNotificationsData?.fixMailingAddresses.totalCount ?? 0;

  const handleTabChange = (
    _event: React.SyntheticEvent,
    tab: MailingAddressesTabKey,
  ) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, mailingTab: tab },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <TabContext value={selectedTab}>
      <TabList
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label={
            <Box display="flex" alignItems="center">
              {t('To Confirm')}
              {toConfirmCount > 0 && (
                <CountBadge data-testid="toConfirmCount">
                  {toConfirmCount < 100 ? toConfirmCount : '99+'}
                </CountBadge>
              )}
            </Box>
          }
          value={MailingAddressesTabKey.Confirm}
          sx={{ fontWeight: 'bold' }}
        />
        <Tab
          label={t('Change History')}
          value={MailingAddressesTabKey.History}
          sx={{ fontWeight: 'bold' }}
        />
      </TabList>
      <TabPanel value={MailingAddressesTabKey.Confirm}>
        <ConfirmAddresses accountListId={accountListId} />
      </TabPanel>
      <TabPanel value={MailingAddressesTabKey.History}>
        <ChangeHistoryAddresses accountListId={accountListId} />
      </TabPanel>
    </TabContext>
  );
};

export default MailingAddresses;
