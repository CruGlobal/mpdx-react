import { Box } from '@material-ui/core';
import { Close, MoreVert, StarOutline } from '@material-ui/icons';
import React from 'react';

import { useGetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

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
    return <p>loading</p>;
  }

  const { contact } = data;

  if (!contact) {
    return null;
  }

  return (
    <Box
      style={{
        display: 'flex',
      }}
    >
      <Box
        style={{
          flex: 1,
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
  );
};
