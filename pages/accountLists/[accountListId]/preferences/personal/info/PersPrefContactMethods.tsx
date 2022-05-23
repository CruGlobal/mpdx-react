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

interface ContactMethodData {
  value: string;
  type: string;
  primary: boolean;
  invalid: boolean;
}

// Single contact phone/email

interface PersPrefContactMethodProps {
  method: ContactMethodData;
}

const PersPrefContactMethod: React.FC<PersPrefContactMethodProps> = ({
  method,
}) => {
  const { t } = useTranslation();
  const prefix = 'address' in method ? 'mailto' : 'tel';
  const value = method.value;

  return (
    <Typography gutterBottom>
      <Link href={`${prefix}:${value}`}>{value}</Link>{' '}
      <span style={{ textTransform: 'capitalize' }}>- {t(method.type)}</span>
    </Typography>
  );
};

// List of phone/email contacts

interface PersPrefContactMethodsProps {
  methods: ContactMethodData[];
}

export const PersPrefContactMethods = ({
  methods,
}: PersPrefContactMethodsProps): ReactElement<PersPrefContactMethodsProps> => {
  const validContacts = methods.filter((method) => method.invalid !== true);
  const primaryContactIndex = validContacts.findIndex(
    (method) => method.primary === true,
  );
  const validContactsSansPrimary = validContacts.filter(
    (method, index) => index !== primaryContactIndex,
  );

  return (
    <>
      {validContacts.length === 1 && (
        <PersPrefContactMethod method={validContacts[0]} />
      )}
      {validContacts.length > 1 && (
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMore />}>
            <PersPrefContactMethod
              method={validContacts[primaryContactIndex]}
            />
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            {validContactsSansPrimary.map((contact) => (
              <PersPrefContactMethod method={contact} key={contact.value} />
            ))}
          </StyledAccordionDetails>
        </StyledAccordion>
      )}
    </>
  );
};
