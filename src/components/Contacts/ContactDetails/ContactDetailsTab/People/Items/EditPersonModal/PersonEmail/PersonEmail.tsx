import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  styled,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import React from 'react';

import BookmarkIcon from '@material-ui/icons/Bookmark';
import AddIcon from '@material-ui/icons/Add';
import { useTranslation } from 'react-i18next';
import { ContactDetailsTabQuery } from '../../../../ContactDetailsTab.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';

const useStyles = makeStyles((theme: Theme) => ({
  leftIcon: {
    position: 'absolute',
    top: '50%',
    left: 8,
    transform: 'translateY(-50%)',
    color: theme.palette.cruGrayMedium.main,
  },
}));

const ContactPrimaryPersonSelectLabel = styled(InputLabel)(() => ({
  textTransform: 'uppercase',
}));

const ContactInputField = styled(TextField)(() => ({
  '&& > label': {
    textTransform: 'uppercase',
  },
}));

const ContactAddIcon = styled(AddIcon)(() => ({
  color: '#2196F3',
}));

const ContactAddText = styled(Typography)(() => ({
  color: '#2196F3',
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

interface PersonEmailProps {
  person: ContactDetailsTabQuery['contact']['people']['nodes'][0];
}

export const PersonEmail: React.FC<PersonEmailProps> = ({ person }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      {person.emailAddresses.nodes.length > 0 ? (
        <>
          <ModalSectionContainer>
            <BookmarkIcon className={classes.leftIcon} />
            <FormControl fullWidth={true}>
              <ContactPrimaryPersonSelectLabel id="primary-email-label">
                {t('Primary Email')}
              </ContactPrimaryPersonSelectLabel>
              <Select
                id="primary-email-label"
                value={person.primaryEmailAddress?.email}
              >
                {person.emailAddresses.nodes.map((emailAddress) => (
                  <MenuItem key={emailAddress.id} value={emailAddress.email}>
                    {emailAddress.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ModalSectionContainer>
          {person.emailAddresses.nodes.map((emailAddress) => (
            <>
              <ModalSectionContainer>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <ContactInputField value={emailAddress.email} fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <Select value={'Mobile'} fullWidth>
                      <MenuItem value="Mobile">{t('Mobile')}</MenuItem>
                    </Select>
                  </Grid>
                  <ModalSectionDeleteIcon />
                </Grid>
              </ModalSectionContainer>
            </>
          ))}
        </>
      ) : null}
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <Grid container alignItems="center" item xs={6}>
            <ContactAddIcon />
            <ContactAddText variant="subtitle1">
              {t('Add Email')}
            </ContactAddText>
          </Grid>
          <Grid container item xs={6} alignItems="center">
            <Checkbox checked={person.optoutEnewsletter} />
            <Typography variant="subtitle1">
              {t('Opt-out of Email Newsletter')}
            </Typography>
          </Grid>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
