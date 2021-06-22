import React from 'react';
import { useTranslation } from 'react-i18next';
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
import SocialIcon from '@material-ui/icons/Language';
import AddIcon from '@material-ui/icons/Add';
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

const ContactAddIcon = styled(AddIcon)(() => ({
  color: '#2196F3',
}));

const ContactAddText = styled(Typography)(() => ({
  color: '#2196F3',
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

interface PersonSocialProps {
  person: ContactDetailsTabQuery['contact']['people']['nodes'][0];
}

export const PersonSocial: React.FC<PersonSocialProps> = ({ person }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const socialAccounts = [
    ...person.facebookAccounts.nodes.map((account) => ({
      ...account,
      type: 'facebook',
      name: t('Facebook'),
    })),
    ...person.twitterAccounts.nodes.map((account) => ({
      ...account,
      type: 'twitter',
      name: t('Twitter'),
    })),
    ...person.linkedinAccounts.nodes.map((account) => ({
      ...account,
      type: 'linkedin',
      name: t('LinkedIn'),
    })),
    ...person.websites.nodes.map((account) => ({
      ...account,
      type: 'website',
      name: t('Website'),
    })),
  ];

  return (
    <>
      {socialAccounts.length > 0 ? (
        <>
          {socialAccounts.map((account, index) => (
            <>
              <ModalSectionContainer>
                {index === 0 ? (
                  <SocialIcon className={classes.leftIcon} />
                ) : null}
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TextField
                      label={t('Username/URL')}
                      value={account.value}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="social-type-label">
                        {t('Type')}
                      </InputLabel>
                      <Select
                        labelId="socail-type-label"
                        value={account.type}
                        fullWidth
                        readOnly
                      >
                        <MenuItem value={account.type}>{account.name}</MenuItem>
                      </Select>
                    </FormControl>
                    <ModalSectionDeleteIcon />
                  </Grid>
                </Grid>
              </ModalSectionContainer>
            </>
          ))}
        </>
      ) : (
        <ModalSectionContainer>
          <SocialIcon className={classes.leftIcon} />
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField label={t('Username/URL')} value={null} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="social-type-label">{t('Type')}</InputLabel>
                <Select labelId="socail-type-label" value={null} fullWidth>
                  <MenuItem value={'facebook'}>{t('Facebook')}</MenuItem>
                  <MenuItem value={'twitterk'}>{t('Twitter')}</MenuItem>
                  <MenuItem value={'linkedin'}>{t('LinkedIn')}</MenuItem>
                  <MenuItem value={'website'}>{t('Website')}</MenuItem>
                </Select>
              </FormControl>
              <ModalSectionDeleteIcon />
            </Grid>
          </Grid>
        </ModalSectionContainer>
      )}
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <ContactAddIcon />
          <ContactAddText variant="subtitle1">{t('Add Social')}</ContactAddText>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
