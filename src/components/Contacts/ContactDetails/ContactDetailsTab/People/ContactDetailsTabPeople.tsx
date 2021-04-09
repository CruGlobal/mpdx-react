import { Avatar, Box, styled, Typography } from '@material-ui/core';
import { Cake, Email, Phone } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Person } from '../../../../../../graphql/types.generated';
import { RingIcon } from '../../../RingIcon';
import { ContactDetailsTabQuery } from '../ContactDetailsTab.generated';

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
  data: ContactDetailsTabQuery;
}

export const ContactDetailsTabPeople: React.FC<ContactDetailsPeopleProp> = ({
  data,
}) => {
  const { t } = useTranslation();

  const personView = (person: Person, isPrimary: boolean) => {
    return (
      <ContactPersonContainer>
        <ContactPersonAvatar
          alt={`${person.firstName} ${person.lastName}`}
          src={person.lastName}
        />
        <ContactPersonTextContainer>
          {/* Heading Section */}
          <ContactPersonRowContainer>
            <Typography variant="h6">
              {`${person.firstName} ${person.lastName}`}
            </Typography>
            {isPrimary ? (
              <ContactPersonPrimaryText variant="subtitle1">
                {`- ${t('Primary')}`}
              </ContactPersonPrimaryText>
            ) : (
              <></>
            )}
          </ContactPersonRowContainer>
          {/* Phone Number */}
          {person.primaryPhoneNumber !== null ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Phone color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">
                {person.primaryPhoneNumber.number}
              </Typography>
              <Typography variant="caption">
                {` - ${person.primaryPhoneNumber.location}`}
              </Typography>
            </ContactPersonRowContainer>
          ) : (
            <></>
          )}
          {/* Email Section */}
          {person.primaryEmailAddress != null ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Email color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">
                {person.primaryEmailAddress.email}
              </Typography>
            </ContactPersonRowContainer>
          ) : (
            <></>
          )}
          {/* Birthday Section */}
          {person.birthdayDay != null ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Cake color="disabled" />
              </ContactPersonIconContainer>
              {/* TODO: Change to local format for different countries */}
              <Typography variant="subtitle1">
                {person.birthdayMonth +
                  '/' +
                  person.birthdayDay +
                  '/' +
                  person.birthdayYear}
              </Typography>
            </ContactPersonRowContainer>
          ) : (
            <></>
          )}
          {/* Anniversary Section */}
          {person.anniversaryDay != null ? (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <RingIcon color="disabled" />
              </ContactPersonIconContainer>
              {/* TODO: Change to local format for different countries */}
              <Typography variant="subtitle1">
                {person.anniversaryMonth +
                  '/' +
                  person.anniversaryDay +
                  '/' +
                  person.anniversaryYear}
              </Typography>
            </ContactPersonRowContainer>
          ) : (
            <></>
          )}
        </ContactPersonTextContainer>
      </ContactPersonContainer>
    );
  };
  return (
    <>
      {data.contact.primaryPerson != null ? (
        personView(data.contact.primaryPerson as Person, true)
      ) : (
        <></>
      )}
      {data.contact.people.nodes.map((person, _index) =>
        person.id == data.contact.primaryPerson.id ? (
          <></>
        ) : (
          personView(person as Person, false)
        ),
      )}
    </>
  );
};
