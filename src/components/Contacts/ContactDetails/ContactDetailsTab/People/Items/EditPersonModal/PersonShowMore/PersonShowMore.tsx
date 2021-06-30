import React from 'react';
import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';
import SchoolIcon from '@material-ui/icons/School';
import BusinessIcon from '@material-ui/icons/Business';
import { FormikProps } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { RingIcon } from '../../../../../../RingIcon';
import { PersonSocial } from '../PersonSocials/PersonSocials';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import { PersonUpdateInput } from '../../../../../../../../../graphql/types.generated';

interface PersonShowMoreProps {
  formikProps: FormikProps<PersonUpdateInput>;
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
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="relationship-status-label">
                {t('Relationship Status')}
              </InputLabel>
              <Select
                labelId="relationship-status-label"
                value={maritalStatus}
                onChange={handleChange('maritalStatus')}
                fullWidth
              >
                <MenuItem value="Single">{t('Single')}</MenuItem>
                <MenuItem value="Engaged">{t('Engaged')}</MenuItem>
                <MenuItem value="Married">{t('Married')}</MenuItem>
                <MenuItem value="Separated">{t('Separated')}</MenuItem>
                <MenuItem value="Divorced">{t('Divorced')}</MenuItem>
                <MenuItem value="Widowed">{t('Widowed')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">{t('Gender')}</InputLabel>
              <Select
                labelId="gender-label"
                value={gender}
                onChange={handleChange('gender')}
                fullWidth
              >
                <MenuItem value="Male">{t('Male')}</MenuItem>
                <MenuItem value="Female">{t('Female')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </ModalSectionContainer>
      {/* Anniversary Section */}
      <ModalSectionContainer>
        <ModalSectionIcon icon={<RingIcon />} />
        <DatePicker
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
          format="MM/dd/yyyy"
          clearable
          label={t('Anniversary')}
          fullWidth
          helperText="mm/dd/yyyy"
        />
      </ModalSectionContainer>
      {/* Alma Mater Section */}
      <ModalSectionContainer>
        <ModalSectionIcon icon={<SchoolIcon />} />
        <TextField
          label={t('Alma Mater')}
          value={almaMater}
          onChange={handleChange('almaMater')}
          fullWidth
        />
      </ModalSectionContainer>
      {/* Job Section */}
      <ModalSectionContainer>
        <ModalSectionIcon icon={<BusinessIcon />} />
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              label={t('Employer')}
              value={employer}
              onChange={handleChange('employer')}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('Occupation')}
              value={occupation}
              onChange={handleChange('occupation')}
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
          fullWidth
        />
      </ModalSectionContainer>
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <Grid container item xs={6} alignItems="center">
            <Checkbox
              checked={!!deceased}
              onChange={() => setFieldValue('deceased', !deceased)}
            />
            <Typography variant="subtitle1">{t('Deceased')}</Typography>
          </Grid>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
