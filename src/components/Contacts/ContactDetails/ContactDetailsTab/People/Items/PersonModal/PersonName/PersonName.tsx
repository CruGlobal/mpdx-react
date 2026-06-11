import React, { useRef, useState } from 'react';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Avatar,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormikProps } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { NativePhotoSource, useNativeCamera } from 'src/hooks/useNativeCamera';
import { getAppName } from 'src/lib/getAppName';
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

  const { enqueueSnackbar } = useSnackbar();
  const appName = getAppName();
  const { isNative, getAvatarPhoto } = useNativeCamera();
  const isOnline = useIsOnline();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const handleAvatarClick: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    if (!isNative) {
      // Web/browser path, unchanged: open the hidden file input
      fileRef.current?.click();
      return;
    }
    if (!isOnline) {
      // Avatar upload is online-only — degrade cleanly in the native shell
      enqueueSnackbar(t('Cannot change the photo while offline.'), {
        variant: 'warning',
      });
      return;
    }
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const handleNativePhoto = async (source: NativePhotoSource) => {
    setMenuAnchorEl(null);
    const result = await getAvatarPhoto(source);
    switch (result.outcome) {
      case 'success':
        // Existing pipeline: validate, preview, upload on save
        setAvatar(result.file);
        break;
      case 'canceled':
        // Backing out of the camera/picker is not an error
        break;
      case 'permission-denied':
        enqueueSnackbar(
          result.source === 'camera'
            ? t(
                '{{appName}} does not have permission to use the camera. Enable camera access for {{appName}} in your device settings and try again.',
                { appName },
              )
            : t(
                '{{appName}} does not have permission to access your photos. Enable photo access for {{appName}} in your device settings and try again.',
                { appName },
              ),
          { variant: 'error' },
        );
        break;
      case 'error':
        enqueueSnackbar(t('Failed to get the photo. Please try again.'), {
          variant: 'error',
        });
        break;
    }
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
          <StyledIconButton
            id="person-avatar-photo-button"
            onClick={handleAvatarClick}
            aria-label={t('Change photo')}
            // The menu only exists in the native shell; on the web the
            // button opens the hidden file input instead
            aria-haspopup={isNative ? 'menu' : undefined}
            aria-expanded={isNative ? Boolean(menuAnchorEl) : undefined}
            aria-controls={
              menuAnchorEl ? 'person-avatar-photo-menu' : undefined
            }
          >
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
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              id: 'person-avatar-photo-menu',
              'aria-labelledby': 'person-avatar-photo-button',
            }}
          >
            <MenuItem onClick={() => handleNativePhoto('camera')}>
              <ListItemIcon>
                <PhotoCameraOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('Take Photo')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNativePhoto('photos')}>
              <ListItemIcon>
                <PhotoLibraryOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('Choose from Library')}</ListItemText>
            </MenuItem>
          </Menu>
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
              label={t('Last Name')}
              value={lastName}
              onChange={handleChange('lastName')}
              inputProps={{ 'aria-label': t('Last Name') }}
              fullWidth
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
