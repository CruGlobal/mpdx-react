import React, { useState, ReactElement } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import {
  DialogActions,
  Autocomplete,
  TextField,
  Button,
  Typography,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useGetOrganizationsQuery } from './Organizations.generated';
import { showArticle, variables } from 'src/lib/helpScout';
import { Organization } from '../../../../../graphql/types.generated';
import theme from 'src/theme';
import {
  getOrganizationType,
  OrganizationTypesEnum,
} from './OrganizationAccordian';
import { oAuth } from './OrganizationService';

interface OrganizationAddAccountModalProps {
  handleClose: () => void;
}

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

const WarningBox = styled(Box)(() => ({
  padding: '15px',
  background: theme.palette.mpdxYellow.main,
  maxWidth: 'calc(100% - 20px)',
  margin: '10px auto 0',
}));

const StyledTypography = styled(Typography)(() => ({
  marginTop: '10px',
  color: theme.palette.mpdxYellow.dark,
}));

export const OrganizationAddAccountModal: React.FC<
  OrganizationAddAccountModalProps
> = ({ handleClose }) => {
  const { t } = useTranslation();
  const [organizationType, setOrganizationType] =
    useState<OrganizationTypesEnum>();
  const { data: organizations, loading } = useGetOrganizationsQuery();

  const onSubmit = async (attributes) => {
    const { apiClass, oauth, id } = attributes.selectedOrganization;
    const type = getOrganizationType(apiClass, oauth);

    if (type === OrganizationTypesEnum.OAUTH) {
      window.location.href = await oAuth(id);
      return;
    }
    if (type === OrganizationTypesEnum.LOGIN) {
      // TODO - Add GraphQl to Update account by Mutating organization
      return;
    }

    // TODO - Add GraphQl to creating an account by Mutating organization

    handleClose();
    return;
  };

  const showOrganizationHelp = () => {
    showArticle(variables.HS_SETUP_FIND_ORGANIZATION);
  };

  const OrganizationSchema: yup.SchemaOf<{
    selectedOrganization: Pick<
      Organization,
      'id' | 'name' | 'oauth' | 'apiClass' | 'giftAidPercentage'
    >;
    username: string | null | undefined;
    password: string | null | undefined;
  }> = yup.object({
    selectedOrganization: yup
      .object({
        id: yup.string().required(),
        apiClass: yup.string().required(),
        name: yup.string().required(),
        oauth: yup.boolean().required(),
        giftAidPercentage: yup.number().nullable(),
      })
      .required(),
    username: yup
      .string()
      .when('selectedOrganization', (organization, schema) => {
        if (
          getOrganizationType(organization?.apiClass, organization?.oauth) ===
          OrganizationTypesEnum.LOGIN
        ) {
          return schema.required('Must enter username');
        }
        return schema;
      }),
    password: yup
      .string()
      .when('selectedOrganization', (organization, schema) => {
        if (
          getOrganizationType(organization?.apiClass, organization?.oauth) ===
          OrganizationTypesEnum.LOGIN
        ) {
          return schema.required('Must enter password');
        }
        return schema;
      }),
  });

  return (
    <Modal
      isOpen={true}
      title={t('Add Organization Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <Formik
        initialValues={{
          selectedOrganization: undefined,
          username: undefined,
          password: undefined,
        }}
        validationSchema={OrganizationSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { selectedOrganization, username, password },
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <StyledBox>
              <Autocomplete
                autoSelect
                disabled={isSubmitting}
                autoHighlight
                loading={loading}
                value={selectedOrganization}
                onChange={(_, value) => {
                  setOrganizationType(
                    getOrganizationType(value?.apiClass, value?.oauth),
                  );
                  setFieldValue('selectedOrganization', value);
                }}
                options={
                  organizations?.organizations?.map(
                    (organization) => organization,
                  ) || []
                }
                getOptionLabel={(option) =>
                  organizations?.organizations?.find(
                    ({ id }) => String(id) === String(option.id),
                  )?.name ?? ''
                }
                filterSelectedOptions
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={'Organization'}
                    data-testid="multiSelectFilter"
                  />
                )}
              />
            </StyledBox>

            {!selectedOrganization && (
              <Button onClick={showOrganizationHelp}>
                {t("Can't find your organization?")}
              </Button>
            )}

            {organizationType === OrganizationTypesEnum.MINISTRY && (
              <WarningBox>
                <Typography
                  variant="h6"
                  color={theme.palette.mpdxYellow.contrastText}
                >
                  {t('You must log into MPDX with your ministry email')}
                </Typography>
                <StyledTypography>
                  {t(
                    'This organization requires you to log into MPDX with your ministry email to access it.',
                  )}
                  <ol
                    style={{
                      paddingLeft: '15px',
                    }}
                  >
                    <li>
                      {t('First you need to ')}
                      <Link
                        href="https://thekey.me/cas/logout"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t(
                          'click here to log out of your personal Key account',
                        )}
                      </Link>
                    </li>
                    <li>
                      {t('Next, ')}
                      <Link
                        href="https://thekey.me/cas/logout"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('click here to log out of MPDX')}
                      </Link>
                      {t(
                        ' so you can log back in with your offical key account.',
                      )}
                    </li>
                  </ol>
                </StyledTypography>
                <StyledTypography>
                  {t(
                    "If you are already logged in using your ministry account, you'll need to contact your donation services team to request access.",
                  )}
                  {t(
                    "Once this is done you'll need to wait 24 hours for MPDX to sync your data.",
                  )}
                </StyledTypography>
              </WarningBox>
            )}

            {organizationType === OrganizationTypesEnum.OAUTH && (
              <WarningBox>
                <Typography color={theme.palette.mpdxYellow.contrastText}>
                  {t(
                    "You will be taken to your organization's donation services system to grant MPDX permission to access your donation data.",
                  )}
                </Typography>
              </WarningBox>
            )}

            {organizationType === OrganizationTypesEnum.LOGIN && (
              <>
                <StyledBox marginTop={4}>
                  <FieldWrapper>
                    <TextField
                      required
                      id="outlined-required"
                      label={t('Username')}
                      value={username}
                      disabled={isSubmitting}
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus={true}
                      onChange={handleChange('username')}
                    />
                  </FieldWrapper>
                </StyledBox>
                <StyledBox marginTop={2}>
                  <FieldWrapper>
                    <TextField
                      required
                      id="outlined-required"
                      label={t('Password')}
                      type="password"
                      value={password}
                      disabled={isSubmitting}
                      onChange={handleChange('password')}
                    />
                  </FieldWrapper>
                </StyledBox>
              </>
            )}

            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {organizationType !== OrganizationTypesEnum.OAUTH &&
                  t('Add Account')}
                {organizationType === OrganizationTypesEnum.OAUTH &&
                  t('Connect')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
