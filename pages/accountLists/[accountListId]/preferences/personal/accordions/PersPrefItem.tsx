import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore } from '@mui/icons-material';
import React from 'react';
import { accordionShared } from '../shared/PersPrefShared';

const StyledAccordion = styled(Accordion)(() => ({
  overflow: 'hidden',
  ...accordionShared,
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '&.Mui-expanded': {
    backgroundColor: theme.palette.mpdxYellow.main,
  },
  '& .MuiAccordionSummary-content': {
    [theme.breakpoints.only('xs')]: {
      flexDirection: 'column',
    },
  },
}));

const StyledAccordionColumn = styled(Box)(({ theme }) => ({
  paddingRight: theme.spacing(2),
  flexBasis: '100%',
  [theme.breakpoints.only('xs')]: {
    '&:nth-child(2)': {
      fontStyle: 'italic',
    },
  },
  [theme.breakpoints.up('md')]: {
    '&:first-child:not(:last-child)': {
      flexBasis: '33.33%',
    },
    '&:nth-child(2)': {
      flexBasis: '66.66%',
    },
  },
}));

const StyledAccordionDetails = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    flexBasis: 'calc((100% - 36px) * 0.661)',
    marginLeft: 'calc((100% - 36px) * 0.338)',
  },
}));

interface PersPrefItemProps {
  onAccordionChange: (label: string) => void;
  expandedPanel: string;
  label: string;
  value: string;
  children?: React.ReactNode;
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
      disableGutters
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
