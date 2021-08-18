import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Divider,
  ListSubheader,
  Tooltip,
  Typography,
  styled,
} from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';

export interface AccountListSubheaderProps {
  organizationName: string;
}

const StickySubheader = styled(ListSubheader)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

export const AccountListSubheader: FC<AccountListSubheaderProps> = ({
  organizationName,
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <StickySubheader>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={1}
        >
          <Box display="flex" justifyContent="space-between" flexGrow={1}>
            <Typography variant="subtitle2" color="textPrimary">
              <strong>{organizationName}</strong>
            </Typography>
            <Typography variant="subtitle2" color="textPrimary">
              <strong>{t('Balances')}</strong>
            </Typography>
          </Box>
          <Box display="flex" justifyContent="flex-end" width={30}>
            <Tooltip
              title={
                <Box textAlign="center" maxWidth={120}>
                  {t(
                    'If checked, converted balence will be added to account overall balance',
                  )}
                </Box>
              }
              arrow
              placement="left"
            >
              <HelpIcon fontSize="small" />
            </Tooltip>
          </Box>
        </Box>
      </StickySubheader>
      <Divider />
    </React.Fragment>
  );
};
