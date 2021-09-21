import React from 'react';
import { useTranslation } from 'react-i18next';
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

const StyledAccordion = styled(Accordion)({
  '& .MuiAccordionSummary-content.Mui-expanded': {
    margin: '12px 0',
  },
  ...accordionShared,
});

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
  [theme.breakpoints.down('xs')]: {
    flexBasis: '100% !important',
    '&:nth-child(2)': {
      fontStyle: 'italic',
    },
  },
}));

const StyledAccordionDetails = styled(Box)(({ theme }) => ({
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
  const { t } = useTranslation();
  const firstCol = value !== '' ? '33.33%' : '100%';

  return (
    <Box marginTop={1}>
      <StyledAccordion
        onChange={() => onAccordionChange(label)}
        expanded={expandedPanel === label}
      >
        <StyledAccordionSummary expandIcon={<ExpandMore />}>
          <StyledAccordionColumn
            style={{
              flexBasis: firstCol,
            }}
          >
            <Typography component="span">{t(label)}</Typography>
          </StyledAccordionColumn>
          {value !== '' && (
            <StyledAccordionColumn style={{ flexBasis: '66.66%' }}>
              <Typography component="span">{t(value)}</Typography>
            </StyledAccordionColumn>
          )}
        </StyledAccordionSummary>
        <AccordionDetails>
          <StyledAccordionDetails>{children}</StyledAccordionDetails>
        </AccordionDetails>
      </StyledAccordion>
    </Box>
  );
};
