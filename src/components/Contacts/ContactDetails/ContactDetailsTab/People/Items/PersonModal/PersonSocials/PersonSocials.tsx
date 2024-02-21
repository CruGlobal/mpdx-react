import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import Facebook from '@mui/icons-material/Facebook';
import SocialIcon from '@mui/icons-material/Language';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Twitter from '@mui/icons-material/Twitter';
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FieldArray, FormikProps, getIn } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import { NewSocial } from '../PersonModal';

const ContactAddIcon = styled(AddIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ContactAddText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const SocialsTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

const SocialSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

interface PersonSocialProps {
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
}

export const PersonSocial: React.FC<PersonSocialProps> = ({ formikProps }) => {
  const { t } = useTranslation();

  const {
    values: {
      facebookAccounts,
      twitterAccounts,
      linkedinAccounts,
      websites,
      newSocials,
    },
    setFieldValue,
    errors,
  } = formikProps;

  return (
    <>
      <FieldArray
        name="facebookAccounts"
        render={() =>
          facebookAccounts?.map((account, index) => (
            <ModalSectionContainer key={index}>
              {index === 0 ? <ModalSectionIcon icon={<Facebook />} /> : null}
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <SocialsTextField
                    destroyed={account.destroy ?? false}
                    label={t('Username/URL')}
                    value={account.username}
                    onChange={(event) =>
                      setFieldValue(
                        `facebookAccounts.${index}.username`,
                        event.target.value,
                      )
                    }
                    inputProps={{ 'aria-label': t('Facebook Account') }}
                    disabled={!!account.destroy}
                    error={getIn(errors, `facebookAccounts.${index}`)}
                    helperText={
                      getIn(errors, `facebookAccounts.${index}`) &&
                      t('Field is required')
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="social-type-label">{t('Type')}</InputLabel>
                    <SocialSelect
                      label={t('Type')}
                      destroyed={account.destroy ?? false}
                      labelId="social-type-label"
                      value={'facebook'}
                      disabled
                      fullWidth
                      readOnly
                    >
                      <MenuItem value={'facebook'}>{t('Facebook')}</MenuItem>
                    </SocialSelect>
                  </FormControl>
                  <ModalSectionDeleteIcon
                    handleClick={() =>
                      setFieldValue(
                        `facebookAccounts.${index}.destroy`,
                        !account.destroy,
                      )
                    }
                  />
                </Grid>
              </Grid>
            </ModalSectionContainer>
          ))
        }
      />
      <FieldArray
        name="twitterAccounts"
        render={() =>
          twitterAccounts?.map((account, index) => (
            <ModalSectionContainer key={index}>
              {index === 0 ? <ModalSectionIcon icon={<Twitter />} /> : null}
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <SocialsTextField
                    destroyed={account.destroy ?? false}
                    label={t('Username/URL')}
                    value={account.screenName}
                    onChange={(event) =>
                      setFieldValue(
                        `twitterAccounts.${index}.screenName`,
                        event.target.value,
                      )
                    }
                    inputProps={{ 'aria-label': t('Twitter Account') }}
                    disabled={!!account.destroy}
                    error={getIn(errors, `twitterAccounts.${index}`)}
                    helperText={
                      getIn(errors, `twitterAccounts.${index}`) &&
                      t('Field is required')
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="social-type-label">{t('Type')}</InputLabel>
                    <SocialSelect
                      label={t('Type')}
                      destroyed={account.destroy ?? false}
                      labelId="social-type-label"
                      value={'twitter'}
                      disabled
                      fullWidth
                      readOnly
                    >
                      <MenuItem value={'twitter'}>{t('Twitter')}</MenuItem>
                    </SocialSelect>
                  </FormControl>
                  <ModalSectionDeleteIcon
                    handleClick={() =>
                      setFieldValue(
                        `twitterAccounts.${index}.destroy`,
                        !account.destroy,
                      )
                    }
                  />
                </Grid>
              </Grid>
            </ModalSectionContainer>
          ))
        }
      />
      <FieldArray
        name="linkedinAccounts"
        render={() =>
          linkedinAccounts?.map((account, index) => (
            <ModalSectionContainer key={index}>
              {index === 0 ? <ModalSectionIcon icon={<LinkedIn />} /> : null}
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <SocialsTextField
                    destroyed={account.destroy ?? false}
                    label={t('Username/URL')}
                    value={account.publicUrl}
                    onChange={(event) =>
                      setFieldValue(
                        `linkedinAccounts.${index}.publicUrl`,
                        event.target.value,
                      )
                    }
                    inputProps={{ 'aria-label': t('LinkedIn Account') }}
                    disabled={!!account.destroy}
                    error={getIn(errors, `linkedinAccounts.${index}`)}
                    helperText={
                      getIn(errors, `linkedinAccounts.${index}`) &&
                      t('Field is required')
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="social-type-label">{t('Type')}</InputLabel>
                    <SocialSelect
                      label={t('Type')}
                      destroyed={account.destroy ?? false}
                      labelId="social-type-label"
                      value={'linkedin'}
                      disabled
                      fullWidth
                      readOnly
                    >
                      <MenuItem value={'linkedin'}>{t('LinkedIn')}</MenuItem>
                    </SocialSelect>
                  </FormControl>
                  <ModalSectionDeleteIcon
                    handleClick={() =>
                      setFieldValue(
                        `linkedinAccounts.${index}.destroy`,
                        !account.destroy,
                      )
                    }
                  />
                </Grid>
              </Grid>
            </ModalSectionContainer>
          ))
        }
      />
      <FieldArray
        name="websites"
        render={() =>
          websites?.map((account, index) => (
            <>
              {account.destroy ? <ModalSectionDeleteIcon /> : null}
              <ModalSectionContainer key={index}>
                {index === 0 ? (
                  <ModalSectionIcon icon={<SocialIcon />} />
                ) : null}
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <SocialsTextField
                      destroyed={account.destroy ?? false}
                      label={t('Username/URL')}
                      value={account.url}
                      onChange={(event) =>
                        setFieldValue(
                          `websites.${index}.url`,
                          event.target.value,
                        )
                      }
                      inputProps={{ 'aria-label': t('Website') }}
                      error={getIn(errors, `websites.${index}`)}
                      helperText={
                        getIn(errors, `websites.${index}`) &&
                        t('Field is required')
                      }
                      disabled={!!account.destroy}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="social-type-label">
                        {t('Type')}
                      </InputLabel>
                      <SocialSelect
                        label={t('Type')}
                        destroyed={account.destroy ?? false}
                        labelId="social-type-label"
                        value={'website'}
                        disabled
                        fullWidth
                        readOnly
                      >
                        <MenuItem value={'website'}>{t('Website')}</MenuItem>
                      </SocialSelect>
                    </FormControl>
                    <ModalSectionDeleteIcon
                      handleClick={() =>
                        setFieldValue(
                          `websites.${index}.destroy`,
                          !account.destroy,
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </ModalSectionContainer>
            </>
          ))
        }
      />
      <FieldArray
        name="newSocials"
        render={({ push }) => (
          <>
            {newSocials?.map((social, index) => (
              <>
                {social.destroy ? <ModalSectionDeleteIcon /> : null}
                <ModalSectionContainer key={index}>
                  {index === 0 ? (
                    <ModalSectionIcon icon={<SocialIcon />} />
                  ) : null}
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <SocialsTextField
                        destroyed={social.destroy ?? false}
                        label={t('Username/URL')}
                        value={social.value}
                        onChange={(event) =>
                          setFieldValue(
                            `newSocials.${index}.value`,
                            event.target.value,
                          )
                        }
                        inputProps={{ 'aria-label': t('New Social') }}
                        error={getIn(errors, `newSocials.${index}`)}
                        helperText={
                          getIn(errors, `newSocials.${index}`) &&
                          t('Field is required')
                        }
                        disabled={!!social.destroy}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel id="social-type-label">
                          {t('Type')}
                        </InputLabel>
                        <SocialSelect
                          label={t('Type')}
                          destroyed={social.destroy ?? false}
                          labelId="social-type-label"
                          value={social.type}
                          disabled={!!social.destroy}
                          fullWidth
                          onChange={(event) =>
                            setFieldValue(
                              `newSocials.${index}.type`,
                              event.target.value,
                            )
                          }
                        >
                          <MenuItem value={'facebook'}>
                            {t('Facebook')}
                          </MenuItem>
                          <MenuItem value={'twitter'}>{t('Twitter')}</MenuItem>
                          <MenuItem value={'linkedin'}>
                            {t('LinkedIn')}
                          </MenuItem>
                          <MenuItem value={'website'}>{t('Website')}</MenuItem>
                        </SocialSelect>
                      </FormControl>
                      <ModalSectionDeleteIcon
                        handleClick={() => {
                          const temp = newSocials;
                          temp.splice(index, 1);
                          setFieldValue('newSocials', temp);
                        }}
                      />
                    </Grid>
                  </Grid>
                </ModalSectionContainer>
              </>
            ))}
            <ModalSectionContainer>
              <Grid container alignItems="center">
                <Button>
                  <ContactAddIcon />
                  <ContactAddText
                    variant="subtitle1"
                    aria-label={t('Add Social')}
                    onClick={() =>
                      push({ value: '', type: '', destroy: false })
                    }
                  >
                    {t('Add Social')}
                  </ContactAddText>
                </Button>
              </Grid>
            </ModalSectionContainer>
          </>
        )}
      />
    </>
  );
};
