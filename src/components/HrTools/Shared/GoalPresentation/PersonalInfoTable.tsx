import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import cruLogo from 'src/images/cru/cru-logo.svg';
import theme from 'src/theme';

const StyledTableCell = styled(TableCell)({
  border: 'none',
  paddingBlock: theme.spacing(2),
});

interface PersonalInfoTableProps {
  firstName: string;
  spouseFirstName?: string | null;
  lastName: string;
  ministryLocation?: string;
}

/**
 * Personal information table shown on the goal presentation pages. Renders
 * the staff member's name, mission agency, and ministry location with the
 * Cru logo to the right of the first row.
 */
export const PersonalInfoTable: React.FC<PersonalInfoTableProps> = ({
  firstName,
  spouseFirstName,
  lastName,
  ministryLocation,
}) => {
  const { t } = useTranslation();

  const fullName = spouseFirstName
    ? `${firstName} ${t('and')} ${spouseFirstName} ${lastName}`
    : `${firstName} ${lastName}`;

  const rows = [
    { label: t('Name'), value: fullName },
    {
      label: t('Mission Agency'),
      value: t('Campus Crusade for Christ, Inc.'),
    },
    {
      label: t('Ministry Team / Location'),
      value: ministryLocation,
    },
  ];

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small">
        <TableBody>
          {rows.map((item, index) => (
            <TableRow key={item.label}>
              <StyledTableCell>
                <Typography variant="body1" fontWeight="bold">
                  {item.label}
                </Typography>
              </StyledTableCell>
              <StyledTableCell data-testid="value-typography">
                {item.value}
              </StyledTableCell>
              {index === 0 && (
                <StyledTableCell
                  sx={{ textAlign: 'center' }}
                  rowSpan={rows.length}
                >
                  <img
                    data-testid="cru-logo"
                    src={cruLogo}
                    alt={t('Campus Crusade for Christ, Inc. logo')}
                    style={{ width: 150, height: 'auto' }}
                  />
                </StyledTableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
