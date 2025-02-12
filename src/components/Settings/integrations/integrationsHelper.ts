import { Button, List, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { IntegrationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';

export const StyledListItem = styled(ListItemText)(() => ({
  display: 'list-item',
}));

export const StyledList = styled(List)(({ theme }) => ({
  listStyleType: 'disc',
  paddingLeft: theme.spacing(4),
}));

export const StyledServicesButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
})) as typeof Button; // Type cast so that `component` prop works

export interface AccordionProps {
  handleAccordionChange: (accordion: IntegrationAccordion | null) => void;
  expandedAccordion: IntegrationAccordion | null;
  disabled?: boolean;
}
