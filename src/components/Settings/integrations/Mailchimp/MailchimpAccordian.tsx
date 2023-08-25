import { useState, useContext, useEffect, useMemo, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/material/styles';
import * as Types from '../../../../../graphql/types.generated';
import {
  Box,
  Typography,
  Skeleton,
  Alert,
  Button,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  useGetMailchimpAccountQuery,
  useUpdateMailchimpAccountMutation,
  GetMailchimpAccountDocument,
  GetMailchimpAccountQuery,
  useSyncMailchimpAccountMutation,
  useDeleteMailchimpAccountMutation,
} from './MailchimpAccount.generated';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import {
  StyledListItem,
  StyledList,
  StyledServicesButton,
  IntegrationsContext,
  IntegrationsContextType,
} from 'pages/accountLists/[accountListId]/settings/integrations.page';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface MailchimpAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  flex: '0 1 50%',
  margin: '0 0 0 -11px',
}));

const StyledButton = styled(Button)(() => ({
  marginLeft: '15px',
}));

export const MailchimpAccordian: React.FC<MailchimpAccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const [oAuth, setOAuth] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { apiToken } = useContext(
    IntegrationsContext,
  ) as IntegrationsContextType;
  const accountListId = useAccountListId();
  const [updateMailchimpAccount] = useUpdateMailchimpAccountMutation();
  const [syncMailchimpAccount] = useSyncMailchimpAccountMutation();
  const [deleteMailchimpAccount] = useDeleteMailchimpAccountMutation();
  const {
    data,
    loading,
    refetch: refetchGetMailchimpAccount,
  } = useGetMailchimpAccountQuery({
    variables: {
      input: {
        accountListId: accountListId ?? '',
      },
    },
    skip: !accountListId,
  });

  const mailchimpAccount = data?.getMailchimpAccount[0];

  useEffect(() => {
    setOAuth(
      `${
        process.env.OAUTH_URL
      }/auth/user/mailchimp?account_list_id=${accountListId}&redirect_to=${window.encodeURIComponent(
        `${window.location.origin}/accountLists/${accountListId}/settings/integrations?selectedTab=mailchimp`,
      )}&access_token=${apiToken}`,
    );
  }, []);

  const MailchimpSchema: yup.SchemaOf<
    Pick<Types.MailchimpAccount, 'autoLogCampaigns' | 'primaryListId'>
  > = yup.object({
    autoLogCampaigns: yup.boolean().required(),
    primaryListId: yup.string().required(),
  });

  const onSubmit = async (
    attributes: Pick<
      Types.MailchimpAccount,
      'autoLogCampaigns' | 'primaryListId'
    >,
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
          query: GetMailchimpAccountDocument,
          variables: {
            accountListId,
          },
        };
        const dataFromCache = cache.readQuery<GetMailchimpAccountQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            ...attributes,
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });
    setShowSettings(false);
    enqueueSnackbar(
      t(
        'Your MailChimp sync has been started. This process may take up to 4 hours to complete.',
      ),
      {
        variant: 'success',
      },
    );
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
        'Your MailChimp sync has been started. This process may take up to 4 hours to complete.',
      ),
      {
        variant: 'success',
      },
    );
  };
  const handleShowSettings = () => setShowSettings(true);

  const handleDisconnect = async () => {
    await deleteMailchimpAccount({
      variables: {
        input: {
          accountListId: accountListId ?? '',
        },
      },
      update: () => refetchGetMailchimpAccount(),
    });
    enqueueSnackbar(t('MPDX removed your integration with MailChimp'), {
      variant: 'success',
    });
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
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={t('MailChimp')}
      value={''}
      image={
        <img
          src="https://mpdx.org/122cd92a3b2a7fadaf77541750e172aa.svg"
          alt="MailChimp"
        />
      }
    >
      {loading && <Skeleton height="90px" />}
      {!loading && !mailchimpAccount && (
        <>
          <StyledFormLabel>MailChimp Overview</StyledFormLabel>
          <Typography>
            MailChimp makes keeping in touch with your ministry partners easy
            and streamlined. Here’s how it works:
          </Typography>
          <StyledList sx={{ listStyleType: 'number' }}>
            <StyledListItem>
              If you have an existing MailChimp list you’d like to use, Great!
              Or, create a new one for your MPDX connection.
            </StyledListItem>
            <StyledListItem>
              Select your MPDX MailChimp list to stream your MPDX contacts into.
            </StyledListItem>
          </StyledList>
          <Typography>
            That&apos;s it! Set it and leave it! Now your MailChimp list is
            continuously up to date with your MPDX Contacts. That&apos;s just
            the surface. Click over to the MPDX Help site for more in-depth
            details.
          </Typography>
          <StyledServicesButton variant="outlined" href={oAuth}>
            {t('Connect MailChimp')}
          </StyledServicesButton>
        </>
      )}
      {!loading &&
        ((mailchimpAccount?.validateKey && !mailchimpAccount?.valid) ||
          showSettings) && (
          <Box>
            <Alert severity="warning" style={{ marginBottom: '20px' }}>
              {t('Please choose a list to sync with MailChimp.')}
            </Alert>

            {mailchimpAccount?.listsPresent && (
              <Formik
                initialValues={{
                  primaryListId: mailchimpAccount.primaryListId,
                  autoLogCampaigns: mailchimpAccount.autoLogCampaigns,
                }}
                validationSchema={MailchimpSchema}
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
                          'Automatically log sent MailChimp campaigns in contact task history',
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
                    'You need to create a list on Mail Chimp that MPDX can use for your newsletter.',
                  )}
                </Typography>
                {mailchimpAccount?.listsLink && (
                  <Button href={mailchimpAccount.listsLink} target="_blank">
                    {t('Go to MailChimp to create a list.')}
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
              {t('Your contacts are now automatically syncing with MailChimp')}
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
                  primary={t('MailChimp list to use for your newsletter:')}
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
    </AccordionItem>
  );
};
