import Link from 'next/link';
import React from 'react';
import { Box, List, ListItemText } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { StyledListItem } from '../../SavingsFundTransfer/styledComponents/StyledListItem';

export const CapSubContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Trans i18nKey="contactPayrollToIncreaseCap" parent="span">
        Please complete the Approval Process section below and we will review
        your request through our{' '}
        <Link
          href="/"
          style={{ display: 'inline', color: theme.palette.primary.main }}
        >
          Progressive Approvals
        </Link>{' '}
        process. Please note:
      </Trans>
      <Box>
        <List sx={{ listStyleType: 'disc', pl: 4 }} disablePadding>
          <StyledListItem sx={{ py: 0 }}>
            <ListItemText
              primary={t(
                'For the [Amount] you are requesting, this will take [time frame] as it needs to be signed off by [approvers].',
              )}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItem>
          <StyledListItem sx={{ py: 0 }}>
            <ListItemText
              primary={t(
                'No additional salary can be requested while this request is pending.',
              )}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItem>
        </List>
      </Box>
    </>
  );
};
