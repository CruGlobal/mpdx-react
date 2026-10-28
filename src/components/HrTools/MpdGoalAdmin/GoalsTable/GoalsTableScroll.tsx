import React from 'react';
import SwipeIcon from '@mui/icons-material/Swipe';
import { TableContainer, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// Matches MUI's padding="checkbox" cell width, so the Name column can pin beside it.
const checkboxColumnWidth = 48;

const pinnedCells =
  '.MuiTableRow-root > .MuiTableCell-root:nth-of-type(-n + 2)';

/** On phones, pins the checkbox and Name columns while the rest scroll sideways. */
const PinnedColumnsContainer = styled(TableContainer)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '.MuiTableCell-root': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    [pinnedCells]: {
      position: 'sticky',
      zIndex: 1,
      backgroundColor: theme.palette.background.paper,
    },
    '.MuiTableRow-root > .MuiTableCell-root:nth-of-type(1)': {
      left: 0,
      width: checkboxColumnWidth,
      minWidth: checkboxColumnWidth,
      maxWidth: checkboxColumnWidth,
      paddingLeft: 0,
      paddingRight: 0,
    },
    '.MuiTableRow-root > .MuiTableCell-root:nth-of-type(2)': {
      left: checkboxColumnWidth,
      minWidth: 120,
      boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
    },
    // The pinned cells' solid background would otherwise hide the row tint.
    [`.MuiTableRow-hover:hover > .MuiTableCell-root:nth-of-type(-n + 2)`]: {
      backgroundImage: `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
    },
    [`.MuiTableRow-root.Mui-selected > .MuiTableCell-root:nth-of-type(-n + 2)`]:
      {
        backgroundImage: `linear-gradient(${alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        )}, ${alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        )})`,
      },
  },
}));

const ScrollHintText = styled(Typography)(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  // Stays in view while the table scrolls sideways inside the container.
  position: 'sticky',
  left: 0,
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
  '@media print': {
    display: 'none',
  },
}));

interface GoalsTableContainerProps {
  children: React.ReactNode;
}

export const GoalsTableContainer: React.FC<GoalsTableContainerProps> = ({
  children,
}) => {
  const { t } = useTranslation();

  return (
    <PinnedColumnsContainer>
      <ScrollHintText variant="body2" color="text.secondary">
        <SwipeIcon fontSize="small" />
        {t('Scroll sideways to see goal status, coach, and actions.')}
      </ScrollHintText>
      {children}
    </PinnedColumnsContainer>
  );
};
