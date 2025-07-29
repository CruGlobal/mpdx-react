/* eslint-disable no-console */
import React, { useState } from 'react';
import { Groups, Savings, Wallet } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { BalanceCard } from './BalanceCard/BalanceCard';
import { TransferHistoryTable } from './Table/TransferHistory';

export interface TransferHistory {
  transfers: string;
  amount: number;
  schedule: string;
  status: string;
  transferDate: string;
  stopDate: string;
  note: string;
  actions: string;
}

interface SavingsFundTransferProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const SavingsFundTransfer: React.FC<SavingsFundTransferProps> = ({
  //   accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();

  const mockData = {
    accountListId: '123456789',
    accountName: 'Test Account',
    funds: {
      staffAccount: {
        balance: 15000,
        pending: 17500,
      },
      staffConferenceSavings: {
        balance: 500,
        pending: 200,
      },
      staffSavings: {
        balance: 2500,
        pending: 0,
      },
    },
    history: [
      {
        transfers: 'staffSavings to staffAccount',
        amount: 2500,
        schedule: 'One Time',
        status: 'Pending',
        transferDate: '2023-09-26',
        stopDate: '',
        note: 'Reimbursements',
        actions: 'dropdown',
      },
      {
        transfers: 'staffAccount to staffSavings',
        amount: 1200,
        schedule: 'Monthly',
        status: 'Ongoing',
        transferDate: '2023-09-30',
        stopDate: '2025-09-30',
        note: 'Long-term savings',
        actions: 'edit-pause',
      },
      {
        transfers: 'staffSavings to staffAccount',
        amount: 500,
        schedule: 'One Time',
        status: 'Complete',
        transferDate: '2023-09-29',
        stopDate: '',
        note: 'Tax',
        actions: 'dropdown',
      },
      {
        transfers: 'staffAccount to staffConferenceSavings',
        amount: 120,
        schedule: 'Monthly',
        status: 'Ended',
        transferDate: '2023-09-28',
        stopDate: '2024-06-01',
        note: 'Cru 25',
        actions: 'dropdown',
      },
      {
        transfers: 'staffAccount to staffConferenceSavings',
        amount: 750,
        schedule: 'One Time',
        status: 'Failed',
        transferDate: '2023-09-27',
        stopDate: '',
        note: 'X-fer tickets',
        actions: 'dropdown',
      },
    ],
  };

  const [showForm, setShowForm] = useState(false);

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        headerType={HeaderTypeEnum.Report}
        title={t(title)}
      />
      {!showForm ? (
        <>
          <Box>
            <Container>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  mt: 2,
                }}
              >
                <Typography variant="h4">{t('Fund Transfer')}</Typography>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="contained"
                  color="primary"
                >
                  {t('Get Started')}
                </Button>
              </Box>
            </Container>
          </Box>
          <Box>
            <Container>
              <Box
                sx={{
                  mt: 2,
                }}
              >
                <Typography variant="body1">
                  {t(
                    'The Staff Conference Savings Fund was created so RMO staff members could set aside funds to help save for costs associated with the U.S. Staff Conference. Since this fund was created, an increasing number of staff have asked if they could use it to help set aside funds for mission trips, upcoming large expenses...',
                  )}
                  <br />
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {t(
                    'In response to those requests, we’ve set up a new, self-service ',
                  )}
                  <strong>Staff Savings Fund</strong>
                  {t(
                    " where you can seamlessly move funds between your staff account, the Staff Savings Fund, and the Staff Conference Savings Fund. You can make a one-time transfer or schedule an automatic monthly transfer. It's really easy and all self service.",
                  )}
                  <br />
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {t('A Few Quick Notes About Monthly Transfers:')}
                </Typography>
                <List sx={{ listStyleType: 'disc', pl: 4 }}>
                  <ListItem
                    sx={{
                      display: 'list-item',
                      listStylePosition: 'outside',
                      p: 0,
                      m: 0,
                    }}
                  >
                    <ListItemText
                      primary={t(
                        'Want your monthly transfer to end at a certain point? You can set a stop date—super handy! Just a heads-up: once it’s there, it can’t be removed, but you can change it to a different date if needed.',
                      )}
                    />
                  </ListItem>
                  <ListItem
                    sx={{
                      display: 'list-item',
                      listStylePosition: 'outside',
                      p: 0,
                      m: 0,
                    }}
                  >
                    <ListItemText
                      primary={t(
                        'Need to update the amount you’re transferring each month? No problem! Just set a stop date for the end of the current month on your existing transfer. After that, go ahead and set up a brand-new monthly transfer with the updated amount.',
                      )}
                    />
                  </ListItem>
                  <ListItem
                    sx={{
                      display: 'list-item',
                      listStylePosition: 'outside',
                      p: 0,
                      m: 0,
                    }}
                  >
                    <ListItemText
                      primary={t(
                        "For brand-new monthly transfers, it might take up to one full month cycle before you see it show up in your account. So hang tight—it's on its way!",
                      )}
                    />
                  </ListItem>
                </List>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  <Box component="span" display="inline">
                    <Link
                      component="button"
                      onClick={() => setShowForm(true)}
                      underline="hover"
                      sx={{
                        p: 0,
                        mb: 0.5,
                        fontSize: 'inherit',
                      }}
                    >
                      {t('Click here')}
                    </Link>
                  </Box>{' '}
                  {t(
                    'to check it out and get started saving for future needs!',
                  )}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {t(
                    'If you have any questions, please contact Crystal Dunaway in Staff Services at ',
                  )}
                  <Link href="mailto:Crystal.Dunaway@cru.org" underline="hover">
                    Crystal.Dunaway@cru.org
                  </Link>
                  .
                </Typography>
              </Box>
            </Container>
          </Box>
        </>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Container>
            <Typography variant="h4">{t('Fund Transfer')}</Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                mb: 2,
              }}
            >
              <Typography>{mockData.accountName}</Typography>
              <Typography>{mockData.accountListId}</Typography>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <BalanceCard
                title={t('Staff Account Balance')}
                icon={Wallet}
                iconBgColor="#F08020"
                balance={15000}
                pending={17500}
                onClick={() => console.log('Staff Savings Fund clicked')}
              />
              <BalanceCard
                title={t('Staff Conference Savings Balance')}
                icon={Groups}
                iconBgColor="#00C0D8"
                balance={500}
                pending={200}
                onClick={() =>
                  console.log('Staff Conference Savings Fund clicked')
                }
              />
              <BalanceCard
                title={t('Staff Savings Balance')}
                icon={Savings}
                iconBgColor="#007890"
                balance={2500}
                pending={0}
                onClick={() => console.log('Staff Savings Fund clicked')}
              />
            </Box>
            <Box sx={{ mt: 2, mb: 3 }}>
              <TransferHistoryTable
                history={mockData.history}
                emptyPlaceholder={
                  <Typography>{t('No transfer history available')}</Typography>
                }
              />
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default SavingsFundTransfer;
