import { Box } from '@material-ui/core';
import { Close, LocationOn, MoreVert, StarOutline } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React, { Fragment } from 'react';

import { useGetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';
import { ContactDetailsHeaderSection } from './ContactDetailsHeaderSection/ContactDetailsHeaderSection';

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
            <ContactDetailsHeaderSection icon={LocationOn}>
              <Fragment>
                <p>{contact.greeting}</p>
                <p>{contact.primaryAddress.street}</p>
                <p>{contact.primaryAddress.city}</p>
              </Fragment>
            </ContactDetailsHeaderSection>
          ) : null}
        </Box>
        <Box flex={1}>
          <p>fdsa</p>
        </Box>
      </Box>
    </Box>
  );
};
