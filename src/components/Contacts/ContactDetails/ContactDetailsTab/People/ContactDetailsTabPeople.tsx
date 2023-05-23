import React from 'react';
import {
  Avatar,
  Box,
  Grid,
  IconButton,
  Typography,
  Button,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import Cake from '@mui/icons-material/Cake';
import CreateIcon from '@mui/icons-material/Create';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import { useTranslation } from 'react-i18next';
import { RingIcon } from '../../../RingIcon';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../../ContactDetailContext';
import {
  ContactPeopleFragment,
  ContactPersonFragment,
} from './ContactPeople.generated';
import { PersonModal } from './Items/PersonModal/PersonModal';

const ContactPersonAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  width: '34px',
  height: '34px',
}));

const ContactPersonContainer = styled(Box)(() => ({
  display: 'flex',
  width: '100%',
}));

const ContactPersonTextContainer = styled(Box)(() => ({
  margin: 0,
  flexGrow: 4,
  marginBottom: '10px',
}));

const ContactPersonRowContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const ContactPersonNameText = styled(Typography)(() => ({
  fontWeight: 'bold',
}));

const ContactPersonPrimaryText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: theme.palette.text.secondary,
}));

const ContactPersonIconContainer = styled(Box)(() => ({
  width: '18px',
  height: '18px',
  marginRight: '35px',
}));

const ContactDetailEditIcon = styled(CreateIcon)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.cruGrayMedium.main,
}));

export const ContactDetailsAddButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

export const ContactDetailsAddIcon = styled(AddIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

export const ContactDetailsAddText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const ContactEditIconContainer = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
}));

interface ContactDetailsPeopleProp {
  data: ContactPeopleFragment;
  accountListId: string;
}

export const ContactDetailsTabPeople: React.FC<ContactDetailsPeopleProp> = ({
  data,
  accountListId,
}) => {
  const { t } = useTranslation();

  const {
    editPersonModalOpen,
    setEditPersonModalOpen,
    createPersonModalOpen,
    setCreatePersonModalOpen,
  } = React.useContext(ContactDetailContext) as ContactDetailsType;

  const { primaryPerson, people, id } = data;

  const personView = (person: ContactPersonFragment) => {
    return (
      <ContactPersonContainer key={person.id}>
        {/* TODO - add avatar link */}
        <ContactPersonAvatar
          alt={`${person.firstName} ${person.lastName}`}
          src={person.avatar}
        />
        <ContactPersonTextContainer>
          {/* Heading Section */}
          <ContactPersonRowContainer>
            <ContactPersonNameText variant="h6">
              {`${person.firstName} ${person.lastName}`}
            </ContactPersonNameText>
            {primaryPerson?.id === person.id ? (
              <ContactPersonPrimaryText variant="subtitle1">
                {`- ${t('Primary')}`}
              </ContactPersonPrimaryText>
            ) : null}
            <ContactEditIconContainer
              onClick={() => setEditPersonModalOpen(person.id)}
              aria-label={t('Edit Icon')}
            >
              <ContactDetailEditIcon />
            </ContactEditIconContainer>
          </ContactPersonRowContainer>
          {/* Phone Number */}
          {person.primaryPhoneNumber !== null ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Phone color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">
                <Link href={`tel:${person.primaryPhoneNumber?.number}`}>
                  {person.primaryPhoneNumber?.number}
                </Link>
              </Typography>
              {person.primaryPhoneNumber?.location ? (
                <Typography variant="caption" marginLeft={1}>
                  {t(person.primaryPhoneNumber.location)}
                </Typography>
              ) : null}
            </ContactPersonRowContainer>
          ) : null}
          {/* Email Section */}
          {person.primaryEmailAddress !== null ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Email color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">
                <Link href={`mailto:${person.primaryEmailAddress?.email}`}>
                  {person.primaryEmailAddress?.email}
                </Link>
              </Typography>
            </ContactPersonRowContainer>
          ) : null}
          {/* Birthday Section */}
          {person.birthdayDay !== null && person.birthdayMonth ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Cake color="disabled" />
              </ContactPersonIconContainer>
              {/* TODO: Change to local format for different countries */}
              <Typography variant="subtitle1">
                {person.birthdayYear
                  ? `${person.birthdayMonth}/${person.birthdayDay}/${person.birthdayYear}`
                  : `${person.birthdayMonth}/${person.birthdayDay}/1900`}
              </Typography>
            </ContactPersonRowContainer>
          ) : null}
          {/* Anniversary Section */}
          {person.anniversaryDay !== null && person.anniversaryMonth ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <RingIcon color="disabled" />
              </ContactPersonIconContainer>
              {/* TODO: Change to local format for different countries */}
              <Typography variant="subtitle1">
                {person.anniversaryYear
                  ? `${person.anniversaryMonth}/${person.anniversaryDay}/${person.anniversaryYear}`
                  : `${person.anniversaryMonth}/${person.anniversaryDay}/1900`}
              </Typography>
            </ContactPersonRowContainer>
          ) : null}
        </ContactPersonTextContainer>
        {editPersonModalOpen === person.id ? (
          <PersonModal
            person={person}
            contactId={id}
            accountListId={accountListId}
            handleClose={() => setEditPersonModalOpen(undefined)}
          />
        ) : null}
      </ContactPersonContainer>
    );
  };

  return (
    <>
      {primaryPerson ? personView(primaryPerson) : null}
      {people.nodes.map((person) =>
        person.id !== primaryPerson?.id ? personView(person) : null,
      )}
      <ContactDetailsAddButton onClick={() => setCreatePersonModalOpen(true)}>
        <Grid container alignItems="center">
          <ContactDetailsAddIcon />
          <ContactDetailsAddText variant="subtitle1">
            {t('Add Person')}
          </ContactDetailsAddText>
        </Grid>
      </ContactDetailsAddButton>
      {createPersonModalOpen ? (
        <PersonModal
          person={undefined}
          contactId={id}
          accountListId={accountListId}
          handleClose={() => setCreatePersonModalOpen(false)}
        />
      ) : null}
    </>
  );
};
