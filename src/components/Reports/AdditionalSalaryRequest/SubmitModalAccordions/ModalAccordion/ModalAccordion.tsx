import { useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ModalAccordionProps {
  backgroundColor?: string;
  icon: React.ElementType;
  title: string;
  titleColor: string;
  subtitle?: string;
  children: React.ReactNode;
  expanded?: boolean;
  onForm?: boolean;
}

export const ModalAccordion: React.FC<ModalAccordionProps> = ({
  backgroundColor,
  icon: Icon,
  title,
  titleColor,
  subtitle,
  children,
  expanded = false,
  onForm,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(expanded);

  useEffect(() => {
    if (expanded || onForm) {
      setIsExpanded(true);
    }
  }, [expanded, onForm]);

  const accordion = (
    <Accordion
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: backgroundColor,
        }}
        aria-label={
          isExpanded ? t('Collapse salary details') : t('Expand salary details')
        }
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

  return onForm ? <Card data-testid="card">{accordion}</Card> : accordion;
};
