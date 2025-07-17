import React, { useRef } from 'react';
import UploadIcon from '@mui/icons-material/Upload';
import { Avatar, Grid, IconButton, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { NewSocial, Person } from '../PersonModal';

const StyledIconButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: '50%',
  left: 4,
  transform: 'translateY(-50%)',
  zIndex: 1,
  width: '34px',
  height: '34px',
}));
const StyledAvatarIcon = styled(Avatar)(() => ({
  zIndex: 1,
  position: 'absolute',
  top: '0',
  bottom: '0',
  left: '0',
  right: '0',
  height: '100%',
  width: '100%',
  opacity: '0',
  backgroundColor: 'rgb(0,0,0,0.5)',
  transition: '.3s ease',
  '&:hover': {
    opacity: '100',
  },
}));

interface PersonNameProps {
  person?: Person;
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
    handleBlur,
    touched,
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
    // Please do not remove this line
    // It is essential for the file size validation alert on repeated uploads
    event.target.value = '';
  };

  return (
    <>
      {person && (
        <ModalSectionContainer>
          <StyledIconButton onClick={handleFileClick}>
            <StyledAvatarIcon>
              <UploadIcon />
            </StyledAvatarIcon>
            <Avatar
              sx={{ width: '34px', height: '34px' }}
              alt={`${person.firstName || ''} ${person.lastName || ''}`}
              src={pendingAvatar ?? person.avatar}
            />
          </StyledIconButton>
          <input
            data-testid="PersonNameUpload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileRef}
            onChange={handleFileChange}
          />
          <Typography component="span" fontWeight="bold">
            {`${person.firstName || ''} ${person.lastName || ''}`}
          </Typography>
        </ModalSectionContainer>
      )}
      <ModalSectionContainer>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              label={t('First Name')}
              value={firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              inputProps={{ 'aria-label': t('First Name') }}
              error={touched.firstName && !!errors.firstName}
              helperText={
                touched.firstName &&
                errors.firstName &&
                t('First Name is required')
              }
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="lastName"
              label={t('Last Name')}
              value={lastName}
              onChange={handleChange('lastName')}
              inputProps={{ 'aria-label': t('Last Name') }}
              fullWidth
              onBlur={handleBlur}
              error={touched.lastName && !!errors.lastName}
              helperText={
                touched.lastName &&
                errors.lastName &&
                t('Last Name is required')
              }
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('Title')}
              value={title}
              onChange={handleChange('title')}
              inputProps={{ 'aria-label': t('Title') }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
