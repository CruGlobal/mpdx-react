import { useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';

interface ModalAccordionProps {
  backgroundColor?: string;
  icon: React.ElementType;
  title: string;
  titleColor: string;
  subtitle?: string;
  children: React.ReactNode;
  expanded?: boolean;
}

export const ModalAccordion: React.FC<ModalAccordionProps> = ({
  backgroundColor,
  icon: Icon,
  title,
  titleColor,
  subtitle,
  children,
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  useEffect(() => {
    if (expanded) {
      setIsExpanded(true);
    }
  }, [expanded]);

  return (
    <Accordion
      expanded={isExpanded}
      onChange={(_, newExpanded) => setIsExpanded(newExpanded)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: backgroundColor,
        }}
      >
        <Icon sx={{ mr: 1, color: titleColor }} />
        <Typography sx={{ fontWeight: 'bold', color: titleColor, mr: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
