import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore } from '@mui/icons-material';
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
  type: string;
  method: ContactMethodData;
}

const PersPrefContactMethod: React.FC<PersPrefContactMethodProps> = ({
  type,
  method,
}) => {
  const { t } = useTranslation();
  const prefix = type === 'email' ? 'mailto' : 'tel';
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
  type: string;
  methods: ContactMethodData[];
}

export const PersPrefContactMethods = ({
  type,
  methods,
}: PersPrefContactMethodsProps): ReactElement<PersPrefContactMethodsProps> => {
  const validMethods = methods.filter((method) => method.invalid !== true);
  const validMethodsPrimary = validMethods.filter(
    (method) => method.primary === true,
  );
  const validMethodsSecondary = validMethods.filter(
    (method) => method.primary === false,
  );

  return (
    <>
      {validMethods.length === 1 && (
        <PersPrefContactMethod type={type} method={validMethods[0]} />
      )}
      {validMethods.length > 1 && (
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMore />}>
            <PersPrefContactMethod
              type={type}
              method={validMethodsPrimary[0]}
            />
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            {validMethodsSecondary.map((contact) => (
              <PersPrefContactMethod
                type={type}
                method={contact}
                key={contact.value}
              />
            ))}
          </StyledAccordionDetails>
        </StyledAccordion>
      )}
    </>
  );
};
