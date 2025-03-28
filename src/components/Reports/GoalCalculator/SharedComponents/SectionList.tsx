import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CategoryListItemIcon,
  CategoryListItemStyles,
} from 'src/components/Reports/Shared/CalculationReports/Shared/styledComponents/StepsListStyles';
import { GoalCalculatorReportEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';

interface ListItemContentProps {
  title: string;
  complete: boolean;
}

const ListItemContent: React.FC<ListItemContentProps> = ({
  title,
  complete,
}) => (
  <>
    <CategoryListItemIcon
      sx={(theme) => ({
        color: complete
          ? theme.palette.mpdxBlue.main
          : theme.palette.mpdxGrayDark.main,
      })}
    >
      {complete ? <CircleIcon /> : <RadioButtonUncheckedIcon />}
    </CategoryListItemIcon>
    <ListItemText
      primary={title}
      primaryTypographyProps={{ variant: 'body2' }}
    />
  </>
);

export interface SectionItem {
  title: string;
  complete: boolean;
}

interface SectionListProps {
  sections: SectionItem[];
}

export const SectionList: React.FC<SectionListProps> = ({ sections }) => {
  return (
    <List disablePadding>
      {sections.map(({ title, complete }, index) => (
        <ListItem key={index} sx={CategoryListItemStyles}>
          <ListItemContent title={title} complete={complete} />
        </ListItem>
      ))}
    </List>
  );
};

export const ReportSectionList: React.FC = () => {
  const { t } = useTranslation();
  const { selectedReport, setSelectedReport } = useGoalCalculator();

  const sections = [
    {
      title: t('MPD Goal'),
      report: GoalCalculatorReportEnum.MpdGoal,
    },
    {
      title: t('Presenting Your Goal'),
      report: GoalCalculatorReportEnum.PresentingYourGoal,
    },
  ];

  return (
    <List disablePadding>
      {sections.map(({ title, report }, index) => {
        const active = selectedReport === report;
        return (
          <ListItemButton
            key={index}
            sx={CategoryListItemStyles}
            aria-current={active}
            onClick={() => setSelectedReport(report)}
          >
            <ListItemContent title={title} complete={active} />
          </ListItemButton>
        );
      })}
    </List>
  );
};
