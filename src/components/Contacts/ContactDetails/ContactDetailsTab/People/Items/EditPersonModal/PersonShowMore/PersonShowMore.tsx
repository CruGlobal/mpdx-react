import React from 'react';
import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';

import SchoolIcon from '@material-ui/icons/School';
import BusinessIcon from '@material-ui/icons/Business';
import { ContactDetailsTabQuery } from '../../../../ContactDetailsTab.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { RingIcon } from '../../../../../../RingIcon';
import { PersonSocial } from '../PersonSocials/PersonSocials';

const useStyles = makeStyles((theme: Theme) => ({
  leftIcon: {
    position: 'absolute',
    top: '50%',
    left: 8,
    transform: 'translateY(-50%)',
    color: theme.palette.cruGrayMedium.main,
  },
}));

interface PersonShowMoreProps {
  person: ContactDetailsTabQuery['contact']['people']['nodes'][0];
}

export const PersonShowMore: React.FC<PersonShowMoreProps> = ({ person }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleDateChange = (date: DateTime) => {
    console.log(date.month);
    console.log(date.day);
    console.log(date.year);
  };
  return (
    <>
      {/* Relationship Section */}
      <ModalSectionContainer>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="relationship-status-label">
                {t('Relationship Status')}
              </InputLabel>
              <Select
                labelId="relationship-status-label"
                value={person.maritalStatus}
                fullWidth
              >
                <MenuItem value="single">{t('Single')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">{t('Gender')}</InputLabel>
              <Select labelId="gender-label" value={person.gender} fullWidth>
                <MenuItem value="male">{t('Male')}</MenuItem>
                <MenuItem value="female">{t('Female')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </ModalSectionContainer>
      {/* Anniversary Section */}
      <ModalSectionContainer>
        <RingIcon className={classes.leftIcon} />
        <DatePicker
          onChange={(date) => (!date ? null : handleDateChange(date))}
          value={
            person?.anniversaryMonth && person?.anniversaryDay
              ? new Date(
                  person.anniversaryYear ?? 1900,
                  person.anniversaryMonth - 1,
                  person.anniversaryDay,
                )
              : null
          }
          format="MM/dd/yyyy"
          clearable
          label={t('Anniversary')}
          fullWidth
          helperText="mm/dd/yyyy"
        />
      </ModalSectionContainer>
      {/* Alma Mater Section */}
      <ModalSectionContainer>
        <SchoolIcon className={classes.leftIcon} />
        <TextField label={t('Alma Mater')} value={person.almaMater} fullWidth />
      </ModalSectionContainer>
      {/* Job Section */}
      <ModalSectionContainer>
        <BusinessIcon className={classes.leftIcon} />
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              label={t('Employer')}
              value={person.employer}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('Occupation')}
              value={person.occupation}
              fullWidth
            />
          </Grid>
        </Grid>
      </ModalSectionContainer>
      {/* Socials Section */}
      <PersonSocial person={person} />
      {/* Legal First Name & Deceased Section */}
      <ModalSectionContainer>
        <TextField
          label={t('Legal First Name')}
          value={person?.legalFirstName}
          fullWidth
        />
      </ModalSectionContainer>
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <Grid container item xs={6} alignItems="center">
            <Checkbox checked={person.deceased} />
            <Typography variant="subtitle1">{t('Deceased')}</Typography>
          </Grid>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
