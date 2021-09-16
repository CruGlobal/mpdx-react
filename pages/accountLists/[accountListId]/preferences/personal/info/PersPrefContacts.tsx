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
// import PersPrefContact from './PersPrefContact';

const StyledAccordion = styled(Accordion)({
  backgroundColor: 'transparent',
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
  const dataValid = contacts.filter((current) => current.invalid !== true);
  const primaryIndex = dataValid.findIndex(
    (current) => current.primary === true,
  );
  const dataSansPrimary = dataValid.filter(
    (current, index) => index !== primaryIndex,
  );

  return (
    <>
      {dataValid.length === 1 && <PersPrefContact contact={dataValid[0]} />}
      {dataValid.length > 1 && (
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMore />}>
            <PersPrefContact contact={dataValid[primaryIndex]} />
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            {dataSansPrimary.map((current) => {
              return <PersPrefContact contact={current} key={current.value} />;
            })}
          </StyledAccordionDetails>
        </StyledAccordion>
      )}
    </>
  );
};
