import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import { FormikProps } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { RingIcon } from '../../../../../../RingIcon';
import { PersonSocial } from '../PersonSocials/PersonSocials';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { NewSocial } from '../PersonModal';

const DeceasedLabel = styled(FormControlLabel)(() => ({
  margin: 'none',
}));

interface PersonShowMoreProps {
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
}

export const PersonShowMore: React.FC<PersonShowMoreProps> = ({
  formikProps,
}) => {
  const { t } = useTranslation();

  const {
    values: {
      maritalStatus,
      gender,
      anniversaryDay,
      anniversaryMonth,
      anniversaryYear,
      almaMater,
      employer,
      occupation,
      legalFirstName,
      deceased,
    },
    handleChange,
    setFieldValue,
  } = formikProps;

  const handleDateChange = (date: DateTime) => {
    setFieldValue('anniversaryDay', date.day);
    setFieldValue('anniversaryMonth', date.month);
    setFieldValue('anniversaryYear', date.year);
  };
  return (
    <>
      {/* Relationship Section */}
      <ModalSectionContainer>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="relationship-status-label">
                {t('Relationship Status')}
              </InputLabel>
              <Select
                label={t('Relationship Status')}
                labelId="relationship-status-label"
                value={maritalStatus ?? ''}
                onChange={(e) => setFieldValue('maritalStatus', e.target.value)}
                fullWidth
              >
                <MenuItem selected value=""></MenuItem>
                <MenuItem value="Single" aria-label={t('Single')}>
                  {t('Single')}
                </MenuItem>
                <MenuItem value="Engaged" aria-label={t('Engaged')}>
                  {t('Engaged')}
                </MenuItem>
                <MenuItem value="Married" aria-label={t('Married')}>
                  {t('Married')}
                </MenuItem>
                <MenuItem value="Separated" aria-label={t('Separated')}>
                  {t('Separated')}
                </MenuItem>
                <MenuItem value="Divorced" aria-label={t('Divorced')}>
                  {t('Divorced')}
                </MenuItem>
                <MenuItem value="Widowed" aria-label={t('Widowed')}>
                  {t('Widowed')}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">{t('Gender')}</InputLabel>
              <Select
                label={t('Gender')}
                labelId="gender-label"
                value={gender ?? ''}
                onChange={(e) => setFieldValue('gender', e.target.value)}
                fullWidth
              >
                <MenuItem selected value=""></MenuItem>
                <MenuItem value="Male" aria-label={t('Male')}>
                  {t('Male')}
                </MenuItem>
                <MenuItem value="Female" aria-label={t('Female')}>
                  {t('Female')}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </ModalSectionContainer>
      {/* Anniversary Section */}
      <ModalSectionContainer>
        <ModalSectionIcon icon={<RingIcon />} />
        <MobileDatePicker<Date, DateTime>
          renderInput={(params) => (
            <TextField
              fullWidth
              helperText="mm/dd/yyyy"
              inputProps={{ 'aria-label': t('Anniversary') }}
              {...params}
            />
          )}
          onChange={(date) => (!date ? null : handleDateChange(date))}
          value={
            anniversaryMonth && anniversaryDay
              ? new Date(
                  anniversaryYear ?? 1900,
                  anniversaryMonth - 1,
                  anniversaryDay,
                )
              : null
          }
          inputFormat="MM/dd/yyyy"
          label={t('Anniversary')}
        />
      </ModalSectionContainer>
      {/* Alma Mater Section */}
      <ModalSectionContainer>
        <ModalSectionIcon icon={<SchoolIcon />} />
        <TextField
          label={t('Alma Mater')}
          value={almaMater}
          onChange={handleChange('almaMater')}
          inputProps={{ 'aria-label': t('Alma Mater') }}
          fullWidth
        />
      </ModalSectionContainer>
      {/* Job Section */}
      <ModalSectionContainer>
        <ModalSectionIcon icon={<BusinessIcon />} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label={t('Employer')}
              value={employer}
              onChange={handleChange('employer')}
              inputProps={{ 'aria-label': t('Employer') }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label={t('Occupation')}
              value={occupation}
              onChange={handleChange('occupation')}
              inputProps={{ 'aria-label': t('Occupation') }}
              fullWidth
            />
          </Grid>
        </Grid>
      </ModalSectionContainer>
      {/* Socials Section */}
      <PersonSocial formikProps={formikProps} />
      {/* Legal First Name & Deceased Section */}
      <ModalSectionContainer>
        <TextField
          label={t('Legal First Name')}
          value={legalFirstName}
          onChange={handleChange('legalFirstName')}
          inputProps={{ 'aria-label': t('Legal First Name') }}
          fullWidth
        />
      </ModalSectionContainer>
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <Grid container item xs={6} alignItems="center">
            <DeceasedLabel
              control={
                <Checkbox
                  checked={!!deceased}
                  onChange={() => setFieldValue('deceased', !deceased)}
                  color="secondary"
                />
              }
              label={t('Deceased')}
            />
          </Grid>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
