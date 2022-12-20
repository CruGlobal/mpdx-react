import React, { ReactElement, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  ContactPartnerAccountsFragment,
  useGetAccountListSalaryOrganizationQuery,
} from './ContactPartnerAccounts.generated';
import { styled } from '@mui/system';
import Delete from '@mui/icons-material/Delete';
import { useDeleteDonorAccountMutation } from './DeleteDonorAccount.generated';
import { ContactDetailsTabDocument } from '../ContactDetailsTab.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ActionButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Add from '@mui/icons-material/Add';
import * as yup from 'yup';
import { Formik } from 'formik';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUpdateContactOtherMutation } from '../Other/EditContactOtherModal/EditContactOther.generated';

const newPartnerAccountSchema = yup.object({
  accountNumber: yup.string(),
});

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

interface ContactDetailsPartnerAccountsProps {
  contact: ContactPartnerAccountsFragment;
}

export const ContactDetailsPartnerAccounts: React.FC<
  ContactDetailsPartnerAccountsProps
> = ({ contact }) => {
  const [deleteDonorAccount] = useDeleteDonorAccountMutation();
  const [updateContact, { loading: updating }] =
    useUpdateContactOtherMutation();
  const [showForm, setShowForm] = useState(false);
  const accountListId = useAccountListId() ?? '';
  const { data: accountListData } = useGetAccountListSalaryOrganizationQuery({
    variables: { accountListId: accountListId },
  });
  const { t } = useTranslation();

  const deleteContactDonorAccount = async (id: string) => {
    await deleteDonorAccount({
      variables: {
        contactId: contact.id,
        donorAccountId: id,
        donorAccounts: contact.contactDonorAccounts.nodes.map(
          (donorAccount) => ({
            id: donorAccount.donorAccount.id,
            type: 'donor_accounts',
            accountNumber: donorAccount.donorAccount.accountNumber,
            organization: {
              id: donorAccount.donorAccount.organization.id,
              type: 'organization',
            },
          }),
        ),
      },
      refetchQueries: [
        {
          query: ContactDetailsTabDocument,
          variables: {
            accountListId,
            contactId: contact.id,
          },
        },
      ],
    });
  };

  const onAddPartnerAccount = async (accountNumber) => {
    await updateContact({
      variables: {
        accountListId,
        attributes: {
          id: contact.id,
          donorAccount: {
            name: accountNumber.accountNumber,
            accountNumber: accountNumber.accountNumber,
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
            contactId: contact.id,
          },
        },
      ],
    });
    setShowForm(false);
  };

  return (
    <ContactPartnerAccountsContainer>
      <ActionButton onClick={() => setShowForm(!showForm)}>
        <Add />
        Add Partner Account
      </ActionButton>
      {showForm && (
        <Formik
          initialValues={{ accountNumber: '' }}
          validationSchema={newPartnerAccountSchema}
          onSubmit={onAddPartnerAccount}
        >
          {({
            values: { accountNumber },
            handleChange,
            handleSubmit,
            isSubmitting,
            isValid,
            errors,
            touched,
          }): ReactElement => (
            <form onSubmit={handleSubmit} noValidate>
              <TextField
                label={t('Account Name')}
                value={accountNumber}
                onChange={handleChange('accountNumber')}
                inputProps={{ 'aria-label': 'Subject' }}
                error={!!errors.accountNumber && touched.accountNumber}
                helperText={
                  errors.accountNumber &&
                  touched.accountNumber &&
                  t('Field is required')
                }
                required
              />
              <IconButton
                type="submit"
                disabled={isSubmitting || !isValid || updating}
              >
                <Add />
              </IconButton>
            </form>
          )}
        </Formik>
      )}
      {contact.contactDonorAccounts.nodes.map((donorAccount) => (
        <ContactPartnerAccountsTextContainer key={donorAccount.id}>
          <Box display="flex" flexDirection="column">
            {donorAccount.donorAccount.organization.id && (
              <OrganizationName>
                {donorAccount.donorAccount.organization.name}
              </OrganizationName>
            )}
            <Typography>{donorAccount.donorAccount.accountNumber}</Typography>
          </Box>
          <IconButton
            onClick={() =>
              deleteContactDonorAccount(donorAccount.donorAccount.id)
            }
          >
            <Delete />
          </IconButton>
        </ContactPartnerAccountsTextContainer>
      ))}
    </ContactPartnerAccountsContainer>
  );
};
