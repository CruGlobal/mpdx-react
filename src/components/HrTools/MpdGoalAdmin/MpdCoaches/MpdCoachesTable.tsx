import React from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { coachLabel } from '../../Shared/AssignCoach/coachHelpers';
import { NewStaffMpdCoachesQuery } from './MpdCoaches.generated';

export type MpdCoachRow = NewStaffMpdCoachesQuery['newStaffMpdCoaches'][number];

interface MpdCoachesTableProps {
  coaches: MpdCoachRow[];
  onRemove: (coach: MpdCoachRow) => void;
}

export const MpdCoachesTable: React.FC<MpdCoachesTableProps> = ({
  coaches,
  onRemove,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <TableContainer>
      <Table size="small" aria-label={t('MPD coaches')}>
        <TableHead>
          <TableRow>
            <TableCell>{t('Name')}</TableCell>
            <TableCell>{t('Email')}</TableCell>
            <TableCell>{t('Added By')}</TableCell>
            <TableCell>{t('Added On')}</TableCell>
            <TableCell>{t('Actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coaches.map((coach) => {
            const name = coachLabel(coach, t);
            return (
              <TableRow key={coach.id} hover>
                <TableCell>{name}</TableCell>
                <TableCell>{coach.email || '—'}</TableCell>
                <TableCell>{coach.addedByName || '—'}</TableCell>
                <TableCell>
                  {dateFormatShort(DateTime.fromISO(coach.createdAt), locale)}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    aria-label={t('Remove {{name}}', { name })}
                    onClick={() => onRemove(coach)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
