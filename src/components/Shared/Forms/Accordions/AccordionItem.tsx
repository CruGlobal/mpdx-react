import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore } from '@mui/icons-material';

export const accordionShared = {
  '&:before': {
    content: 'none',
  },
  '& .MuiAccordionSummary-root.Mui-expanded': {
    minHeight: 'unset',
  },
};

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
}));

const AccordionRightDetails = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: 'calc((100% - 36px) * 0.661)',
  },
}));

const AccordionLImageDetails = styled(Box)(() => ({
  display: 'flex',
}));

const AccordionLeftDetailsImage = styled(Box)(() => ({
  maxWidth: '200px',
  ' & > img': {
    width: '100%',
  },
}));

interface AccordionItemProps {
  onAccordionChange: (label: string) => void;
  expandedPanel: string;
  label: string;
  value: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
  image?: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  onAccordionChange,
  expandedPanel,
  label,
  value,
  children,
  fullWidth = false,
  image,
}) => {
  const expanded = useMemo(
    () => expandedPanel.toLowerCase() === label.toLowerCase(),
    [expandedPanel, label],
  );

  return (
    <StyledAccordion
      onChange={() => onAccordionChange(label)}
      expanded={expanded}
      disableGutters
    >
      <StyledAccordionSummary expandIcon={<ExpandMore />}>
        <StyledAccordionColumn>
          <Typography component="span">{label}</Typography>
        </StyledAccordionColumn>
        {value && (
          <StyledAccordionColumn>
            <Typography component="span">{value}</Typography>
          </StyledAccordionColumn>
        )}
      </StyledAccordionSummary>
      <AccordionDetails>
        {!fullWidth && !image && (
          <StyledAccordionDetails>{children}</StyledAccordionDetails>
        )}
        {fullWidth && !image && <Box>{children}</Box>}
        {image && (
          <AccordionLImageDetails>
            <AccordionLeftDetails>
              <AccordionLeftDetailsImage>{image}</AccordionLeftDetailsImage>
            </AccordionLeftDetails>
            <AccordionRightDetails>{children}</AccordionRightDetails>
          </AccordionLImageDetails>
        )}
      </AccordionDetails>
    </StyledAccordion>
  );
};
