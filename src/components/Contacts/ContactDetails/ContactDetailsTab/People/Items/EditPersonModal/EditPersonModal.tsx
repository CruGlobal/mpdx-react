import React, { ReactElement, useState } from 'react';
import { Box, Button, styled, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
import Modal from '../../../../../../common/Modal/Modal';
import { PersonName } from './PersonName/PersonName';
import { PersonPhoneNumber } from './PersonPhoneNumber/PersonPhoneNumber';
import { PersonEmail } from './PersonEmail/PersonEmail';
import { PersonBirthday } from './PersonBirthday/PersonBirthday';
import { PersonShowMore } from './PersonShowMore/PersonShowMore';

const ContactPersonContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const ShowExtraContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: theme.spacing(1, 0),
}));

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(1, 0),
}));

const ContactEditModalFooterButton = styled(Button)(() => ({
  color: '#2196F3',
  fontWeight: 'bold',
}));

const ShowExtraText = styled(Typography)(() => ({
  color: '#2196F3',
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

interface EditPersonModalProps {
  person: ContactDetailsTabQuery['contact']['people']['nodes'][0];
  isOpen: boolean;
  handleOpenModal: (open: boolean) => void;
}
export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  person,
  isOpen,
  handleOpenModal,
}): ReactElement<EditPersonModalProps> => {
  const { t } = useTranslation();

  const [personEditShowMore, setPersonEditShowMore] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      title={'Edit Person'}
      content={
        <ContactEditContainer>
          <ContactPersonContainer>
            {/* Name Section */}
            <PersonName person={person} />
            {/* Phone Number Section */}
            <PersonPhoneNumber person={person} />
            {/* Email Section */}
            <PersonEmail person={person} />
            {/* Birthday Section */}
            <PersonBirthday person={person} />
            {/* Show More Section */}
            {!personEditShowMore && (
              <ShowExtraContainer>
                <ShowExtraText
                  variant="subtitle1"
                  onClick={() => setPersonEditShowMore(true)}
                >
                  {t('Show More')}
                </ShowExtraText>
              </ShowExtraContainer>
            )}
            {/* Start Show More Content */}
            {personEditShowMore ? <PersonShowMore person={person} /> : null}
            {/* End Show More Content */}

            {/* Show Less Section */}
            {personEditShowMore && (
              <ShowExtraContainer>
                <ShowExtraText
                  variant="subtitle1"
                  onClick={() => setPersonEditShowMore(false)}
                >
                  {t('Show Less')}
                </ShowExtraText>
              </ShowExtraContainer>
            )}
          </ContactPersonContainer>
        </ContactEditContainer>
      }
      customActionSection={
        <>
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
        </>
      }
      handleClose={() => handleOpenModal(false)}
    />
  );
};
