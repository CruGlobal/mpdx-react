import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Divider,
  ListSubheader,
  Tooltip,
  Typography,
} from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';

export interface DesignationAccountListSubheaderProps {
  organizationName: string;
}

export const DesignationAccountListSubheader: FC<DesignationAccountListSubheaderProps> = ({
  organizationName,
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ListSubheader>
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
      </ListSubheader>
      <Divider />
    </React.Fragment>
  );
};
