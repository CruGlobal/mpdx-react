import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  styled,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogActions,
  DialogContent,
} from '@material-ui/core';

import BookmarkIcon from '@material-ui/icons/Bookmark';

import { useTranslation } from 'react-i18next';

import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
import Modal from '../../../../../../common/Modal/Modal';

const ContactEditModalFooterButton = styled(Button)(() => ({
  color: '#2196F3',
  fontWeight: 'bold',
}));

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(4, 0),
}));

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
}));

const ContactInputField = styled(TextField)(() => ({
  '&& > label': {
    textTransform: 'uppercase',
  },
}));

const ContactPrimaryPersonSelectLabel = styled(InputLabel)(() => ({
  textTransform: 'uppercase',
}));

const PrimaryContactIcon = styled(BookmarkIcon)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: 8,
  transform: 'translateY(-50%)',
  color: theme.palette.cruGrayMedium.main,
}));

interface EditContactDetailsModalProps {
  contact: ContactDetailsTabQuery['contact'];
  isOpen: boolean;
  handleOpenModal: (open: boolean) => void;
}
export const EditContactDetailsModal: React.FC<EditContactDetailsModalProps> = ({
  contact,
  isOpen,
  handleOpenModal,
}): ReactElement<EditContactDetailsModalProps> => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      title={t('Edit Contact Details')}
      handleClose={() => handleOpenModal(false)}
    >
      <DialogContent dividers>
        <ContactEditContainer>
          <ContactInputWrapper>
            <ContactInputField
              label={t('Contact')}
              value={contact.name}
              fullWidth
            />
          </ContactInputWrapper>
          <ContactInputWrapper>
            <PrimaryContactIcon />

            <FormControl fullWidth={true}>
              <ContactPrimaryPersonSelectLabel id="primary-person-select-label">
                {t('Primary')}
              </ContactPrimaryPersonSelectLabel>
              <Select
                labelId="primary-person-select-label"
                value={contact.primaryPerson?.id}
                fullWidth={true}
              >
                {contact.people.nodes.map((person) => {
                  return (
                    <MenuItem
                      key={person.id}
                      value={person.id}
                    >{`${person.firstName} ${person.lastName}`}</MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </ContactInputWrapper>
        </ContactEditContainer>
      </DialogContent>
      <DialogActions>
        <ContactEditModalFooterButton
          onClick={() => handleOpenModal(false)}
          variant="text"
        >
          {t('Cancel')}
        </ContactEditModalFooterButton>
        <ContactEditModalFooterButton
          onClick={() => handleOpenModal(false)}
          variant="text"
        >
          {t('Save')}
        </ContactEditModalFooterButton>
      </DialogActions>
    </Modal>
  );
};
