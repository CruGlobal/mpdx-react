import React from 'react';
import SwipeIcon from '@mui/icons-material/Swipe';
import { TableContainer, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  minWidth: 600,
  // On narrow screens, scroll the table inside the card and keep the label
  // column pinned so each row stays readable while the other columns scroll.
  // The table sizes to its content, so only the labels wrap and the date
  // headers stay on one line.
  [theme.breakpoints.down('md')]: {
    minWidth: 0,
    '.MuiTable-root': {
      width: 'max-content',
      minWidth: '100%',
    },
    '.MuiTableCell-root:not([colspan])': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    '.MuiTableCell-root:first-of-type:not([colspan])': {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      width: 120,
      backgroundColor: theme.palette.background.paper,
      boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
    },
  },
}));

const ScrollHint = styled(Typography)(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0, 1, 1),
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
}));

interface ScrollableTableContainerProps {
  children: React.ReactNode;
}

export const ScrollableTableContainer: React.FC<
  ScrollableTableContainerProps
> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <>
      <ScrollHint variant="body2" color="textSecondary">
        <SwipeIcon fontSize="small" />
        {t('Scroll sideways to see more columns.')}
      </ScrollHint>
      <StyledTableContainer>{children}</StyledTableContainer>
    </>
  );
};
