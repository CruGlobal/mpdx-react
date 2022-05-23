import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Typography,
  styled,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { accordionShared } from '../shared/PersPrefShared';

const StyledAccordion = styled(Accordion)({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  '&.Mui-expanded': {
    margin: 0,
  },
  ...accordionShared,
});

const StyledAccordionSummary = styled(AccordionSummary)({
  display: 'inline-block',
  padding: 0,
  minHeight: 'unset',
  '& .MuiAccordionSummary-content': {
    display: 'inline-block',
    margin: 0,
  },
  '& .MuiAccordionSummary-expandIcon': {
    padding: 0,
    position: 'relative',
    top: '-3px',
  },
});

const StyledAccordionDetails = styled(AccordionDetails)({
  display: 'block',
  padding: 0,
});

interface ContactData {
  value: string;
  type: string;
  primary: boolean;
  invalid: boolean;
}

// Single contact phone/email

interface PersPrefContactProps {
  contact: ContactData;
}

const PersPrefContact: React.FC<PersPrefContactProps> = ({ contact }) => {
  const { t } = useTranslation();
  const prefix = 'address' in contact ? 'mailto' : 'tel';
  const value = contact.value;

  return (
    <Typography gutterBottom>
      <Link href={`${prefix}:${value}`}>{value}</Link>{' '}
      <span style={{ textTransform: 'capitalize' }}>- {t(contact.type)} </span>
    </Typography>
  );
};

// List of phone/email contacts

interface PersPrefContactsProps {
  contacts: ContactData[];
}

export const PersPrefContacts = ({
  contacts,
}: PersPrefContactsProps): ReactElement<PersPrefContactsProps> => {
  const validContacts = contacts.filter((contact) => contact.invalid !== true);
  const primaryContactIndex = validContacts.findIndex(
    (contact) => contact.primary === true,
  );
  const validContactsSansPrimary = validContacts.filter(
    (contact, index) => index !== primaryContactIndex,
  );

  return (
    <>
      {validContacts.length === 1 && (
        <PersPrefContact contact={validContacts[0]} />
      )}
      {validContacts.length > 1 && (
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMore />}>
            <PersPrefContact contact={validContacts[primaryContactIndex]} />
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            {validContactsSansPrimary.map((contact) => {
              return <PersPrefContact contact={contact} key={contact.value} />;
            })}
          </StyledAccordionDetails>
        </StyledAccordion>
      )}
    </>
  );
};
