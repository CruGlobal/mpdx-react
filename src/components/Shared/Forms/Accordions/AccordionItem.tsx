import React from 'react';
import { ExpandMore } from '@mui/icons-material';
import {
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GroupedAccordion } from './GroupedAccordion';

const StyledAccordion = styled(GroupedAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&.Mui-disabled': {
    backgroundColor: 'white',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
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
    '&:nth-of-type(2)': {
      fontStyle: 'italic',
    },
  },
  [theme.breakpoints.up('md')]: {
    '&:first-of-type:not(:last-of-type)': {
      flexBasis: '33.33%',
    },
    '&:nth-of-type(2)': {
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

const AccordionLeftDetails = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: 'calc((100% - 36px) * 0.338)',
  },
  [theme.breakpoints.down('md')]: {
    width: '200px',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '10px',
    width: '100%',
  },
}));

const AccordionRightDetails = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: 'calc((100% - 36px) * 0.661)',
  },
  [theme.breakpoints.down('md')]: {
    width: 'calc(100% - 200px)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const AccordionLImageDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
  },
}));

const AccordionLeftDetailsImage = styled(Box)(({ theme }) => ({
  maxWidth: '200px',
  ' & > img': {
    width: '100%',
  },

  [theme.breakpoints.down('md')]: {
    ' & > img': {
      maxWidth: '150px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    ' & > img': {
      maxWidth: '100px',
    },
  },
}));

interface AccordionItemProps<AccordionEnum> {
  accordion: AccordionEnum;
  onAccordionChange: (accordion: AccordionEnum | null) => void;
  expandedAccordion: AccordionEnum | null;
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
  image?: React.ReactNode;
  disabled?: boolean;
}

export const AccordionItem = <AccordionEnum,>({
  accordion,
  onAccordionChange,
  expandedAccordion,
  label,
  value,
  children,
  fullWidth = false,
  image,
  disabled,
}: AccordionItemProps<AccordionEnum>) => {
  const expanded = expandedAccordion === accordion;

  return (
    <StyledAccordion
      onChange={(_, expanded) => onAccordionChange(expanded ? accordion : null)}
      expanded={expandedAccordion === accordion}
      disableGutters
      disabled={disabled}
    >
      <StyledAccordionSummary expandIcon={<ExpandMore />}>
        <StyledAccordionColumn>
          <Typography component="span">{label}</Typography>
        </StyledAccordionColumn>
        {value && (
          <StyledAccordionColumn data-testid="AccordionSummaryValue">
            <Typography component="span">{value}</Typography>
          </StyledAccordionColumn>
        )}
      </StyledAccordionSummary>
      {expanded && (
        <AccordionDetails data-testid="AccordionDetails">
          {!fullWidth && !image && (
            <StyledAccordionDetails>{children}</StyledAccordionDetails>
          )}
          {fullWidth && !image && <Box>{children}</Box>}
          {image && (
            <AccordionLImageDetails data-testid="AccordionLImageDetails">
              <AccordionLeftDetails>
                <AccordionLeftDetailsImage>{image}</AccordionLeftDetailsImage>
              </AccordionLeftDetails>
              <AccordionRightDetails>{children}</AccordionRightDetails>
            </AccordionLImageDetails>
          )}
        </AccordionDetails>
      )}
    </StyledAccordion>
  );
};
