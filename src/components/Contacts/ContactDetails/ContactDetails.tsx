import { Box } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useGetContactDetailsLazyQuery } from './ContactDetails.generated';

interface Props {
  accountListId: string;
  contactId: string | null;
}

export const ContactDetails: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const [
    loadContactDetails,
    { data, loading, error },
  ] = useGetContactDetailsLazyQuery();

  useEffect(() => {
    if (contactId != null) {
      loadContactDetails({ variables: { accountListId, contactId } });
    }
  }, [contactId]);

  return (
    <Box position="fixed">
      {loading ? <p>loading</p> : <p>{data?.contact.name}</p>}
    </Box>
  );
};
