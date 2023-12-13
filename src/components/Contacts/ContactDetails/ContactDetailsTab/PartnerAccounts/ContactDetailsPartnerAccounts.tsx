import React, { ReactElement, useState } from 'react';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import { Box , IconButton , TextField , Typography } from '@mui/material';
import { styled } from '@mui/system';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ActionButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ContactDetailsTabDocument } from '../ContactDetailsTab.generated';
import { useUpdateContactOtherMutation } from '../Other/EditContactOtherModal/EditContactOther.generated';
import {
  ContactPartnerAccountsFragment,
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
  const { enqueueSnackbar } = useSnackbar();

  const deleteContactDonorAccount = async (id: string) => {
    await deleteDonorAccount({
      variables: {
        contactId: contact.id,
        donorAccountId: id,
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
    enqueueSnackbar('Partner account deleted!', { variant: 'success' });
  };

  const onAddPartnerAccount = async (fields: Attributes) => {
    await updateContact({
      variables: {
        accountListId,
        attributes: {
          id: contact.id,
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
            contactId: contact.id,
          },
        },
      ],
    });
    setShowForm(false);
    enqueueSnackbar('Partner account added!', { variant: 'success' });
  };

  return (
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
