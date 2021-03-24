import { Box, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { DateRange } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyle = makeStyles((theme: Theme) => ({
  frequencyInputLabel: {
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    marginBottom: '4px',
    fontSize: '12px',
  },
  frequencySelect: {
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '9px',
    paddingBottom: '9px',
    background: theme.palette.common.white,
    fontFamily: theme.typography.fontFamily,
    fontSize: '16px',
  },
  frequencyMenuItem: {
    fontFamily: theme.typography.fontFamily,
    fontSize: '16px',
    margin: theme.spacing(1),
  },
  frequencyIcon: {
    width: '20px',
    height: '20px',
    color: theme.palette.secondary.main,
    marginRight: theme.spacing(1),
  },
}));

interface FrequencySelectorProps {
  frequencies: string[];
  selectedFrequency: string;
  saveFrequency: (frequency: string) => void;
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  frequencies,
  selectedFrequency,
  saveFrequency,
}) => {
  const { t } = useTranslation();
  const classes = useStyle();
  const [contactFrequency, setContactFrequency] = React.useState(
    selectedFrequency,
  );
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setContactFrequency(event.target.value as string);
    saveFrequency(event.target.value as string);
  };
  return (
    <Box>
      <InputLabel className={classes.frequencyInputLabel}>
        {t('Frequency')}
      </InputLabel>
      <Select
        className={classes.frequencySelect}
        id="contactFrequency"
        value={contactFrequency}
        onChange={handleChange}
      >
        {frequencies.map(function (frequency, _index) {
          return (
            <MenuItem
              className={classes.frequencyMenuItem}
              value={frequency}
              key={frequency}
            >
              <DateRange className={classes.frequencyIcon} />
              {frequency}
            </MenuItem>
          );
        })}
      </Select>
    </Box>
  );
};
