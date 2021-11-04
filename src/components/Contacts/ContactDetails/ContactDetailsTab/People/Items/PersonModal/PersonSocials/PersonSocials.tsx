import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import SocialIcon from '@material-ui/icons/Language';
import AddIcon from '@material-ui/icons/Add';
import { FormikProps, FieldArray, getIn } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';

const ContactAddIcon = styled(AddIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ContactAddText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const SocialsTextField = styled(TextField)(
  ({ destroyed }: { destroyed: boolean }) => ({
    textDecoration: destroyed ? 'line-through' : 'none',
  }),
);

const SocialSelect = styled(Select)(
  ({ destroyed }: { destroyed: boolean }) => ({
    textDecoration: destroyed ? 'line-through' : 'none',
  }),
);

interface PersonSocialProps {
  formikProps: FormikProps<PersonUpdateInput | PersonCreateInput>;
}

export const PersonSocial: React.FC<PersonSocialProps> = ({ formikProps }) => {
  const { t } = useTranslation();

  const {
    values: { facebookAccounts, twitterAccounts, linkedinAccounts, websites },
    setFieldValue,
    errors,
  } = formikProps;

  return (
    <>
      <FieldArray
        name="facebookAccounts"
        render={() => (
          <>
            {facebookAccounts?.map((account, index) => (
              <ModalSectionContainer key={index}>
                {index === 0 ? (
                  <ModalSectionIcon icon={<SocialIcon />} />
                ) : null}
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
                      <InputLabel id="social-type-label">
                        {t('Type')}
                      </InputLabel>
                      <SocialSelect
                        destroyed={account.destroy ?? false}
                        labelId="social-type-label"
                        value={'facebook'}
                        disabled={!!account.destroy}
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
            ))}
          </>
        )}
      />
      <FieldArray
        name="twitterAccounts"
        render={() => (
          <>
            {twitterAccounts?.map((account, index) => (
              <ModalSectionContainer key={index}>
                {index === 0 ? (
                  <ModalSectionIcon icon={<SocialIcon />} />
                ) : null}
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
                      <InputLabel id="social-type-label">
                        {t('Type')}
                      </InputLabel>
                      <SocialSelect
                        destroyed={account.destroy ?? false}
                        labelId="social-type-label"
                        value={'twitter'}
                        disabled={!!account.destroy}
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
            ))}
          </>
        )}
      />
      <FieldArray
        name="linkedinAccounts"
        render={() => (
          <>
            {linkedinAccounts?.map((account, index) => (
              <ModalSectionContainer key={index}>
                {index === 0 ? (
                  <ModalSectionIcon icon={<SocialIcon />} />
                ) : null}
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
                      <InputLabel id="social-type-label">
                        {t('Type')}
                      </InputLabel>
                      <SocialSelect
                        destroyed={account.destroy ?? false}
                        labelId="social-type-label"
                        value={'linkedin'}
                        disabled={!!account.destroy}
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
            ))}
          </>
        )}
      />
      <FieldArray
        name="websites"
        render={() => (
          <>
            {websites?.map((account, index) => (
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
                          destroyed={account.destroy ?? false}
                          labelId="social-type-label"
                          value={'website'}
                          disabled={!!account.destroy}
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
            ))}
          </>
        )}
      />
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <ContactAddIcon />
          <ContactAddText variant="subtitle1">{t('Add Social')}</ContactAddText>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
