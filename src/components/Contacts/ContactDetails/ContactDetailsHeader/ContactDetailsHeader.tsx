import { Box } from '@material-ui/core';
import React from 'react';

import { ContactDetailsFragment } from '../ContactDetails.generated';

interface Props {
  loading: boolean;
  contact?: ContactDetailsFragment;
}

export const ContactDetailsHeader: React.FC<Props> = ({
  loading,
  contact,
}: Props) => {
  return (
    <Box>
      {/*TODO: Build Header*/}
      {loading ? <p>loading</p> : <p>{contact?.name}</p>}
    </Box>
  );
};
