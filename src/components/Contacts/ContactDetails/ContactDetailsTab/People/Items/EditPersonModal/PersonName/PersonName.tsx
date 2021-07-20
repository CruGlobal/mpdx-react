import {
  Avatar,
  Box,
  Grid,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import React from 'react';

import { useTranslation } from 'react-i18next';
import { ContactDetailsTabQuery } from '../../../../ContactDetailsTab.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';

const ContactAvatar = styled(Avatar)(() => ({
  position: 'absolute',
  top: '50%',
  left: 4,
  transform: 'translateY(-50%)',
  width: '34px',
  height: '34px',
}));

const ContactInputField = styled(TextField)(() => ({
  '&& > label': {
    textTransform: 'uppercase',
  },
}));

interface PersonNameProps {
  person: ContactDetailsTabQuery['contact']['people']['nodes'][0];
}

export const PersonName: React.FC<PersonNameProps> = ({ person }) => {
  const { t } = useTranslation();
  return (
    <>
      <ModalSectionContainer>
        <ContactAvatar
          alt={`${person.firstName} ${person.lastName}`}
          src={person.lastName ?? ''}
        />
        <Typography>
          <Box fontWeight="fontWeightBold">{`${person.firstName} ${person.lastName}`}</Box>
        </Typography>
        <ModalSectionDeleteIcon />
      </ModalSectionContainer>
      <ModalSectionContainer>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <ContactInputField
              label={t('First Name')}
              value={person.firstName}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <ContactInputField
              label={t('Last Name')}
              value={person.lastName}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <ContactInputField
              placeholder={t('Title')}
              value={person.title}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <ContactInputField
              placeholder={t('Suffix')}
              value={person.suffix}
              fullWidth
            />
          </Grid>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
