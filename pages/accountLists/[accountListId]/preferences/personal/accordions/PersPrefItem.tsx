import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  styled,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { accordionShared } from '../shared/PersPrefShared';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginTop: theme.spacing(1),
  '& .MuiAccordionSummary-content.Mui-expanded': {
    margin: '12px 0',
  },
  ...accordionShared,
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
    },
  },
}));

const StyledAccordionColumn = styled(Box)(({ theme }) => ({
  paddingRight: theme.spacing(2),
  boxSizing: 'border-box',
  flexBasis: '100%',
  [theme.breakpoints.down('xs')]: {
    '&:nth-child(2)': {
      fontStyle: 'italic',
    },
  },
  [theme.breakpoints.up('sm')]: {
    '&:first-child:not(:last-child)': {
      width: '33.33%',
    },
    '&:nth-child(2)': {
      width: '66.66%',
    },
  },
}));

const StyledAccordionDetails = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  [theme.breakpoints.up('sm')]: {
    width: 'calc((100% - 36px) * 0.6666)',
    marginLeft: 'calc((100% - 36px) * 0.3333)',
  },
}));

interface PersPrefItemProps {
  onAccordionChange: (label: string) => void;
  expandedPanel: string;
  label: string;
  value: string;
}

export const PersPrefItem: React.FC<PersPrefItemProps> = ({
  onAccordionChange,
  expandedPanel,
  label,
  value,
  children,
}) => {
  return (
    <StyledAccordion
      onChange={() => onAccordionChange(label)}
      expanded={expandedPanel === label}
    >
      <StyledAccordionSummary expandIcon={<ExpandMore />}>
        <StyledAccordionColumn>
          <Typography component="span">{label}</Typography>
        </StyledAccordionColumn>
        {value !== '' && (
          <StyledAccordionColumn>
            <Typography component="span">{value}</Typography>
          </StyledAccordionColumn>
        )}
      </StyledAccordionSummary>
      <AccordionDetails>
        <StyledAccordionDetails>{children}</StyledAccordionDetails>
      </AccordionDetails>
    </StyledAccordion>
  );
};
