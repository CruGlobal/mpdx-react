import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GoalCalculatorReportEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';

const categoryListItemStyles: SxProps<Theme> = (theme) => ({
  '.MuiSvgIcon-root': {
    fontSize: '1rem',
  },
  padding: 0,
  paddingLeft: theme.spacing(3),
});

const CategoryListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(0.5),
}));

interface ListItemContentProps {
  title: string;
  complete: boolean;
  onClick?: () => void;
}

const ListItemContent: React.FC<ListItemContentProps> = ({
  title,
  complete,
  onClick,
}) => (
  <>
    <CategoryListItemIcon
      sx={(theme) => ({
        color: complete
          ? theme.palette.mpdxBlue.main
          : theme.palette.cruGrayDark.main,
        cursor: onClick ? 'pointer' : 'default',
      })}
      onClick={onClick}
    >
      {complete ? <CircleIcon /> : <RadioButtonUncheckedIcon />}
    </CategoryListItemIcon>
    <ListItemText
      primary={title}
      primaryTypographyProps={{ variant: 'body2' }}
      onClick={onClick}
      sx={onClick ? { cursor: 'pointer' } : {}}
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
  const { scrollToSection } = useGoalCalculator();

  return (
    <List disablePadding>
      {sections.map(({ title, complete }, index) => (
        <ListItem key={index} sx={categoryListItemStyles}>
          <ListItemContent
            title={title}
            complete={complete}
            onClick={() => scrollToSection(title)}
          />
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
      title: t('Salary Request'),
      report: GoalCalculatorReportEnum.SalaryRequest,
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
            sx={categoryListItemStyles}
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
