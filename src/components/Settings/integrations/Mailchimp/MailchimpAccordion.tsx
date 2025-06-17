import { ReactElement, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { IntegrationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { MailchimpAccount } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  AccordionProps,
  StyledList,
  StyledListItem,
  StyledServicesButton,
} from '../integrationsHelper';
import { useOauthUrl } from '../useOauthUrl';
import {
  MailchimpAccountDocument,
  MailchimpAccountQuery,
  useMailchimpAccountQuery,
  useSyncMailchimpAccountMutation,
  useUpdateMailchimpAccountMutation,
} from './MailchimpAccount.generated';
import { DeleteMailchimpAccountModal } from './Modals/DeleteMailchimpModal';

const mailchimpSchema: yup.ObjectSchema<
  Pick<MailchimpAccount, 'autoLogCampaigns' | 'primaryListId'>
> = yup.object({
  autoLogCampaigns: yup.boolean().required(),
  primaryListId: yup.string().required(),
});

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  flex: '0 1 50%',
  margin: '0 0 0 -11px',
}));

const StyledButton = styled(Button)(() => ({
  marginLeft: '15px',
}));

export const MailchimpAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  disabled,
}) => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const { getMailChimpOauthUrl: getOauthUrl } = useOauthUrl();
  const accountListId = useAccountListId();
  const [updateMailchimpAccount] = useUpdateMailchimpAccountMutation();
  const [syncMailchimpAccount] = useSyncMailchimpAccountMutation();
  const {
    data,
    loading,
    refetch: refetchMailchimpAccount,
  } = useMailchimpAccountQuery({
    variables: {
      input: {
        accountListId: accountListId ?? '',
      },
    },
    skip: !accountListId,
  });

  const mailchimpAccount = data?.mailchimpAccount
    ? data.mailchimpAccount[0]
    : null;

  const onSubmit = async (
    attributes: Pick<MailchimpAccount, 'autoLogCampaigns' | 'primaryListId'>,
  ) => {
    await updateMailchimpAccount({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          mailchimpAccount: attributes,
          mailchimpAccountId: mailchimpAccount?.id ?? '',
        },
      },
      update: (cache) => {
        const query = {
          query: MailchimpAccountDocument,
          variables: {
            accountListId,
          },
        };
        const dataFromCache = cache.readQuery<MailchimpAccountQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            ...attributes,
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(
            'Your Mailchimp sync has been started. This process may take up to 4 hours to complete.',
          ),
          {
            variant: 'success',
          },
        );
      },
    });
    setShowSettings(false);
  };

  const handleSync = async () => {
    await syncMailchimpAccount({
      variables: {
        input: {
          accountListId: accountListId ?? '',
        },
      },
    });
    enqueueSnackbar(
      t(
        'Your Mailchimp sync has been started. This process may take up to 4 hours to complete.',
      ),
      {
        variant: 'success',
      },
    );
  };
  const handleShowSettings = () => setShowSettings(true);

  const handleDisconnect = async () => setShowDeleteModal(true);

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
  };

  const availableNewsletterLists = useMemo(() => {
    return (
      mailchimpAccount?.listsAvailableForNewsletters?.filter(
        (list) => !!list?.id,
      ) ?? []
    );
  }, [mailchimpAccount]);

  return (
    <AccordionItem
      accordion={IntegrationAccordion.Mailchimp}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={t('MailChimp')}
      value={''}
      disabled={disabled}
      image={
        <img
          src="/images/settings-preferences-integrations-mailchimp.svg"
          alt="MailChimp"
        />
      }
    >
      {loading && <Skeleton height="90px" />}
      {!loading && !mailchimpAccount && (
        <>
          <StyledFormLabel>{t('Mailchimp Overview')}</StyledFormLabel>
          <Typography>
            {t(`Mailchimp makes keeping in touch with your ministry partners easy
            and streamlined. Here's how it works:`)}
          </Typography>
          <StyledList sx={{ listStyleType: 'number' }}>
            <StyledListItem>
              {t(
                `If you have an existing Mailchimp list you'd like to use, Great!
              Or, create a new one for your {{appName}} connection.`,
                {
                  appName,
                },
              )}
            </StyledListItem>
            <StyledListItem>
              {t(
                'Select your {{appName}} Mailchimp list to stream your {{appName}} contacts into.',
                {
                  appName,
                },
              )}
            </StyledListItem>
          </StyledList>
          <Typography>
            {t(
              `That's it! Set it and leave it! Now your Mailchimp list is
            continuously up to date with your {{appName}} Contacts. That's just
            the surface. Click over to the {{appName}} Help site for more in-depth
            details.`,
              {
                appName,
              },
            )}
          </Typography>
          <StyledServicesButton variant="contained" href={getOauthUrl()}>
            {t('Connect Mailchimp')}
          </StyledServicesButton>
        </>
      )}
      {!loading &&
        ((mailchimpAccount?.validateKey && !mailchimpAccount?.valid) ||
          showSettings) && (
          <Box>
            <Alert severity="warning" style={{ marginBottom: '20px' }}>
              {t('Please choose a list to sync with Mailchimp.')}
            </Alert>

            {mailchimpAccount?.listsPresent && (
              <Formik
                initialValues={{
                  primaryListId: mailchimpAccount.primaryListId,
                  autoLogCampaigns: mailchimpAccount.autoLogCampaigns,
                }}
                validationSchema={mailchimpSchema}
                onSubmit={onSubmit}
              >
                {({
                  values: { primaryListId, autoLogCampaigns },
                  handleSubmit,
                  setFieldValue,
                  handleChange,
                  isSubmitting,
                  isValid,
                  errors,
                }): ReactElement => (
                  <form onSubmit={handleSubmit}>
                    <Box>
                      <Typography>
                        {t('Pick a list to use for your newsletter')}
                      </Typography>
                      <Select
                        value={primaryListId}
                        onChange={(e) =>
                          setFieldValue('primaryListId', e.target.value)
                        }
                        style={{
                          width: '100%',
                          marginBottom: '15px',
                        }}
                      >
                        {availableNewsletterLists.map((list) => (
                          <MenuItem key={list?.id} value={list?.id}>
                            {list?.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.primaryListId && (
                        <FormHelperText error={true}>
                          {t('This field is required')}
                        </FormHelperText>
                      )}
                      <StyledFormControlLabel
                        control={
                          <Checkbox
                            data-testid="autoLogCampaigns"
                            name="autoLogCampaigns"
                            checked={autoLogCampaigns}
                            onChange={handleChange}
                          />
                        }
                        label={t(
                          'Automatically log sent Mailchimp campaigns in contact task history',
                        )}
                      />

                      <Box>
                        <SubmitButton
                          disabled={!isValid || isSubmitting}
                          variant="contained"
                        >
                          {t('Save')}
                        </SubmitButton>

                        <StyledButton
                          disabled={isSubmitting}
                          onClick={handleDisconnect}
                          variant="text"
                          color="error"
                        >
                          {t('Disconnect')}
                        </StyledButton>
                      </Box>
                    </Box>
                  </form>
                )}
              </Formik>
            )}

            {!mailchimpAccount?.listsPresent && (
              <Box>
                <Typography>
                  {t(
                    'You need to create a list on Mailchimp that {{appName}} can use for your newsletter.',
                    {
                      appName,
                    },
                  )}
                </Typography>
                {mailchimpAccount?.listsLink && (
                  <Button href={mailchimpAccount.listsLink} target="_blank">
                    {t('Go to Mailchimp to create a list.')}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}

      {!loading &&
        mailchimpAccount?.validateKey &&
        mailchimpAccount?.valid &&
        !showSettings && (
          <Box>
            <Alert severity="success" style={{ marginBottom: '20px' }}>
              {t(
                `Your contacts are now automatically syncing with Mailchimp. Changes 
                to Mailchimp contacts and tags should only be done in {{appName}}.`,
                { appName },
              )}
            </Alert>

            <List
              sx={{
                width: '100%',
                maxWidth: 360,
                bgcolor: 'background.paper',
              }}
            >
              <ListItem>
                <ListItemText
                  primary={t('Mailchimp list to use for your newsletter:')}
                  secondary={mailchimpAccount?.primaryListName}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('Automatic logging of campaigns:')}
                  secondary={
                    mailchimpAccount?.autoLogCampaigns ? t('On') : t('Off')
                  }
                />
              </ListItem>
            </List>

            <Button onClick={handleSync} variant="contained">
              {t('Sync Now')}
            </Button>
            <StyledButton onClick={handleShowSettings} variant="outlined">
              {t('Modify Settings')}
            </StyledButton>
            <StyledButton
              onClick={handleDisconnect}
              variant="text"
              color="error"
            >
              {t('Disconnect')}
            </StyledButton>
          </Box>
        )}
      {!loading && mailchimpAccount && !mailchimpAccount?.validateKey && (
        <Box>
          <Alert severity="error">
            {t(
              'There is an error with your Mailchimp connection. Please disconnect and reconnect to Mailchimp.',
            )}
          </Alert>
          <StyledServicesButton
            onClick={handleDisconnect}
            variant="outlined"
            color="error"
          >
            {t('Disconnect')}
          </StyledServicesButton>
        </Box>
      )}
      {showDeleteModal && (
        <DeleteMailchimpAccountModal
          accountListId={accountListId || ''}
          handleClose={handleDeleteModalClose}
          refetchMailchimpAccount={refetchMailchimpAccount}
          appName={appName || ''}
        />
      )}
    </AccordionItem>
  );
};
