import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  GoalSettingsViewEnum,
  useGoalSettingsView,
} from './useGoalSettingsView';

interface NavItemProps {
  label: string;
  /** Whether this item's view is the active one. */
  current: boolean;
  /** Selects this item's view. */
  onSelect: () => void;
  icon?: React.ReactNode;
  secondary?: string;
  sx?: SxProps<Theme>;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  current,
  onSelect,
  icon,
  secondary,
  sx,
}) => (
  <ListItemButton
    sx={sx}
    selected={current}
    aria-current={current ? 'page' : undefined}
    onClick={onSelect}
  >
    {icon && <ListItemIcon>{icon}</ListItemIcon>}
    <ListItemText primary={label} secondary={secondary} />
  </ListItemButton>
);

interface GoalSettingsSidebarProps {
  /**
   * Whether this is a scenario goal. Scenario goals intentionally omit the
   * "Presenting Your Goal" navigation item.
   */
  isScenario?: boolean;
}

export const GoalSettingsSidebar: React.FC<GoalSettingsSidebarProps> = ({
  isScenario = false,
}) => {
  const { t } = useTranslation();
  const { view, setView } = useGoalSettingsView();

  return (
    <List disablePadding component="nav" aria-label={t('Goal navigation')}>
      {/* TODO(MPDX-9821): Wire up the Back to Table destination. */}
      <ListItemButton sx={{ color: 'primary.main' }}>
        <ListItemIcon sx={{ minWidth: 'auto', mr: 1, color: 'inherit' }}>
          <ChevronLeftIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={t('Back to Table')}
          slotProps={{
            primary: {
              variant: 'body2',
              sx: { textTransform: 'uppercase' },
            },
          }}
        />
      </ListItemButton>

      <Divider />

      <NavItem
        current={view === GoalSettingsViewEnum.GoalSettings}
        onSelect={() => setView(GoalSettingsViewEnum.GoalSettings)}
        icon={<SettingsIcon />}
        label={t('Goal Settings')}
        secondary={t('Editable by Admins, Coordinators, and Coaches')}
      />

      <Divider />

      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-label={t('Staff Documents')}
          sx={{
            '.MuiAccordionSummary-content': {
              alignItems: 'center',
            },
          }}
        >
          <ListItemIcon>
            <DescriptionOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('Staff Documents')}
            secondary={t('Staff views generated from Goal Settings')}
          />
        </AccordionSummary>
        <AccordionDetails>
          <List disablePadding>
            <NavItem
              current={view === GoalSettingsViewEnum.ReviewYourGoal}
              onSelect={() => setView(GoalSettingsViewEnum.ReviewYourGoal)}
              label={t('Review Your Goal')}
              sx={{ pl: 6 }}
            />
            {!isScenario && (
              <NavItem
                current={view === GoalSettingsViewEnum.PresentYourGoal}
                onSelect={() => setView(GoalSettingsViewEnum.PresentYourGoal)}
                label={t('Presenting Your Goal')}
                sx={{ pl: 6 }}
              />
            )}
          </List>
        </AccordionDetails>
      </Accordion>
    </List>
  );
};
