/* eslint-disable no-console */
import NextLink from 'next/link';
import React, { useContext } from 'react';
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
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  StaffSavingFundContext,
  StaffSavingFundType,
} from '../../StaffSavingFund/StaffSavingFundContext';

interface SavingsFundTransferProps {
  title: string;
}

const StyledListItem = styled(ListItem)({
  display: 'list-item',
  listStylePosition: 'outside',
  p: 0,
  m: 0,
});

export const SavingsFundTransfer: React.FC<SavingsFundTransferProps> = ({
  title,
}) => {
  const { t } = useTranslation();
  const { accountListId, isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

  const transferLink = `/accountLists/${accountListId}/reports/staffSavingFund/transfers`;

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        headerType={HeaderTypeEnum.Report}
        title={title}
      />

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
              component={NextLink}
              href={transferLink}
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
                "In response to those requests, we've set up a new, self-service ",
              )}
              <strong>{t('Staff Savings Fund')}</strong>
              {t(
                " where you can seamlessly move funds between your staff account, the Staff Savings Fund, and the Staff Conference Savings Fund. You can make a one-time transfer or schedule an automatic monthly transfer. It's really easy and all self service.",
              )}
              <br />
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {t('A Few Quick Notes About Monthly Transfers:')}
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
              <StyledListItem>
                <ListItemText
                  primary={t(
                    'Want your monthly transfer to end at a certain point? You can set a stop date—super handy! Just a heads-up: once it’s there, it can’t be removed, but you can change it to a different date if needed.',
                  )}
                />
              </StyledListItem>
              <StyledListItem>
                <ListItemText
                  primary={t(
                    "Need to update the amount you're transferring each month? No problem! Just set a stop date for the end of the current month on your existing transfer. After that, go ahead and set up a brand-new monthly transfer with the updated amount.",
                  )}
                />
              </StyledListItem>
              <StyledListItem>
                <ListItemText
                  primary={t(
                    "For brand-new monthly transfers, it might take up to one full month cycle before you see it show up in your account. So hang tight—it's on its way!",
                  )}
                />
              </StyledListItem>
            </List>
            <Typography variant="h6" sx={{ mt: 2 }}>
              <Box component="span" display="inline">
                <Link
                  component={NextLink}
                  href={transferLink}
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
              {t('to check it out and get started saving for future needs!')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t(
                'If you have any questions, please contact Crystal Dunaway in Staff Services at ',
              )}
              <Link
                href="mailto:Crystal.Dunaway@cru.org"
                underline="hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Crystal.Dunaway@cru.org
              </Link>
              .
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default SavingsFundTransfer;
