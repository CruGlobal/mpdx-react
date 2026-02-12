import Link from 'next/link';
import React from 'react';
import { Box, List, ListItemText } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { StyledListItem } from '../../SavingsFundTransfer/styledComponents/StyledListItem';

//TODO [MPDX-9303]: Add link for Progressive Approvals
//TODO [MPDX-9303]: Get number of days for approval time frame

interface BulletListProps {
  listItems: string[];
}

const BulletList: React.FC<BulletListProps> = ({ listItems }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <List sx={{ listStyleType: 'disc', pl: 4, mt: 0.5 }} disablePadding>
        {listItems.map((item, index) => (
          <StyledListItem key={index} sx={{ py: 0 }} disablePadding>
            <ListItemText
              primary={t(item)}
              primaryTypographyProps={{ variant: 'body2' }}
              sx={{ my: 0 }}
            />
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};

export const ExceedsCapAlertText: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Trans t={t}>
      Because your request exceeds your remaining allowable salary it requires
      additional review. We will review your request through{' '}
      <Link
        href="/"
        style={{ display: 'inline', color: theme.palette.primary.main }}
      >
        Progressive Approvals
      </Link>{' '}
      process.
      <BulletList
        listItems={[
          'This can take up to -- days.',
          'No additional salary can be requested while this request is pending.',
        ]}
      />
    </Trans>
  );
};

export const EditAlertText: React.FC = () => {
  return (
    <BulletList
      listItems={[
        'We will review your updated request.',
        'No additional salary can be requested while this request is pending.',
      ]}
    />
  );
};
