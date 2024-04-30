import { ReactElement, useContext } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  DialogActions,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  OrganizationsContext,
  OrganizationsContextType,
} from 'pages/accountLists/[accountListId]/settings/organizations.page';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { AccordionProps } from '../../accordionHelper';
import {
  OrganizationAdminsDocument,
  OrganizationAdminsQuery,
  OrganizationInvitesDocument,
  OrganizationInvitesQuery,
  useCreateOrganizationInviteMutation,
  useDestroyOrganizationAdminMutation,
  useDestroyOrganizationInviteMutation,
  useOrganizationAdminsQuery,
  useOrganizationInvitesQuery,
} from './ManageOrganizationAccess.generated';

const SharedWithBox = styled(Box)(() => ({
  marginTop: '20px',
}));

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

const StyledListItem = styled(ListItem)(() => ({
  borderRadius: '6px',
  '&:nth-child(even)': {
    background: theme.palette.cruGrayLight.main,
  },
}));

type ImpersonateUserFormType = {
  username: string;
};

const impersonateUserSchema: yup.SchemaOf<ImpersonateUserFormType> = yup.object(
  {
    username: yup.string().email().required(),
  },
);

export const ManageOrganizationAccessAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordionName = t('Manage Organization Access');
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const locale = useLocale();
  const { selectedOrganizationId } = useContext(
    OrganizationsContext,
  ) as OrganizationsContextType;
  const [destroyOrganizationAdmin] = useDestroyOrganizationAdminMutation();
  const [destroyOrganizationInvite] = useDestroyOrganizationInviteMutation();
  const [createOrganizationInvite] = useCreateOrganizationInviteMutation();
  const { data: adminsData } = useOrganizationAdminsQuery({
    variables: {
      input: {
        organizationId: selectedOrganizationId,
      },
    },
    skip: !selectedOrganizationId,
  });
  const { data: invitesData } = useOrganizationInvitesQuery({
    variables: {
      input: {
        organizationId: selectedOrganizationId,
      },
    },
    skip: !selectedOrganizationId,
  });

  const admins = adminsData?.organizationAdmins;
  const invites = invitesData?.organizationInvites;

  const handleSentInvite = async (
    attributes: ImpersonateUserFormType,
    onComplete: () => void,
  ) => {
    await createOrganizationInvite({
      variables: {
        input: {
          organizationId: selectedOrganizationId,
          recipientEmail: attributes.username,
        },
      },
      update: (cache, { data: invitation }) => {
        const query = {
          query: OrganizationInvitesDocument,
          variables: {
            input: {
              organizationId: selectedOrganizationId,
            },
          },
        };
        const dataFromCache = cache.readQuery<OrganizationInvitesQuery>(query);
        if (dataFromCache && invitation) {
          const data = {
            ...dataFromCache,
            organizationInvites: dataFromCache.organizationInvites.concat([
              {
                ...invitation?.createOrganizationInvite,
              },
            ]),
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} sent an invite to {{email}}', {
            email: attributes.username,
            appName,
          }),
          {
            variant: 'success',
          },
        );
        onComplete();
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "{{appName}} couldn't send an invite (check to see if email address is valid)",
            { appName },
          ),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  const handleDeleteAdmin = async (adminId: string) => {
    await destroyOrganizationAdmin({
      variables: {
        input: {
          organizationId: selectedOrganizationId,
          adminId,
        },
      },
      update: (cache) => {
        const query = {
          query: OrganizationAdminsDocument,
          variables: {
            input: {
              organizationId: selectedOrganizationId,
            },
          },
        };
        const dataFromCache = cache.readQuery<OrganizationAdminsQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            organizationAdmins: dataFromCache.organizationAdmins.filter(
              (admin) => admin?.id !== adminId,
            ),
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Removed the admin successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("Couldn't remove the admin"), {
          variant: 'error',
        });
      },
    });
  };
  const handleDeleteInvite = async (inviteId: string) => {
    await destroyOrganizationInvite({
      variables: {
        input: {
          organizationId: selectedOrganizationId,
          inviteId,
        },
      },
      update: (cache) => {
        const query = {
          query: OrganizationInvitesDocument,
          variables: {
            input: {
              organizationId: selectedOrganizationId,
            },
          },
        };
        const dataFromCache = cache.readQuery<OrganizationInvitesQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            organizationInvites: dataFromCache.organizationInvites.filter(
              (invite) => invite?.id !== inviteId,
            ),
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Removed the invite successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("Couldn't remove the invite"), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordionName}
      value={''}
    >
      <Typography>
        {t(`Share this organization with other team members`)}
      </Typography>
      <Alert color="warning">
        {t(
          `If you want to allow another {{appName}} user to have access to this organization, you can share access with them. Make
    sure you have the proper permissions and leadership consensus around this sharing before you do this. You will be
    able to remove access later.`,
          { appName },
        )}
      </Alert>

      {!!admins?.length && (
        <SharedWithBox>
          <Typography>{t(`Organization currently shared with`)}</Typography>
          <List>
            {admins.map(
              (admin, idx) =>
                admin && (
                  <StyledListItem
                    key={`${idx}-admin-${admin.id}`}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={t('Delete Admin')}
                        onClick={() => handleDeleteAdmin(admin.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`${admin.firstName} ${admin.lastName}`}
                    />
                  </StyledListItem>
                ),
            )}
          </List>
        </SharedWithBox>
      )}

      {!!invites?.length && (
        <SharedWithBox>
          <Typography>{t(`Pending Invites`)}</Typography>
          <List>
            {invites.map(
              (invite, idx) =>
                invite && (
                  <StyledListItem
                    key={`${idx}-invite-${invite.id}`}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={t('Delete Invite')}
                        onClick={() => handleDeleteInvite(invite.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={invite.recipientEmail}
                      secondary={t('Invited as {{role}} on {{date}}', {
                        role: invite.inviteUserAs,
                        date: dateFormat(
                          DateTime.fromISO(invite.createdAt ?? ''),
                          locale,
                        ),
                      })}
                    />
                  </StyledListItem>
                ),
            )}
          </List>
        </SharedWithBox>
      )}

      <SharedWithBox>
        <Formik
          initialValues={{
            username: '',
          }}
          onSubmit={(attributes, { resetForm }) =>
            handleSentInvite(attributes, resetForm)
          }
          validationSchema={impersonateUserSchema}
          isInitialValid={false}
        >
          {({
            values: { username },
            handleChange,
            handleSubmit,
            isSubmitting,
            isValid,
            errors,
          }): ReactElement => (
            <form onSubmit={handleSubmit}>
              <h3>{t('Invite someone to administer this organization:')}</h3>
              <StyledBox marginTop={4}>
                <FieldWrapper>
                  <TextField
                    required
                    id="username"
                    name="username"
                    label={t('User Name, ID or Key/Relay Email')}
                    type="email"
                    value={username}
                    disabled={isSubmitting}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={true}
                    onChange={handleChange}
                    inputProps={{
                      'data-testid': 'inviteUsername',
                    }}
                  />
                  {errors.username && (
                    <FormHelperText error={true}>
                      {errors.username}
                    </FormHelperText>
                  )}
                </FieldWrapper>
              </StyledBox>

              <DialogActions>
                <SubmitButton
                  disabled={!isValid || isSubmitting}
                  variant="contained"
                >
                  {t('Send Invite')}
                </SubmitButton>
              </DialogActions>
            </form>
          )}
        </Formik>
      </SharedWithBox>
    </AccordionItem>
  );
};
