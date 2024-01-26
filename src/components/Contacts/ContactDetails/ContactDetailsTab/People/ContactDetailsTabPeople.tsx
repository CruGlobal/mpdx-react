import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Cake from '@mui/icons-material/Cake';
import CreateIcon from '@mui/icons-material/Create';
import Email from '@mui/icons-material/Email';
import MergeIcon from '@mui/icons-material/Merge';
import Phone from '@mui/icons-material/Phone';
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Link,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MergePeopleModal } from 'src/components/Contacts/MassActions/MergePeople/MergePeopleModal';
import { useLocale } from 'src/hooks/useLocale';
import { dateFromParts } from 'src/lib/intlFormat/intlFormat';
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

export const MergePeopleIcon = styled(MergeIcon)(({ theme }) => ({
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
  const locale = useLocale();

  const {
    editPersonModalOpen,
    setEditPersonModalOpen,
    createPersonModalOpen,
    setCreatePersonModalOpen,
  } = React.useContext(ContactDetailContext) as ContactDetailsType;

  const [selecting, setSelectingRaw] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [mergePeopleModalOpen, setMergePeopleModalOpen] = useState(false);

  const setSelecting: typeof setSelectingRaw = (value) => {
    setSelectedPeople([]);
    setSelectingRaw(value);
  };

  const toggleSelectPerson = (personId: string) => {
    if (!selecting) {
      return;
    }

    if (selectedPeople.includes(personId)) {
      setSelectedPeople(selectedPeople.filter((id) => id !== personId));
    } else {
      setSelectedPeople([...selectedPeople, personId]);
    }
  };

  const { primaryPerson, people, id } = data;

  const personView = (person: ContactPersonFragment) => {
    const selected = selecting && selectedPeople.includes(person.id);
    const styles: SxProps<Theme> = selecting
      ? {
          cursor: 'pointer',
          backgroundColor: selected ? '#EBECEC' : undefined,
        }
      : {};

    const birthday = dateFromParts(
      person.birthdayYear,
      person.birthdayMonth,
      person.birthdayDay,
      locale,
    );
    const anniversary = dateFromParts(
      person.anniversaryYear,
      person.anniversaryMonth,
      person.anniversaryDay,
      locale,
    );

    const hasNullPhoneNumbers = person.phoneNumbers.nodes?.some(
      (phone) => phone.number === null,
    );

    return (
      <ContactPersonContainer
        key={person.id}
        sx={styles}
        aria-selected={selected}
        onClick={() => toggleSelectPerson(person.id)}
      >
        <ContactPersonAvatar
          alt={`${person.firstName} ${person.lastName}`}
          src={person.avatar}
          data-testid="ContactPersonAvatar"
        />
        <ContactPersonTextContainer>
          {/* Heading Section */}
          <ContactPersonRowContainer>
            <ContactPersonNameText
              variant="h6"
              style={{
                textDecoration: person.deceased ? 'line-through' : '',
              }}
            >
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
            <ContactPersonRowContainer data-testid="primaryPhoneNumber">
              <ContactPersonIconContainer>
                <Phone color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">
                {person.primaryPhoneNumber?.number !== null ? (
                  <Link href={`tel:${person.primaryPhoneNumber?.number}`}>
                    {person.primaryPhoneNumber?.number}
                  </Link>
                ) : (
                  <Typography
                    variant="caption"
                    sx={{ color: 'statusDanger.main' }}
                  >
                    {t('Invalid number. Please fix.')}
                  </Typography>
                )}
              </Typography>
              {person.primaryPhoneNumber?.location ? (
                <Typography variant="caption" marginLeft={1}>
                  {person.primaryPhoneNumber.location}
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
          {birthday && (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <Cake color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">{birthday}</Typography>
            </ContactPersonRowContainer>
          )}
          {/* Anniversary Section */}
          {anniversary && (
            <ContactPersonRowContainer>
              <ContactPersonIconContainer>
                <RingIcon color="disabled" />
              </ContactPersonIconContainer>
              <Typography variant="subtitle1">{anniversary}</Typography>
            </ContactPersonRowContainer>
          )}
          {hasNullPhoneNumbers && (
            <Typography variant="caption" sx={{ color: 'statusDanger.main' }}>
              {t(`{{name}} has one or multiple invalid numbers. Please fix.`, {
                name: person.firstName,
              })}
            </Typography>
          )}
        </ContactPersonTextContainer>
        {editPersonModalOpen === person.id ? (
          <PersonModal
            person={person}
            contactId={id}
            accountListId={accountListId}
            handleClose={() => setEditPersonModalOpen(undefined)}
            contactData={data}
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
      {!selecting && (
        <ContactDetailsAddButton onClick={() => setCreatePersonModalOpen(true)}>
          <Grid container alignItems="center">
            <ContactDetailsAddIcon />
            <ContactDetailsAddText variant="subtitle1">
              {t('Add Person')}
            </ContactDetailsAddText>
          </Grid>
        </ContactDetailsAddButton>
      )}
      {people.nodes.length > 1 &&
        (selecting ? (
          <>
            <ContactDetailsAddButton onClick={() => setSelecting(false)}>
              <Grid container alignItems="center">
                <ContactDetailsAddText variant="subtitle1">
                  {t('Cancel')}
                </ContactDetailsAddText>
              </Grid>
            </ContactDetailsAddButton>

            <ContactDetailsAddButton
              onClick={() => setMergePeopleModalOpen(true)}
              variant="contained"
              disabled={selectedPeople.length < 2}
            >
              <Grid container alignItems="center">
                <MergePeopleIcon sx={{ color: 'unset' }} />
                <ContactDetailsAddText
                  variant="subtitle1"
                  sx={{ color: 'unset' }}
                >
                  {t('Merge Selected People')}
                </ContactDetailsAddText>
              </Grid>
            </ContactDetailsAddButton>
          </>
        ) : (
          <ContactDetailsAddButton onClick={() => setSelecting(true)}>
            <Grid container alignItems="center">
              <MergePeopleIcon />
              <ContactDetailsAddText variant="subtitle1">
                {t('Merge People')}
              </ContactDetailsAddText>
            </Grid>
          </ContactDetailsAddButton>
        ))}
      {createPersonModalOpen ? (
        <PersonModal
          person={undefined}
          contactId={id}
          accountListId={accountListId}
          handleClose={() => setCreatePersonModalOpen(false)}
          contactData={data}
        />
      ) : null}
      {mergePeopleModalOpen ? (
        <MergePeopleModal
          accountListId={accountListId}
          people={people.nodes.filter((person) =>
            selectedPeople.includes(person.id),
          )}
          handleClose={() => {
            setSelecting(false);
            setMergePeopleModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
};
