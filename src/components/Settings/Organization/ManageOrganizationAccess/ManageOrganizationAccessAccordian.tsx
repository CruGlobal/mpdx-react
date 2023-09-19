import { ReactElement, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  DialogActions,
  TextField,
  FormHelperText,
  Box,
  Alert,
  List,
  ListItem,
  IconButton,
  ListItemText,
} from '@mui/material';
import { AccordianProps } from '../../accordianHelper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import * as yup from 'yup';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  OrganizationsContext,
  OrganizationsContextType,
} from 'pages/accountLists/[accountListId]/settings/organizations.page';
import {
  GetOrganizationInvitesDocument,
  GetOrganizationInvitesQuery,
  GetOrganizationAdminsDocument,
  GetOrganizationAdminsQuery,
  useGetOrganizationAdminsQuery,
  useGetOrganizationInvitesQuery,
  useDestroyOrganizationAdminMutation,
  useDestroyOrganizationInviteMutation,
  useCreateOrganizationInviteMutation,
} from './ManageOrganizationAccess.generated';
import theme from 'src/theme';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat/intlFormat';

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
export const ManageOrganizationAccessAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Manage Organization Access');
  const { enqueueSnackbar } = useSnackbar();
  const locale = useLocale();
  const { selectedOrganizationId } = useContext(
    OrganizationsContext,
  ) as OrganizationsContextType;
  const [destroyOrganizationAdmin] = useDestroyOrganizationAdminMutation();
  const [destroyOrganizationInvite] = useDestroyOrganizationInviteMutation();
  const [createOrganizationInvite] = useCreateOrganizationInviteMutation();
  const { data: adminsData } = useGetOrganizationAdminsQuery({
    variables: {
      input: {
        organizationId: selectedOrganizationId,
      },
    },
  });
  const { data: invitesData } = useGetOrganizationInvitesQuery({
    variables: {
      input: {
        organizationId: selectedOrganizationId,
      },
    },
  });

  const admins = adminsData?.getOrganizationAdmins;
  const invites = invitesData?.getOrganizationInvites;

  type ImpersonateUserFormType = {
    username: string;
  };

  const ImpersonateUserSchema: yup.SchemaOf<ImpersonateUserFormType> =
    yup.object({
      username: yup.string().email().required(),
    });

  const handleSentInvite = async (attributes: ImpersonateUserFormType) => {
    await createOrganizationInvite({
      variables: {
        input: {
          organizationId: selectedOrganizationId,
          recipientEmail: attributes.username,
        },
      },
      update: (cache, { data: invitation }) => {
        const query = {
          query: GetOrganizationInvitesDocument,
          variables: {
            input: {
              organizationId: selectedOrganizationId,
            },
          },
        };
        const dataFromCache =
          cache.readQuery<GetOrganizationInvitesQuery>(query);
        if (dataFromCache && invitation) {
          const data = {
            ...dataFromCache,
            getOrganizationInvites: dataFromCache.getOrganizationInvites.concat(
              [
                {
                  ...invitation?.createOrganizationInvite,
                },
              ],
            ),
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('MPDX sent an invite to {{email}}', {
            email: attributes.username,
          }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "MPDX couldn't send an invite (check to see if email address is valid)",
          ),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  const handleDeleteAdmin = async (adminId) => {
    await destroyOrganizationAdmin({
      variables: {
        input: {
          organizationId: selectedOrganizationId,
          adminId,
        },
      },
      update: (cache) => {
        const query = {
          query: GetOrganizationAdminsDocument,
          variables: {
            input: {
              organizationId: selectedOrganizationId,
            },
          },
        };
        const dataFromCache =
          cache.readQuery<GetOrganizationAdminsQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            getOrganizationAdmins: dataFromCache.getOrganizationAdmins.filter(
              (admin) => admin?.id !== adminId,
            ),
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('removed the admin successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("couldn't remove the admin"), {
          variant: 'error',
        });
      },
    });
  };
  const handleDeleteInvite = async (inviteId) => {
    await destroyOrganizationInvite({
      variables: {
        input: {
          organizationId: selectedOrganizationId,
          inviteId,
        },
      },
      update: (cache) => {
        const query = {
          query: GetOrganizationInvitesDocument,
          variables: {
            input: {
              organizationId: selectedOrganizationId,
            },
          },
        };
        const dataFromCache =
          cache.readQuery<GetOrganizationInvitesQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            getOrganizationInvites: dataFromCache.getOrganizationInvites.filter(
              (invite) => invite?.id !== inviteId,
            ),
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('removed the invite successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("couldn't remove the invite"), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
    >
      <Typography>
        {t(`Share this organization with other team members`)}
      </Typography>
      <Alert color="warning">
        {t(`If you want to allow another MPDX user to have access to this organization, you can share access with them. Make
    sure you have the proper permissions and leadership consensus around this sharing before you do this. You will be
    able to remove access later.`)}
      </Alert>

      {!!admins?.length && (
        <SharedWithBox>
          <Typography>{t(`Organization currently shared with`)}</Typography>
          <List>
            {admins?.map((admin, idx) => (
              <StyledListItem
                key={`${idx}-admin-${admin?.id}`}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteAdmin(admin?.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${admin?.firstName} ${admin?.lastName}`}
                />
              </StyledListItem>
            ))}
          </List>
        </SharedWithBox>
      )}

      {!!invites?.length && (
        <SharedWithBox>
          <Typography>{t(`Organization currently shared with`)}</Typography>
          <List>
            {invites?.map((invite, idx) => (
              <StyledListItem
                key={`${idx}-invite-${invite?.id}`}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteInvite(invite?.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={invite?.recipientEmail}
                  secondary={`Invited as  ${
                    invite?.inviteUserAs
                  } on ${dateFormat(
                    DateTime.fromISO(invite?.createdAt ?? ''),
                    locale,
                  )}`}
                />
              </StyledListItem>
            ))}
          </List>
        </SharedWithBox>
      )}

      <SharedWithBox>
        <Formik
          initialValues={{
            username: '',
          }}
          validationSchema={ImpersonateUserSchema}
          onSubmit={handleSentInvite}
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
                    label={t('User Name, ID or Key/Relay Email')}
                    type="email"
                    value={username}
                    disabled={isSubmitting}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={true}
                    onChange={handleChange('username')}
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
