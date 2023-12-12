import React, { useRef } from 'react';
import { Avatar, Box, Grid, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { ContactDetailsTabQuery } from '../../../../ContactDetailsTab.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { NewSocial } from '../PersonModal';

const ContactAvatar = styled(Avatar)(() => ({
  position: 'absolute',
  top: '50%',
  left: 4,
  transform: 'translateY(-50%)',
  cursor: 'pointer',
  zIndex: 1,
  width: '34px',
  height: '34px',
}));

interface PersonNameProps {
  person?: ContactDetailsTabQuery['contact']['people']['nodes'][0];
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
  pendingAvatar?: string; // the URL to an uploaded avatar that has not been saved yet
  setAvatar: (avatar: File) => void;
}

export const PersonName: React.FC<PersonNameProps> = ({
  person,
  formikProps,
  pendingAvatar,
  setAvatar,
}) => {
  const { t } = useTranslation();
  const {
    values: { firstName, lastName, title, suffix },
    handleChange,
    errors,
  } = formikProps;

  const fileRef = useRef<HTMLInputElement>(null);
  const handleFileClick = () => {
    fileRef.current?.click();
  };
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const personId = person?.id;
    const file = event.target.files?.[0];
    if (personId && file) {
      setAvatar(file);
    }
  };

  return (
    <>
      {person ? (
        <ModalSectionContainer>
          <ContactAvatar
            alt={`${person.firstName} ${person.lastName}`}
            src={pendingAvatar ?? person.avatar}
            onClick={() => handleFileClick()}
          />
          <input
            data-testid="PersonNameUpload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileRef}
            onChange={handleFileChange}
          />
          <Typography>
            <Box
              component="span"
              fontWeight="bold"
            >{`${person.firstName} ${person.lastName}`}</Box>
          </Typography>
          <ModalSectionDeleteIcon />
        </ModalSectionContainer>
      ) : null}
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
