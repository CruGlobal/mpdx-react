import React from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Skeleton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  StyledTableHeadCell,
  StyledTableHeadSelectCell,
  StyledTableCell,
  StyledTableRow,
  StyledSmartphoneIcon,
  StyledEmailIcon,
  StyledTaskIcon,
  SelectAllBox,
} from './NotificationsTable';

export const NotificationsTableSkeleton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table
        sx={{ minWidth: 700 }}
        stickyHeader
        aria-label="Notifications table"
        data-testid="skeleton-notifications"
      >
        <TableHead>
          <TableRow>
            <StyledTableHeadCell>
              {t("Select the types of notifications you'd like to receive")}
            </StyledTableHeadCell>
            <StyledTableHeadCell align="right">
              <StyledSmartphoneIcon />
              <Box>{t('In App')}</Box>
            </StyledTableHeadCell>
            <StyledTableHeadCell align="right">
              <StyledEmailIcon />
              <Box>{t('Email')}</Box>
            </StyledTableHeadCell>
            <StyledTableHeadCell align="right">
              <StyledTaskIcon />
              <Box>{t('Task')}</Box>
            </StyledTableHeadCell>
          </TableRow>
          <TableRow>
            <StyledTableHeadSelectCell
              component="th"
              scope="row"
            ></StyledTableHeadSelectCell>
            <StyledTableHeadSelectCell align="right">
              <SelectAllBox> {t('select all')} </SelectAllBox>
            </StyledTableHeadSelectCell>
            <StyledTableHeadSelectCell align="right">
              <SelectAllBox> {t('select all')} </SelectAllBox>
            </StyledTableHeadSelectCell>
            <StyledTableHeadSelectCell align="right">
              <SelectAllBox> {t('select all')} </SelectAllBox>
            </StyledTableHeadSelectCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {new Array(5).fill(0).map((_, idx) => (
            <StyledTableRow key={`skeleton-${idx}`}>
              <StyledTableCell>
                <Skeleton height={'50px'} />
              </StyledTableCell>
              <StyledTableCell>
                <Skeleton height={'50px'} />
              </StyledTableCell>
              <StyledTableCell>
                <Skeleton height={'50px'} />
              </StyledTableCell>
              <StyledTableCell>
                <Skeleton height={'50px'} />
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
