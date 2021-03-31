import { Box, Button } from '@material-ui/core';
import { Create } from '@material-ui/icons';
import React from 'react';
import { ContactRowFragment } from '../../ContactRow.generated';

interface ContactDetailTabProps {
  contact: ContactRowFragment;
}

export const ContactDetailTab: React.FC<ContactDetailTabProps> = ({
  contact,
}) => {
  return (
    <Box style={{ width: '100%' }}>
      <Box id="contact-detail-tags"></Box>
      <Box id="contact-detail-people">
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
          }}
        >
          <h6 style={{ flexGrow: 5 }}>{contact.name}</h6>
          <Create />
        </Box>
      </Box>
      <Box id="contact-detail-mailing"></Box>
      <Box id="contact-detail-other"></Box>
      <Button />
    </Box>
  );
};
