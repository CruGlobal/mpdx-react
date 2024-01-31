import React from 'react';
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  SelectAllBox,
  StyledEmail,
  StyledSmartphone,
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableHeadSelectCell,
  StyledTableRow,
  StyledTask,
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
              <StyledSmartphone />
              <Box>{t('In App')}</Box>
            </StyledTableHeadCell>
            <StyledTableHeadCell align="right">
              <StyledEmail />
              <Box>{t('Email')}</Box>
            </StyledTableHeadCell>
            <StyledTableHeadCell align="right">
              <StyledTask />
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
