import React, { ReactElement, useState } from 'react';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ActionButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { ContactDetailsTabDocument } from '../ContactDetailsTab.generated';
import { useUpdateContactOtherMutation } from '../Other/EditContactOtherModal/EditContactOther.generated';
import { ContactDetailLoadingPlaceHolder } from '../StyledComponents';
import {
  useContactDonorAccountsQuery,
  useGetAccountListSalaryOrganizationQuery,
} from './ContactPartnerAccounts.generated';
import { useDeleteDonorAccountMutation } from './DeleteDonorAccount.generated';

const newPartnerAccountSchema = yup.object({
  accountNumber: yup.string().required(),
});

type Attributes = yup.InferType<typeof newPartnerAccountSchema>;

const ContactPartnerAccountsContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1, 1, 1, 5),
}));

const OrganizationName = styled(Typography)(({ theme }) => ({
  fontSize: theme.spacing(1.5),
  color: theme.palette.cruGrayDark.main,
}));

const ContactPartnerAccountsTextContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(2),
  alignItems: 'center',
}));
const PartnerAccountTextContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const PartnerAccountTextLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginRight: '5px',
  fontSize: '13px',
}));
interface ContactDetailsPartnerAccountsProps {
  accountListId: string;
  contactId: string;
}

export const ContactDetailsPartnerAccounts: React.FC<
  ContactDetailsPartnerAccountsProps
> = ({ accountListId, contactId }) => {
  // The API returns different results for displayName when using Contacts vs Donations.
  // Because of this we use the fetchPolicy: 'no-cache' to ensure we don't override the displayName elsewhere.
  // This is also why I have removed the partnerAccount query from the rest of the ContactDetailsTab queries.
  const { data } = useContactDonorAccountsQuery({
    variables: { accountListId, contactId },
    fetchPolicy: 'no-cache',
  });

  const [deleteDonorAccount] = useDeleteDonorAccountMutation();
  const [updateContact, { loading: updating }] =
    useUpdateContactOtherMutation();
  const [showForm, setShowForm] = useState(false);
  const { data: accountListData } = useGetAccountListSalaryOrganizationQuery({
    variables: { accountListId: accountListId },
  });
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const deleteContactDonorAccount = async (id: string) => {
    await deleteDonorAccount({
      variables: {
        contactId,
        donorAccountId: id,
      },
      refetchQueries: [
        {
          query: ContactDetailsTabDocument,
          variables: {
            accountListId,
            contactId,
          },
        },
      ],
    });
    enqueueSnackbar(t('Partner account deleted!'), { variant: 'success' });
  };

  const onAddPartnerAccount = async (fields: Attributes) => {
    await updateContact({
      variables: {
        accountListId,
        attributes: {
          id: contactId,
          donorAccount: {
            name: fields.accountNumber,
            accountNumber: fields.accountNumber,
            organizationId:
              accountListData?.accountList.salaryOrganizationId ?? '',
          },
        },
      },
      refetchQueries: [
        {
          query: ContactDetailsTabDocument,
          variables: {
            accountListId,
            contactId,
          },
        },
      ],
    });
    setShowForm(false);
    enqueueSnackbar(t('Partner account added!'), { variant: 'success' });
  };

  return !data ? (
    <>
      <ContactDetailLoadingPlaceHolder variant="rectangular" />
      <ContactDetailLoadingPlaceHolder variant="rectangular" />
      <ContactDetailLoadingPlaceHolder variant="rectangular" />
    </>
  ) : (
    <ContactPartnerAccountsContainer>
      <ActionButton onClick={() => setShowForm(!showForm)}>
        <Add />
        {t('Add Partner Account')}
      </ActionButton>
      {showForm && (
        <Formik
          initialValues={{ accountNumber: '' }}
          validationSchema={newPartnerAccountSchema}
          validateOnMount
          onSubmit={onAddPartnerAccount}
        >
          {({
            values: { accountNumber },
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            isValid,
            errors,
            touched,
          }): ReactElement => (
            <form onSubmit={handleSubmit} noValidate>
              <TextField
                name="accountNumber"
                label={t('Account Number')}
                value={accountNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                inputProps={{ 'aria-label': t('Account Number') }}
                error={!!errors.accountNumber && touched.accountNumber}
                helperText={
                  errors.accountNumber &&
                  touched.accountNumber &&
                  t('Field is required')
                }
                required
              />
              <IconButton
                aria-label={t('Submit')}
                type="submit"
                disabled={isSubmitting || !isValid || updating}
              >
                <Add />
              </IconButton>
            </form>
          )}
        </Formik>
      )}
      {data.contact.contactDonorAccounts.nodes.map((donorAccount) => {
        const nameId = `partner-account-${donorAccount.donorAccount.accountNumber}`;
        return (
          <ContactPartnerAccountsTextContainer key={donorAccount.id}>
            <Box display="flex" flexDirection="column">
              {donorAccount.donorAccount.organization.id && (
                <OrganizationName>
                  {donorAccount.donorAccount.organization.name}
                </OrganizationName>
              )}
              <PartnerAccountTextContainer>
                <PartnerAccountTextLabel>
                  {t('Account Number:')}
                </PartnerAccountTextLabel>
                <Typography>
                  {donorAccount.donorAccount.accountNumber}
                </Typography>
              </PartnerAccountTextContainer>
              <PartnerAccountTextContainer>
                <PartnerAccountTextLabel>
                  {t('Account Name:')}
                </PartnerAccountTextLabel>
                <Typography variant="body2" id={nameId}>
                  {donorAccount.donorAccount.displayName}
                </Typography>
              </PartnerAccountTextContainer>
            </Box>
            <IconButton
              aria-label={t('Delete')}
              aria-describedby={nameId}
              onClick={() =>
                deleteContactDonorAccount(donorAccount.donorAccount.id)
              }
            >
              <Delete />
            </IconButton>
          </ContactPartnerAccountsTextContainer>
        );
      })}
    </ContactPartnerAccountsContainer>
  );
};
