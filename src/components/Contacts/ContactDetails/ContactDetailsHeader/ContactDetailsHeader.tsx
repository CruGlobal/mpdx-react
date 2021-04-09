import { Box } from '@material-ui/core';
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

  return (
    <Box>
      {/*TODO: Build Header*/}
      {loading ? (
        <p>loading</p>
      ) : (
        <p role="contactName">{data?.contact.name}</p>
      )}
    </Box>
  );
};
