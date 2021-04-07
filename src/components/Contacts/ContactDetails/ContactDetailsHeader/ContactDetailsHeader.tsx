import { Box } from '@material-ui/core';
import {
  Close,
  Email,
  LocationOn,
  MoreVert,
  Phone,
  StarOutline,
} from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React from 'react';

import { useGetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';
import { ContactDetailsHeaderSection } from './ContactDetailsHeaderSection/ContactDetailsHeaderSection';
import { SwapIcon } from './ContactDetailsHeaderSection/SwapIcon';

interface Props {
  accountListId: string;
  contactId: string;
}

export const ContactDetailsHeader: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const { data, loading } = useGetContactDetailsHeaderQuery({
    variables: { accountListId, contactId },
  });

  if (loading) {
    return (
      <Box>
        <Skeleton></Skeleton>
      </Box>
    );
  }

  const { contact } = data;

  if (!contact) {
    return null;
  }

  return (
    <Box>
      <Box display="flex">
        <Box
          flex={1}
          style={{
            alignItems: 'center',
          }}
        >
          <Box
            style={{
              backgroundColor: '#000000',
              height: 64,
              width: 64,
              borderRadius: 32,
              display: 'inline-block',
            }}
          />
          <p
            style={{ display: 'inline-block' }}
          >{`${contact.primaryPerson?.firstName} ${contact.primaryPerson?.lastName}`}</p>
          <p style={{ display: 'inline-block' }}>{'- Primary'}</p>
        </Box>
        <Box alignItems="center">
          <StarOutline style={{ display: 'inline-block' }} />
          <MoreVert style={{ display: 'inline-block' }} />
          <Close style={{ display: 'inline-block' }} />
        </Box>
      </Box>
      <Box display="flex">
        <Box flex={1}>
          {contact.primaryAddress ? (
            <ContactDetailsHeaderSection icon={<LocationOn />}>
              <p>{contact.greeting}</p>
              <p>{contact.primaryAddress.street}</p>
              <p>{contact.primaryAddress.city}</p>
            </ContactDetailsHeaderSection>
          ) : null}
          {contact.primaryPerson?.primaryPhoneNumber?.number ? (
            <ContactDetailsHeaderSection icon={<Phone />}>
              <p>{contact.primaryPerson.primaryPhoneNumber.number}</p>
            </ContactDetailsHeaderSection>
          ) : null}
          {contact.primaryPerson?.primaryEmailAddress?.email ? (
            <ContactDetailsHeaderSection icon={<Email />}>
              <p>{contact.primaryPerson.primaryEmailAddress.email}</p>
            </ContactDetailsHeaderSection>
          ) : null}
        </Box>
        <Box flex={1}>
          {contact.status ? (
            <ContactDetailsHeaderSection icon={<SwapIcon />}>
              <p>{contact.status}</p>
            </ContactDetailsHeaderSection>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};
