import { Avatar, Box, Grid, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormikProps } from 'formik';
import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { ContactDetailsTabQuery } from '../../../../ContactDetailsTab.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { NewSocial } from '../PersonModal';

const ContactAvatar = styled(Avatar)(() => ({
  position: 'absolute',
  top: '50%',
  left: 4,
  transform: 'translateY(-50%)',
  width: '34px',
  height: '34px',
}));

interface PersonNameProps {
  person?: ContactDetailsTabQuery['contact']['people']['nodes'][0];
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
}

export const PersonName: React.FC<PersonNameProps> = ({
  person,
  formikProps,
}) => {
  const { t } = useTranslation();
  const {
    values: { firstName, lastName, title, suffix },
    handleChange,
    errors,
  } = formikProps;
  return (
    <>
      <ModalSectionContainer>
        {person ? (
          <>
            <ContactAvatar
              alt={`${person.firstName} ${person.lastName}`}
              src={person?.lastName ?? ''}
            />
            <Typography>
              <Box
                component="span"
                fontWeight="fontWeightBold"
              >{`${person.firstName} ${person.lastName}`}</Box>
            </Typography>
            <ModalSectionDeleteIcon />
          </>
        ) : null}
      </ModalSectionContainer>
      <ModalSectionContainer>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label={t('First Name')}
              value={firstName}
              onChange={handleChange('firstName')}
              inputProps={{ 'aria-label': t('First Name') }}
              error={!!errors.firstName}
              helperText={errors.firstName && t('First Name is required')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label={t('Last Name')}
              value={lastName}
              onChange={handleChange('lastName')}
              inputProps={{ 'aria-label': t('Last Name') }}
              error={!!errors.lastName}
              helperText={errors.lastName && t('Last Name is required')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label={t('Title')}
              value={title}
              onChange={handleChange('title')}
              inputProps={{ 'aria-label': t('Title') }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label={t('Suffix')}
              value={suffix}
              onChange={handleChange('suffix')}
              inputProps={{ 'aria-label': t('Suffix') }}
              fullWidth
            />
          </Grid>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
