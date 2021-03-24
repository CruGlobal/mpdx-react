import { Box, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ErrorOutline } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  statusLabel: {
    padding: theme.spacing(0),
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    fontSize: '12px',
    letterSpacing: '0.4px',
    margin: '4px 0px',
  },
  statusMenuItem: {
    fontFamily: theme.typography.fontFamily,
    fontSize: '16px',
    background: theme.palette.common.white,
  },
  statusIcon: {
    color: theme.palette.secondary.main,
    marginRight: theme.spacing(1),
    width: '20px',
    height: '20px',
  },
  statusSelector: {
    fontFamily: theme.typography.fontFamily,
    fontSize: '16px',
    background: theme.palette.common.white,
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
}));
interface StatusSelectorProps {
  statuses: string[];
  selectedStatus: string;
  saveContactStatus: (status: string) => void;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  statuses,
  selectedStatus,
  saveContactStatus,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [contactStatus, setContactStatus] = React.useState(selectedStatus);
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setContactStatus(event.target.value as string);
    saveContactStatus(event.target.value as string);
  };
  return (
    <Box>
      <InputLabel className={classes.statusLabel}>{t('Status')}</InputLabel>
      <Select
        className={classes.statusSelector}
        id="contactStatus"
        value={contactStatus}
        onChange={handleChange}
      >
        {statuses.map(function (status, _index) {
          return (
            <MenuItem
              className={classes.statusMenuItem}
              value={status}
              key={status}
            >
              <ErrorOutline className={classes.statusIcon} />
              {status}
            </MenuItem>
          );
        })}
      </Select>
    </Box>
  );
};
