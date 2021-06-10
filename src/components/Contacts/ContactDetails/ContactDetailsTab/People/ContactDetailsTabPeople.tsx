import { Avatar, Box, styled, Typography } from '@material-ui/core';
import { Cake, Email, Phone } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RingIcon } from '../../../RingIcon';
import {
  ContactPeopleFragment,
  ContactPersonFragment,
} from './ContactPeople.generated';

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
  color: theme.palette.text.hint,
}));

const ContactPersonIconContainer = styled(Box)(() => ({
  width: '18px',
  height: '18px',
  marginRight: '35px',
}));

interface ContactDetailsPeopleProp {
  data: ContactPeopleFragment;
}

export const ContactDetailsTabPeople: React.FC<ContactDetailsPeopleProp> = ({
  data,
}) => {
  const { t } = useTranslation();

  const { primaryPerson, people } = data;

  const personView = (person: ContactPersonFragment) => {
    return (
      <ContactPersonContainer>
        {/* TODO - add avatar link */}
        <ContactPersonAvatar
          alt={`${person.firstName} ${person.lastName}`}
          src={person.lastName ?? ''}
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
          </ContactPersonRowContainer>
          {/* Phone Number */}
          {person.primaryPhoneNumber !== null ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Phone color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">
                {person.primaryPhoneNumber?.number}
              </Typography>
              {person.primaryPhoneNumber?.location ? (
                <Typography variant="caption">
                  {` - ${person.primaryPhoneNumber.location}`}
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
                {person.primaryEmailAddress?.email}
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
      </ContactPersonContainer>
    );
  };

  return (
    <>
      {primaryPerson ? personView(primaryPerson) : null}
      {people.nodes.map((person) =>
        person.id !== primaryPerson?.id ? personView(person) : null,
      )}
    </>
  );
};
