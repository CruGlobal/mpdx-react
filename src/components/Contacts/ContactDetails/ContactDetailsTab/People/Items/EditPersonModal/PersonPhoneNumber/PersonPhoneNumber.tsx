import {
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

interface PersonPhoneNumberProps {
  person: ContactDetailsTabQuery['contact']['people']['nodes'][0];
}

export const PersonPhoneNumber: React.FC<PersonPhoneNumberProps> = ({
  person,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      {person.phoneNumbers.nodes.length > 0 ? (
        <>
          <ModalSectionContainer>
            <BookmarkIcon className={classes.leftIcon} />
            <FormControl fullWidth={true}>
              <ContactPrimaryPersonSelectLabel id="primary-phone-number-label">
                {t('Primary Phone')}
              </ContactPrimaryPersonSelectLabel>
              <Select
                id="primary-phone-number-label"
                value={person.primaryPhoneNumber?.number}
              >
                {person.phoneNumbers.nodes.map((phoneNumber) => (
                  <MenuItem key={phoneNumber.id} value={phoneNumber.number}>
                    {phoneNumber.number}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ModalSectionContainer>
          {person.phoneNumbers.nodes.map((phoneNumber) => (
            <ModalSectionContainer key={phoneNumber.id}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <ContactInputField value={phoneNumber.number} fullWidth />
                </Grid>
                <Grid item xs={6}>
                  <Select value={'Mobile'} fullWidth>
                    <MenuItem value="Mobile">{t('Mobile')}</MenuItem>
                  </Select>
                </Grid>
                <ModalSectionDeleteIcon />
              </Grid>
            </ModalSectionContainer>
          ))}
        </>
      ) : null}
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <ContactAddIcon />
          <ContactAddText variant="subtitle1">{t('Add Phone')}</ContactAddText>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
