import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { ContactPartnerAccountsFragment } from './ContactPartnerAccounts.generated';
import { styled } from '@mui/system';
import Delete from '@mui/icons-material/Delete';
import { useDeleteDonorAccountMutation } from './DeleteDonorAccount.generated';

const ContactPartnerAccountsContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1, 1, 1, 5),
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
    });
  };

  return (
    <ContactPartnerAccountsContainer>
      {contact.contactDonorAccounts.nodes.map((donorAccount) => (
        <ContactPartnerAccountsTextContainer key={donorAccount.id}>
          <Typography>{donorAccount.donorAccount.accountNumber}</Typography>
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
